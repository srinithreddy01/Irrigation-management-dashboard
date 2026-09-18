/* ============================================================================
   AquaFarm - Smart Irrigation Management Dashboard
   Application script: simulated sensor gateway, irrigation rule engine,
   charts, scheduling, alerts, settings and UI wiring.
   ----------------------------------------------------------------------------
   All sensor readings are generated in the browser for demonstration purposes.
   Nothing in this file talks to real hardware, a server or a paid API.
   ========================================================================== */
(function () {
  "use strict";

  /* ==========================================================================
     1. CONFIGURATION
     ========================================================================== */
  var CONFIG = {
    simIntervalDefault: 5000,      // sensor update interval in milliseconds
    countdownInterval: 1000,       // "next update" countdown refresh
    scheduleCheckInterval: 15000,  // how often scheduled tasks are evaluated
    clockInterval: 1000,           // "last updated" label refresh
    pumpFlowLitresPerMinute: 30,   // simulated pump flow rate
    estimateLitresPerMinute: 17.8, // used for recommendation water estimate
    toastDuration: 5200,
    alertCooldownMs: 5 * 60 * 1000,
    autoStopMargin: 4,             // hysteresis above threshold for automatic stop
    randomSeed: 20260918
  };

  var STORAGE_KEYS = {
    settings: "aquafarm.settings.v1",
    alerts: "aquafarm.alerts.v1",
    activity: "aquafarm.activity.v1",
    schedules: "aquafarm.schedules.v1",
    pump: "aquafarm.pump.v1",
    counters: "aquafarm.counters.v1",
    prefs: "aquafarm.prefs.v1"
  };

  var DEFAULT_SETTINGS = {
    threshold: 30,
    autoIrrigation: false,
    notifications: true,
    tankCapacity: 5000,
    units: "metric"
  };

  var MODE_HELP = {
    Manual: "Manual mode only runs the pump when you start it.",
    Automatic: "Automatic mode starts the pump when soil moisture falls below the threshold and stops it when moisture recovers.",
    Scheduled: "Scheduled mode runs pump sessions created in the irrigation schedule."
  };

  var SEVERITY = {
    critical: { label: "Critical", icon: "fa-circle-exclamation" },
    warning: { label: "Warning", icon: "fa-triangle-exclamation" },
    success: { label: "Success", icon: "fa-circle-check" },
    info: { label: "Information", icon: "fa-circle-info" }
  };

  /* ==========================================================================
     2. SMALL UTILITIES
     ========================================================================== */
  function $(selector, scope) { return (scope || document).querySelector(selector); }
  function $$(selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function round(value, decimals) {
    var factor = Math.pow(10, decimals == null ? 0 : decimals);
    return Math.round(value * factor) / factor;
  }
  function randomBetween(min, max) { return min + Math.random() * (max - min); }

  /* Deterministic pseudo random generator so historical charts stay stable
     between page loads while still looking natural. */
  function createRandom(seed) {
    var state = seed >>> 0;
    return function () {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }
  var seededRandom = createRandom(CONFIG.randomSeed);

  function formatNumber(value, decimals) {
    var number = Number(value);
    if (!isFinite(number)) { return "--"; }
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: decimals || 0,
      maximumFractionDigits: decimals == null ? 0 : decimals
    }).format(number);
  }

  function formatDateTime(date) {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true
    }).format(date);
  }

  function toISODate(date) {
    var local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function relativeTime(date) {
    var seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
    if (seconds < 10) { return "Just now"; }
    if (seconds < 60) { return seconds + " seconds ago"; }
    var minutes = Math.round(seconds / 60);
    if (minutes < 60) { return minutes === 1 ? "1 minute ago" : minutes + " minutes ago"; }
    var hours = Math.round(minutes / 60);
    if (hours < 24) { return hours === 1 ? "1 hour ago" : hours + " hours ago"; }
    return formatDateTime(date);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function uid(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  /* ==========================================================================
     3. SAFE STORAGE LAYER (localStorage with graceful failure)
     ========================================================================== */
  var Store = {
    available: (function () {
      try {
        var probe = "__aquafarm_probe__";
        window.localStorage.setItem(probe, "1");
        window.localStorage.removeItem(probe);
        return true;
      } catch (error) {
        return false;
      }
    })(),

    read: function (key, fallback) {
      if (!this.available) { return fallback; }
      try {
        var raw = window.localStorage.getItem(key);
        if (!raw) { return fallback; }
        var parsed = JSON.parse(raw);
        return parsed == null ? fallback : parsed;
      } catch (error) {
        return fallback;
      }
    },

    write: function (key, value) {
      if (!this.available) { return false; }
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        toast("error", "Storage unavailable", "Your browser blocked local storage, so this change will not be remembered.");
        return false;
      }
    },

    remove: function (key) {
      if (!this.available) { return; }
      try { window.localStorage.removeItem(key); } catch (error) { /* ignore */ }
    },

    clearAll: function () {
      Object.keys(STORAGE_KEYS).forEach(function (name) { Store.remove(STORAGE_KEYS[name]); }, this);
    }
  };

  /* ==========================================================================
     4. APPLICATION STATE
     ========================================================================== */
  var state = {
    settings: Object.assign({}, DEFAULT_SETTINGS),
    fields: [
      {
        id: "A", name: "Field A", crop: "Rice", stage: "Vegetative", area: 2.5,
        moisture: 42, band: [40, 60], sensor: "AF-01",
        image: "assets/images/field-rice.jpg", thumb: "assets/images/thumb-rice.jpg"
      },
      {
        id: "B", name: "Field B", crop: "Tomato", stage: "Flowering", area: 1.5,
        moisture: 28, band: [35, 55], sensor: "AF-02",
        image: "assets/images/field-tomato.jpg", thumb: "assets/images/thumb-tomato.jpg"
      },
      {
        id: "C", name: "Field C", crop: "Cotton", stage: "Squaring", area: 3,
        moisture: 51, band: [40, 60], sensor: "AF-03",
        image: "assets/images/field-cotton.jpg", thumb: "assets/images/thumb-cotton.jpg"
      }
    ],
    sensors: {
      soilMoisture: 42,
      temperature: 28,
      humidity: 64,
      tankPercent: 76,
      waterUsedToday: 1240,
      windSpeed: 12,
      rainChance: 20,
      condition: "Partly Cloudy",
      forecast: { morning: 26, afternoon: 30, evening: 27 }
    },
    pump: {
      on: false,
      mode: "Manual",
      fieldId: "A",
      startedAt: null,
      plannedMinutes: null,
      sessionWater: 0
    },
    alerts: [],
    activity: [],
    schedules: [],
    recommendation: { dismissed: false, visible: true },
    simulation: {
      running: true,
      intervalMs: CONFIG.simIntervalDefault,
      outages: false,
      updates: 0,
      lastUpdated: new Date(),
      nextUpdateAt: Date.now() + CONFIG.simIntervalDefault,
      history: { soil24h: [], soil7d: [], soil30d: [], water7d: [] }
    },
    counters: {
      sessionsToday: 6,
      waterSavedPercent: 18,
      previousWeekLitres: 8750
    },
    ui: {
      activityFilters: { fieldId: "", status: "", search: "" },
      alertFilter: "all",
      soilRange: "24h",
      pendingResetConfirm: false
    },
    charts: { soil: null, water: null, field: null }
  };

  var timers = { sim: null, clock: null, schedule: null };
  var alertCooldowns = {};
  var analytics = { events: [] };

  /* ==========================================================================
     5. UNIT FORMATTING
     ========================================================================== */
  var UNITS = {
    metric: { temp: "\u00B0C", volume: "L", flow: "L/min", speed: "km/h", distance: "cm" },
    imperial: { temp: "\u00B0F", volume: "gal", flow: "gal/min", speed: "mph", distance: "in" }
  };

  function isImperial() { return state.settings.units === "imperial"; }

  function convertTemp(celsius) { return isImperial() ? (celsius * 9 / 5) + 32 : celsius; }
  function convertVolume(litres) { return isImperial() ? litres * 0.264172 : litres; }
  function convertFlow(litresPerMinute) { return isImperial() ? litresPerMinute * 0.264172 : litresPerMinute; }
  function convertSpeed(kmh) { return isImperial() ? kmh * 0.621371 : kmh; }

  function unitLabel(kind) { return UNITS[isImperial() ? "imperial" : "metric"][kind]; }

  function formatTemp(celsius, decimals) { return formatNumber(convertTemp(celsius), decimals == null ? 0 : decimals); }
  function formatVolume(litres, decimals) {
    var value = convertVolume(litres);
    return formatNumber(value, decimals == null ? (isImperial() ? 1 : 0) : decimals);
  }
  function formatFlow(litresPerMinute) { return formatNumber(convertFlow(litresPerMinute), isImperial() ? 1 : 0); }

  /* Refresh every element that displays a unit label after a settings change. */
  function applyUnitLabels() {
    $$("[data-unit]").forEach(function (node) {
      var kind = node.getAttribute("data-unit");
      var label = unitLabel(kind);
      if (label) { node.textContent = label; }
    });
  }

  /* ==========================================================================
     6. FORMATTING HELPERS FOR DISPLAY
     ========================================================================== */
  function fieldById(id) {
    for (var i = 0; i < state.fields.length; i++) {
      if (state.fields[i].id === id) { return state.fields[i]; }
    }
    return null;
  }

  function averageFieldMoisture() {
    if (!state.fields.length) { return 0; }
    var total = state.fields.reduce(function (sum, field) { return sum + field.moisture; }, 0);
    return total / state.fields.length;
  }

  function totalFarmArea() {
    return state.fields.reduce(function (sum, field) { return sum + field.area; }, 0);
  }

  function tankLitres() {
    return state.settings.tankCapacity * (state.sensors.tankPercent / 100);
  }

  function fieldHealth(field) {
    if (field.moisture < field.band[0]) { return { key: "critical", label: "Needs Water", tone: "danger" }; }
    if (field.moisture > field.band[1]) { return { key: "warning", label: "Monitor", tone: "warning" }; }
    return { key: "healthy", label: "Healthy", tone: "success" };
  }

  function fieldIrrigationState(field) {
    if (state.pump.on && state.pump.fieldId === field.id) { return "Running"; }
    return field.moisture < state.settings.threshold ? "Recommended" : "Not Required";
  }

  function sensorStatusFor(field) {
    if (state.simulation.outages) { return { label: "Offline", tone: "danger" }; }
    if (field.id === state.pump.fieldId && state.pump.on) { return { label: "Irrigating", tone: "info" }; }
    return { label: "Online", tone: "success" };
  }

  function soilStatusText(moisture) {
    if (moisture < state.settings.threshold) { return { text: "Low", tone: "danger" }; }
    if (moisture < state.settings.threshold + 8) { return { text: "Monitor", tone: "warning" }; }
    return { text: "Optimal", tone: "success" };
  }

  function temperatureStatusText(celsius) {
    if (celsius >= 36) { return { text: "High", tone: "danger" }; }
    if (celsius >= 33) { return { text: "Warm", tone: "warning" }; }
    if (celsius <= 15) { return { text: "Cool", tone: "info" }; }
    return { text: "Normal", tone: "success" };
  }

  function humidityStatusText(humidity) {
    if (humidity < 40) { return { text: "Low", tone: "warning" }; }
    if (humidity > 85) { return { text: "High", tone: "warning" }; }
    return { text: "Good", tone: "success" };
  }

  function tankStatusText(percent) {
    if (percent < 15) { return { text: "Critical", tone: "danger" }; }
    if (percent < 30) { return { text: "Low", tone: "warning" }; }
    if (percent < 50) { return { text: "Adequate", tone: "info" }; }
    return { text: "Sufficient", tone: "success" };
  }

  /* ==========================================================================
     7. TOAST NOTIFICATIONS
     ========================================================================== */
  function toast(type, title, text) {
    if (type !== "error" && !state.settings.notifications) { return; }
    var region = $("#toastRegion");
    if (!region) { return; }

    var icons = {
      success: "fa-circle-check",
      error: "fa-circle-exclamation",
      warning: "fa-triangle-exclamation",
      info: "fa-circle-info"
    };

    var item = document.createElement("div");
    item.className = "toast-item";
    item.setAttribute("data-type", type);
    item.innerHTML =
      '<span class="toast-item__icon" aria-hidden="true"><i class="fa-solid ' + (icons[type] || icons.info) + '"></i></span>' +
      '<div class="toast-item__body">' +
        '<p class="toast-item__title">' + escapeHtml(title) + "</p>" +
        (text ? '<p class="toast-item__text">' + escapeHtml(text) + "</p>" : "") +
      "</div>" +
      '<button type="button" class="toast-item__close" aria-label="Dismiss notification"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>';

    region.appendChild(item);

    var close = function () {
      if (!item.parentNode) { return; }
      item.classList.add("is-leaving");
      window.setTimeout(function () { if (item.parentNode) { item.parentNode.removeChild(item); } }, 220);
    };

    $(".toast-item__close", item).addEventListener("click", close);

    // Let clicks pass through to the dashboard after a short reading delay,
    // while the small close button stays usable.
    window.setTimeout(function () { item.classList.add("is-passive"); }, 1000);

    window.setTimeout(close, CONFIG.toastDuration);

    // Keep the visible stack short
    var items = $$(".toast-item", region);
    if (items.length > 3) { items[0].parentNode.removeChild(items[0]); }
  }

  /* ==========================================================================
     8. ANALYTICS (local, in-memory demonstration event log)
     ========================================================================== */
  function track(eventName, payload) {
    analytics.events.push({ event: eventName, at: new Date().toISOString(), payload: payload || null });
    if (analytics.events.length > 300) { analytics.events.shift(); }
  }
  window.AquaFarmAnalytics = {
    events: analytics.events,
    summary: function () {
      var counts = {};
      analytics.events.forEach(function (item) { counts[item.event] = (counts[item.event] || 0) + 1; });
      return counts;
    }
  };

  /* ==========================================================================
     9. ALERT MANAGEMENT
     ========================================================================== */
  function addAlert(options) {
    var severity = SEVERITY[options.severity] ? options.severity : "info";
    var key = options.key || (severity + ":" + options.title);

    if (key && alertCooldowns[key] && (Date.now() - alertCooldowns[key]) < CONFIG.alertCooldownMs) {
      return null;
    }
    if (key && state.alerts.some(function (alert) { return alert.key === key && !alert.read; })) {
      return null;
    }

    var alert = {
      id: uid("alert"),
      severity: severity,
      title: options.title,
      text: options.text,
      fieldId: options.fieldId || null,
      key: key,
      at: new Date().toISOString(),
      read: false
    };
    if (key) { alertCooldowns[key] = Date.now(); }
    state.alerts.unshift(alert);
    if (state.alerts.length > 40) { state.alerts.length = 40; }
    return alert;
  }

  function unreadAlertCount() {
    return state.alerts.filter(function (alert) { return !alert.read; }).length;
  }

  function markAlertRead(id) {
    var alert = state.alerts.filter(function (item) { return item.id === id; })[0];
    if (!alert || alert.read) { return; }
    alert.read = true;
    persistAlerts();
    renderAlerts();
    renderBell();
    track("alert.mark_read", { id: id });
  }

  function dismissAlert(id) {
    state.alerts = state.alerts.filter(function (item) { return item.id !== id; });
    persistAlerts();
    renderAlerts();
    renderBell();
    toast("info", "Alert dismissed", "The notification has been removed from your alert centre.");
    track("alert.dismiss", { id: id });
  }

  function markAllAlertsRead() {
    var changed = 0;
    state.alerts.forEach(function (alert) {
      if (!alert.read) { alert.read = true; changed++; }
    });
    persistAlerts();
    renderAlerts();
    renderBell();
    if (changed) {
      toast("success", "All alerts marked as read", changed + (changed === 1 ? " alert" : " alerts") + " updated.");
    } else {
      toast("info", "Nothing to update", "Every alert is already marked as read.");
    }
    track("alert.mark_all_read", { count: changed });
  }

  function persistAlerts() {
    Store.write(STORAGE_KEYS.alerts, state.alerts.map(function (alert) {
      return { id: alert.id, severity: alert.severity, title: alert.title, text: alert.text,
               fieldId: alert.fieldId, key: alert.key, at: alert.at, read: alert.read };
    }));
  }

  function renderAlerts() {
    var list = $("#alertList");
    var empty = $("#alertEmpty");
    if (!list || !empty) { return; }

    var filter = state.ui.alertFilter;
    var items = state.alerts.filter(function (alert) {
      if (filter === "unread") { return !alert.read; }
      if (filter === "all") { return true; }
      return alert.severity === filter;
    });

    list.innerHTML = items.map(function (alert) {
      var severity = SEVERITY[alert.severity];
      var field = alert.fieldId ? fieldById(alert.fieldId) : null;
      return '' +
        '<li class="alert-item' + (alert.read ? " is-read" : "") + '" data-severity="' + alert.severity + '" data-alert-id="' + alert.id + '">' +
          '<span class="severity severity--' + alert.severity + '" aria-hidden="true"><i class="fa-solid ' + severity.icon + '"></i></span>' +
          '<div class="alert-item__body">' +
            '<div class="alert-item__head">' +
              '<p class="alert-item__title">' + escapeHtml(alert.title) + "</p>" +
              '<span class="severity-chip severity-chip--' + alert.severity + '">' + severity.label + "</span>" +
              (alert.read ? "" : '<span class="count-chip">Unread</span>') +
            "</div>" +
            '<p class="alert-item__text">' + escapeHtml(alert.text) + "</p>" +
            '<p class="alert-item__meta">' +
              '<span><i class="fa-regular fa-clock" aria-hidden="true"></i>' + escapeHtml(relativeTime(new Date(alert.at))) + "</span>" +
              (field ? '<span><i class="fa-solid fa-seedling" aria-hidden="true"></i>' + escapeHtml(field.name) + " - " + escapeHtml(field.crop) + "</span>" : "") +
            "</p>" +
          "</div>" +
          '<div class="alert-item__actions">' +
            (alert.read ? "" : '<button class="btn btn--ghost btn--sm" type="button" data-action="read" data-alert-id="' + alert.id + '"><i class="fa-solid fa-check" aria-hidden="true"></i><span>Mark read</span></button>') +
            '<button class="btn btn--ghost btn--sm" type="button" data-action="dismiss" data-alert-id="' + alert.id + '"><i class="fa-solid fa-xmark" aria-hidden="true"></i><span>Dismiss</span></button>' +
          "</div>" +
        "</li>";
    }).join("");

    empty.hidden = items.length > 0;
    list.hidden = items.length === 0;
    if (!items.length) {
      var title = $("#alertEmpty .empty-state__title");
      var text = $("#alertEmpty .empty-state__text");
      if (filter === "unread") {
        title.textContent = "No unread alerts";
        text.textContent = "Every alert has been reviewed. New alerts appear here when a simulated threshold is crossed.";
      } else if (filter === "all") {
        title.textContent = "No alerts";
        text.textContent = "Nothing needs your attention right now. New alerts appear here when a simulated threshold is crossed.";
      } else {
        title.textContent = "No " + filter + " alerts";
        text.textContent = "No alerts of this severity have been raised in this session.";
      }
    }
  }

  function renderBell() {
    var unread = unreadAlertCount();
    var dot = $("#bellDot");
    var count = $("#bellCount");
    var navBadge = $("#navAlertBadge");
    var list = $("#bellList");

    if (dot) { dot.hidden = unread === 0; }
    if (count) {
      count.hidden = unread === 0;
      count.textContent = unread > 9 ? "9+" : String(unread);
    }
    if (navBadge) {
      navBadge.hidden = unread === 0;
      navBadge.textContent = unread > 9 ? "9+" : String(unread);
    }
    if (!list) { return; }

    var recent = state.alerts.slice(0, 5);
    if (!recent.length) {
      list.innerHTML = '<div class="mini-alert"><div class="mini-alert__body"><p class="mini-alert__text">No notifications yet.</p></div></div>';
      return;
    }
    list.innerHTML = recent.map(function (alert) {
      var severity = SEVERITY[alert.severity];
      return '' +
        '<div class="mini-alert' + (alert.read ? " is-read" : "") + '" data-alert-id="' + alert.id + '" role="button" tabindex="0" aria-label="Alert: ' + escapeHtml(alert.title) + '">' +
          '<span class="severity severity--' + alert.severity + '" aria-hidden="true"><i class="fa-solid ' + severity.icon + '"></i></span>' +
          '<div class="mini-alert__body">' +
            '<p class="mini-alert__title">' + escapeHtml(alert.title) + "</p>" +
            '<p class="mini-alert__text">' + escapeHtml(alert.text) + "</p>" +
            '<p class="mini-alert__time">' + escapeHtml(relativeTime(new Date(alert.at))) + "</p>" +
          "</div>" +
        "</div>";
    }).join("");
  }

  /* ==========================================================================
     10. ACTIVITY LOG
     ========================================================================== */
  function addActivity(record) {
    state.activity.unshift({
      id: uid("act"),
      at: record.at || new Date().toISOString(),
      fieldId: record.fieldId,
      durationMin: record.durationMin,
      waterL: record.waterL,
      mode: record.mode,
      status: record.status
    });
    if (state.activity.length > 80) { state.activity.length = 80; }
    persistActivity();
  }

  function persistActivity() {
    Store.write(STORAGE_KEYS.activity, state.activity);
  }

  function activityDateLabel(date) {
    var today = new Date();
    var yesterday = new Date(today.getTime() - 86400000);
    var time = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
    if (toISODate(date) === toISODate(today)) { return "Today " + time; }
    if (toISODate(date) === toISODate(yesterday)) { return "Yesterday " + time; }
    return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(date);
  }

  function statusBadge(status) {
    var map = {
      Completed: { tone: "success", icon: "fa-circle-check" },
      Running: { tone: "info", icon: "fa-satellite-dish" },
      Scheduled: { tone: "neutral", icon: "fa-clock" },
      Stopped: { tone: "warning", icon: "fa-circle-stop" }
    };
    var meta = map[status] || map.Completed;
    return '<span class="badge-status is-tone-' + meta.tone + '"><i class="fa-solid ' + meta.icon + '" aria-hidden="true"></i>' + escapeHtml(status) + "</span>";
  }

  function modeBadge(mode) {
    var tone = mode === "Automatic" ? "info" : (mode === "Scheduled" ? "neutral" : "warning");
    return '<span class="badge-mode is-tone-' + tone + '">' + escapeHtml(mode) + "</span>";
  }

  function renderActivity() {
    var body = $("#activityTableBody");
    var empty = $("#activityEmpty");
    var countChip = $("#activityCount");
    if (!body || !empty) { return; }

    var filters = state.ui.activityFilters;
    var search = filters.search.trim().toLowerCase();

    var rows = state.activity.filter(function (item) {
      var field = fieldById(item.fieldId);
      if (filters.fieldId && item.fieldId !== filters.fieldId) { return false; }
      if (filters.status && item.status !== filters.status) { return false; }
      if (search) {
        var haystack = [
          field ? field.name : "", field ? field.crop : "",
          item.mode, item.status, activityDateLabel(new Date(item.at))
        ].join(" ").toLowerCase();
        if (haystack.indexOf(search) === -1) { return false; }
      }
      return true;
    });

    body.innerHTML = rows.map(function (item) {
      var field = fieldById(item.fieldId);
      return '' +
        "<tr>" +
          '<td data-label="Date" class="data-table__date">' + escapeHtml(activityDateLabel(new Date(item.at))) + "</td>" +
          '<td data-label="Field"><span class="data-table__field"><i class="fa-solid fa-seedling" aria-hidden="true"></i>' + escapeHtml(field ? field.name : "Unknown") + "</span></td>" +
          '<td data-label="Duration" class="data-table__num">' + formatNumber(item.durationMin) + " min</td>" +
          '<td data-label="Water Used" class="data-table__num">' + formatVolume(item.waterL) + " " + unitLabel("volume") + "</td>" +
          '<td data-label="Mode">' + modeBadge(item.mode) + "</td>" +
          '<td data-label="Status">' + statusBadge(item.status) + "</td>" +
        "</tr>";
    }).join("");

    empty.hidden = rows.length > 0;
    if (!rows.length) {
      var title = $("#activityEmpty .empty-state__title");
      var text = $("#activityEmpty .empty-state__text");
      if (state.activity.length === 0) {
        title.textContent = "No irrigation history";
        text.textContent = "Irrigation sessions you start or schedule will appear here with duration, water used and mode.";
      } else {
        title.textContent = "No matching records";
        text.textContent = "No irrigation activity matches the current filters. Try clearing the search or selecting another field.";
      }
    }
    if (countChip) { countChip.textContent = formatNumber(rows.length) + (rows.length === 1 ? " record" : " records"); }
  }

  /* ==========================================================================
     11. IRRIGATION PUMP CONTROL AND RULE ENGINE
     ========================================================================== */
  function pumpField() { return fieldById(state.pump.fieldId) || state.fields[0]; }

  function startPump(options) {
    var settings = options || {};
    if (state.pump.on) { return; }
    if (state.simulation.outages) {
      toast("error", "Cannot start irrigation", "The sensor gateway is offline. Restore the simulated sensor feed and try again.");
      return;
    }
    var field = fieldById(settings.fieldId || state.pump.fieldId) || state.fields[0];
    if (state.sensors.tankPercent <= 2) {
      toast("error", "Tank empty", "The water tank is empty. Refill the tank before running the pump.");
      addAlert({
        severity: "critical", key: "tank-empty", fieldId: field.id,
        title: "Water tank empty", text: "The tank has reached 0% of capacity. The pump cannot run until the tank is refilled."
      });
      renderAlerts(); renderBell();
      return;
    }

    state.pump.on = true;
    state.pump.fieldId = field.id;
    state.pump.startedAt = new Date();
    state.pump.sessionWater = 0;
    state.pump.plannedMinutes = settings.plannedMinutes || null;
    if (state.pump.plannedMinutes) {
      state.pump.sessionDurationMin = state.pump.plannedMinutes;
    }
    if (!state.pump.sessionDurationMin) { state.pump.sessionDurationMin = null; }
    if (settings.mode) { setMode(settings.mode, true); }

    persistPump();
    addActivity({ fieldId: field.id, durationMin: 0, waterL: 0, mode: state.pump.mode, status: "Running" });
    addAlert({
      severity: "info", key: "pump-start-" + field.id, fieldId: field.id,
      title: "Irrigation started",
      text: "Pump turned ON for " + field.name + " in " + state.pump.mode.toLowerCase() + " mode."
    });
    toast("success", "Irrigation Started", "Pump has been turned ON for " + field.name + ".");
    renderAlerts();
    renderBell();
    renderPump();
    renderRecommendation();
    renderFields();
    renderActivity();
    renderStorageInfo();
    updateChartsLive();
    track("pump.start", { fieldId: field.id, mode: state.pump.mode, automatic: !!settings.automatic });
  }

  function stopPump(reason) {
    if (!state.pump.on) { return; }
    var field = pumpField();
    var startedAt = state.pump.startedAt ? new Date(state.pump.startedAt) : new Date();
    var elapsedMinutes = Math.max(1, Math.round((Date.now() - startedAt.getTime()) / 60000));
    var waterUsed = Math.round(state.pump.sessionWater);
    var wasPlanned = !!state.pump.plannedMinutes;

    state.pump.on = false;
    state.pump.startedAt = null;
    state.pump.sessionWater = 0;
    state.pump.plannedMinutes = null;
    state.pump.sessionDurationMin = null;
    persistPump();

    var running = state.activity.filter(function (item) { return item.status === "Running"; })[0];
    var status = reason === "stopped" ? "Stopped" : "Completed";
    if (running) {
      running.at = new Date().toISOString();
      running.durationMin = elapsedMinutes;
      running.waterL = waterUsed;
      running.status = status;
      running.mode = state.pump.mode;
      persistActivity();
    } else {
      addActivity({ fieldId: field.id, durationMin: elapsedMinutes, waterL: waterUsed, mode: state.pump.mode, status: status });
    }

    if (status === "Completed") {
      state.counters.sessionsToday += 1;
      addAlert({
        severity: "success", key: "irrigation-complete-" + field.id + "-" + Math.floor(Date.now() / 60000), fieldId: field.id,
        title: "Irrigation completed",
        text: field.name + " irrigation completed successfully. " + formatVolume(waterUsed) + " " + unitLabel("volume") + " used in " + elapsedMinutes + " minutes."
      });
      toast("success", "Irrigation Completed",
        field.name + " received " + formatVolume(waterUsed) + " " + unitLabel("volume") + " over " +
        elapsedMinutes + (elapsedMinutes === 1 ? " minute." : " minutes."));
    } else {
      toast("warning", "Irrigation Stopped", "Pump has been turned OFF. " + formatVolume(waterUsed) + " " + unitLabel("volume") + " used in this session.");
    }

    renderPump();
    renderRecommendation();
    renderFields();
    renderActivity();
    renderAlerts();
    renderBell();
    renderStats();
    renderStorageInfo();
    updateChartsLive();
    track("pump.stop", { fieldId: field.id, reason: reason || "manual", minutes: elapsedMinutes, litres: waterUsed });
  }

  function togglePump() {
    if (state.pump.on) { stopPump("stopped"); } else { startPump({ fieldId: state.pump.fieldId }); }
  }

  function setMode(mode, silent) {
    if (!MODE_HELP[mode]) { return; }
    state.pump.mode = mode;
    $$(".segmented__btn").forEach(function (button) {
      var isActive = button.getAttribute("data-mode") === mode;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    var help = $("#modeHelp");
    if (help) { help.textContent = MODE_HELP[mode]; }
    persistPump();
    if (!silent) {
      toast("info", "Irrigation mode updated", "Mode set to " + mode + ".");
      track("mode.change", { mode: mode });
    }
    evaluateRules();
  }

  /* Core demonstration rule: compare soil moisture with the configured threshold. */
  function evaluateRules() {
    var average = averageFieldMoisture();
    var threshold = state.settings.threshold;
    var ruleLine = $("#ruleStatusLine");
    var belowThreshold = average < threshold;

    if (ruleLine) {
      ruleLine.textContent = belowThreshold
        ? "Soil moisture is below the configured threshold (" + average.toFixed(0) + "% < " + threshold + "%). Irrigation is recommended."
        : "Soil moisture is above the configured threshold. Soil moisture is sufficient.";
    }

    // Low moisture alert (per field, so the message is specific)
    state.fields.forEach(function (field) {
      if (field.moisture < threshold) {
        addAlert({
          severity: "critical",
          key: "low-moisture-" + field.id,
          fieldId: field.id,
          title: "Low Soil Moisture",
          text: field.name + " moisture has fallen below the configured threshold (" + field.moisture.toFixed(0) + "% of " + threshold + "%)."
        });
      }
    });

    // Tank level alerts
    if (state.sensors.tankPercent < 30) {
      addAlert({
        severity: state.sensors.tankPercent < 15 ? "critical" : "warning",
        key: state.sensors.tankPercent < 15 ? "tank-critical" : "tank-low",
        title: "Water Tank Level",
        text: "Water tank is below " + (state.sensors.tankPercent < 15 ? "15%" : "30%") + " of capacity. Current level: " + state.sensors.tankPercent.toFixed(0) + "%."
      });
    }

    // Automatic irrigation
    if (state.pump.mode === "Automatic" && state.settings.autoIrrigation) {
      if (!state.pump.on && average < threshold) {
        var driest = state.fields.slice().sort(function (a, b) { return a.moisture - b.moisture; })[0];
        toast("info", "Automatic irrigation triggered", driest.name + " dropped below the " + threshold + "% threshold.");
        startPump({ fieldId: driest.id, mode: "Automatic", automatic: true, plannedMinutes: 25 });
      } else if (state.pump.on && average >= threshold + CONFIG.autoStopMargin) {
        stopPump("completed");
      }
    } else if (state.pump.on && state.pump.plannedMinutes && state.pump.startedAt) {
      // Completed scheduled or timed sessions stop themselves
      var elapsed = (Date.now() - new Date(state.pump.startedAt).getTime()) / 60000;
      if (elapsed >= state.pump.plannedMinutes) { stopPump("completed"); }
    }

    renderAlerts();
    renderBell();
    renderRecommendation();
    persistAlerts();
  }

  /* ==========================================================================
     12. SMART RECOMMENDATION
     ========================================================================== */
  function recommendationData() {
    /* The recommendation follows the selected irrigation target field, so the
       advice always matches the field the pump would water. Calibration at the
       default values (42% moisture, 30% threshold): 18 minutes / 320 L. */
    var threshold = state.settings.threshold;
    var field = fieldById(state.pump.fieldId) || state.fields[0];
    var moisture = field.moisture;
    var advisoryLimit = threshold + 20;              // "irrigation may be required soon"
    var needed = moisture < advisoryLimit;
    var urgent = moisture < threshold;               // below the configured threshold
    var minutes = needed ? clamp(Math.round((advisoryLimit - moisture) * 2.25), 8, 60) : 0;
    var driest = state.fields.slice().sort(function (a, b) { return a.moisture - b.moisture; })[0];
    return {
      needed: needed,
      urgent: urgent,
      field: field,
      moisture: moisture,
      driest: driest,
      minutes: minutes,
      litres: needed ? Math.round(minutes * CONFIG.estimateLitresPerMinute) : 0,
      rainNote: state.sensors.rainChance >= 60
        ? "Rain is expected today, so consider delaying irrigation."
        : ""
    };
  }

  function renderRecommendation() {
    var card = $("#recommendationCard");
    if (!card) { return; }
    var data = recommendationData();
    var headline = $("#recommendationHeadline");
    var text = $("#recommendationText");
    var actions = $("#recommendationActions");
    var duration = $("#recDuration");
    var water = $("#recWater");

    // A dismissed recommendation stays hidden until moisture changes again.
    var dismissed = state.recommendation.dismissed;
    var hidden = dismissed && !data.urgent &&
      Math.abs(data.moisture - (state.recommendation.dismissedAt || 0)) < 2;
    card.classList.toggle("is-dismissed", hidden);

    if (data.needed) {
      headline.textContent = data.urgent ? "Irrigation required" : "Irrigation recommended";
      headline.classList.toggle("is-alert", data.urgent);
      text.textContent = "Current soil moisture is " + formatNumber(data.moisture, 0) + "% in the selected field (" +
        data.field.name + ", " + data.field.crop + "). Based on the selected crop and field conditions, " +
        (data.urgent
          ? "moisture is already below your " + state.settings.threshold + "% threshold, so irrigation should start soon."
          : "irrigation may be required soon.") +
        (data.driest && data.driest.id !== data.field.id && data.driest.moisture < data.field.moisture
          ? " " + data.driest.name + " is drier at " + formatNumber(data.driest.moisture, 0) + "%."
          : "") +
        " Crop target band: " + data.field.band[0] + "-" + data.field.band[1] + "%." +
        (data.rainNote ? " " + data.rainNote : "");
      duration.textContent = formatNumber(data.minutes);
      water.textContent = formatVolume(data.litres);
      actions.hidden = false;
    } else {
      headline.textContent = "Soil Moisture is Sufficient";
      headline.classList.remove("is-alert");
      text.textContent = "Soil moisture in the selected field (" + data.field.name + ") is " +
        formatNumber(data.moisture, 0) + "%, above the " + state.settings.threshold +
        "% threshold and inside the " + data.field.band[0] + "-" + data.field.band[1] +
        "% target band. No irrigation is required at the moment." +
        (data.rainNote ? " " + data.rainNote : "");
      duration.textContent = "--";
      water.textContent = "--";
      actions.hidden = true;
    }
  }

  /* ==========================================================================
     13. RENDERING - DASHBOARD KPIs, STATS, TANK, PUMP, SENSORS
     ========================================================================== */
  function setText(selector, value) {
    var node = $(selector);
    if (node) { node.textContent = value; }
  }

  function setStatusTag(name, status) {
    var tag = $('[data-status="' + name + '"]');
    if (!tag) { return; }
    var textNode = $(".status-tag__text", tag);
    if (textNode) { textNode.textContent = status.text; }
    tag.classList.remove("is-tone-success", "is-tone-warning", "is-tone-danger", "is-tone-info", "is-tone-neutral");
    tag.classList.add("is-tone-" + status.tone);
  }

  function setProgress(name, percent, ariaLabel) {
    var track = $('[data-progress="' + name + '"]');
    if (!track) { return; }
    var safe = clamp(percent, 0, 100);
    track.setAttribute("aria-valuenow", String(Math.round(safe)));
    var fill = $(".progress-track__fill", track);
    if (fill) { fill.style.width = safe + "%"; }
    if (ariaLabel) { track.setAttribute("aria-label", ariaLabel); }
  }

  function renderKpis() {
    var sensors = state.sensors;
    var outages = state.simulation.outages;

    $$("[data-kpi]").forEach(function (card) { card.classList.toggle("is-stale", outages); });

    if (outages) {
      ["soilMoisture", "temperature", "humidity", "tankPercent"].forEach(function (key) {
        $$('[data-bind="' + key + '"]').forEach(function (node) { node.textContent = "--"; });
      });
      setStatusTag("soil", { text: "No data", tone: "neutral" });
      setStatusTag("temp", { text: "No data", tone: "neutral" });
      setStatusTag("humidity", { text: "No data", tone: "neutral" });
      setStatusTag("tank", { text: "No data", tone: "neutral" });
      setProgress("soil", 0); setProgress("temp", 0); setProgress("humidity", 0); setProgress("tank", 0);
      return;
    }

    $$('[data-bind="soilMoisture"]').forEach(function (node) { node.textContent = formatNumber(sensors.soilMoisture, 0); });
    $$('[data-bind="temperature"]').forEach(function (node) { node.textContent = formatTemp(sensors.temperature, 0); });
    $$('[data-bind="humidity"]').forEach(function (node) { node.textContent = formatNumber(sensors.humidity, 0); });
    $$('[data-bind="tankPercent"]').forEach(function (node) { node.textContent = formatNumber(sensors.tankPercent, 0); });
    $$('[data-bind="tankVolume"]').forEach(function (node) { node.textContent = formatVolume(tankLitres()); });
    $$('[data-bind="tankCapacity"]').forEach(function (node) { node.textContent = formatVolume(state.settings.tankCapacity); });
    $$('[data-bind="waterUsedToday"]').forEach(function (node) { node.textContent = formatVolume(sensors.waterUsedToday); });

    var soilStatus = soilStatusText(sensors.soilMoisture);
    setStatusTag("soil", soilStatus);
    setStatusTag("temp", temperatureStatusText(sensors.temperature));
    setStatusTag("humidity", humidityStatusText(sensors.humidity));
    setStatusTag("tank", tankStatusText(sensors.tankPercent));

    setProgress("soil", sensors.soilMoisture, "Soil moisture " + Math.round(sensors.soilMoisture) + " percent");
    setProgress("temp", (sensors.temperature / 45) * 100, "Temperature " + Math.round(sensors.temperature) + " degrees");
    setProgress("humidity", sensors.humidity, "Humidity " + Math.round(sensors.humidity) + " percent");
    setProgress("tank", sensors.tankPercent, "Water tank level " + Math.round(sensors.tankPercent) + " percent");

    setText('[data-hint="soil"]', "Target band " + state.fields[0].band[0] + "-" + state.fields[0].band[1] + "% for Field A");
    setText('[data-hint="tank"]', formatVolume(tankLitres()) + " / " + formatVolume(state.settings.tankCapacity) + " " + unitLabel("volume") + " available");
  }

  function renderStats() {
    setText('[data-bind="totalArea"]', formatNumber(totalFarmArea(), totalFarmArea() % 1 === 0 ? 0 : 1));
    setText('[data-bind="sessionsToday"]', formatNumber(state.counters.sessionsToday));
    setText('[data-bind="waterSaved"]', formatNumber(state.counters.waterSavedPercent));
    setText('[data-bind="waterUsedToday"]', formatVolume(state.sensors.waterUsedToday));
  }

  function renderPump() {
    var pump = state.pump;
    var tag = $("#pumpStatusTag");
    var text = $("#pumpStatusText");
    var toggle = $("#pumpToggle");
    var toggleLabel = $("#pumpToggleLabel");
    var runtime = $("#pumpRuntimeInfo");
    var flow = $("#flowRate");
    var sessionWater = $("#sessionWater");
    var sessionStart = $("#sessionStartText");
    var field = pumpField();

    if (text) { text.textContent = pump.on ? "ON" : "OFF"; }
    if (tag) {
      tag.classList.remove("is-tone-success", "is-tone-neutral");
      tag.classList.add(pump.on ? "is-tone-success" : "is-tone-neutral");
    }

    if (toggle) { toggle.setAttribute("aria-checked", String(pump.on)); }
    if (toggleLabel) { toggleLabel.textContent = pump.on ? "Turn Irrigation OFF" : "Turn Irrigation ON"; }

    if (runtime) {
      if (pump.on) {
        var started = new Date(pump.startedAt).getTime();
        var minutes = Math.floor((Date.now() - started) / 60000);
        var seconds = Math.floor(((Date.now() - started) % 60000) / 1000);
        runtime.textContent = "Pump running for " + field.name + " - " + minutes + "m " + String(seconds).padStart(2, "0") + "s" +
          (pump.plannedMinutes ? " (planned " + pump.plannedMinutes + " min)" : "") + ".";
      } else {
        runtime.textContent = "Pump is idle. No water is being drawn.";
      }
    }

    if (flow) { flow.textContent = pump.on ? formatFlow(CONFIG.pumpFlowLitresPerMinute) : "0"; }
    if (sessionWater) { sessionWater.textContent = formatVolume(pump.sessionWater); }
    if (sessionStart) {
      sessionStart.textContent = pump.on
        ? "Session started at " + formatDateTime(new Date(pump.startedAt)) + " in " + pump.mode.toLowerCase() + " mode."
        : "No active session.";
    }

    // Hero and mobile quick actions
    var quick = $("#quickPumpText");
    var quickBtn = $("#quickPumpBtn");
    if (quick) { quick.textContent = pump.on ? "Stop Irrigation" : "Turn Irrigation ON"; }
    if (quickBtn) { quickBtn.classList.toggle("is-on", pump.on); }
    var mobileText = $("#mobilePumpBtnText");
    if (mobileText) { mobileText.textContent = pump.on ? "Stop Pump" : "Start Pump"; }
    setText("#mobilePumpStatus", pump.on ? "Pump ON - " + field.name : "Pump OFF");
    var mobileTag = $('.mobile-actionbar [data-status="pump"]');
    if (mobileTag) {
      mobileTag.classList.remove("is-tone-success", "is-tone-neutral");
      mobileTag.classList.add(pump.on ? "is-tone-success" : "is-tone-neutral");
    }

    var select = $("#pumpFieldSelect");
    if (select && select.value !== pump.fieldId && !pump.on) { select.value = pump.fieldId; }
    if (select) {
      select.disabled = pump.on;
      select.title = pump.on ? "Stop the pump before changing the target field" : "";
    }

    // Tank draw rate
    setText("#tankDrawRate", pump.on ? formatFlow(CONFIG.pumpFlowLitresPerMinute) : "0");
    var supply = $("#tankSupplyLeft");
    if (supply) {
      if (pump.on && state.sensors.tankPercent > 0) {
        var minutesLeft = Math.round(tankLitres() / CONFIG.pumpFlowLitresPerMinute);
        supply.textContent = minutesLeft + " min at current flow";
      } else {
        supply.textContent = "Idle";
      }
    }
  }

  function renderTank() {
    var water = $("#tankWater");
    var percent = state.simulation.outages ? 0 : clamp(state.sensors.tankPercent, 0, 100);
    if (water) {
      water.style.height = percent + "%";
      water.classList.toggle("is-flowing", state.pump.on);
    }
    var ariaLabel = $("#tankAriaLabel");
    if (ariaLabel) {
      ariaLabel.textContent = state.simulation.outages
        ? "Water tank level unavailable because the sensor feed is offline."
        : "Water tank filled to " + Math.round(state.sensors.tankPercent) + " percent.";
    }
  }

  function renderSensors() {
    var list = $("#sensorList");
    var errorState = $("#sensorErrorState");
    var statusTag = $("#sensorStatusTag");
    var statusText = $("#sensorStatusText");
    if (!list) { return; }

    var offline = state.simulation.outages;
    if (statusText) { statusText.textContent = offline ? "Offline" : "Online"; }
    if (statusTag) {
      statusTag.classList.remove("is-tone-success", "is-tone-danger", "is-tone-neutral");
      statusTag.classList.add(offline ? "is-tone-danger" : "is-tone-success");
    }
    if (errorState) { errorState.hidden = !offline; }

    list.innerHTML = state.fields.map(function (field) {
      var sensor = sensorStatusFor(field);
      return '' +
        '<li class="sensor-list__item">' +
          '<span class="sensor-list__name"><i class="fa-solid fa-tower-broadcast" aria-hidden="true"></i>' +
            escapeHtml(field.sensor) + " - " + escapeHtml(field.name) +
          "</span>" +
          '<span class="status-tag status-tag--sm is-tone-' + sensor.tone + '"><span class="status-tag__dot" aria-hidden="true"></span>' +
            '<span class="status-tag__text">' + escapeHtml(sensor.label) + "</span></span>" +
        "</li>";
    }).join("");

    setText("#mobileSoilHint", offline
      ? "Sensor feed offline"
      : "Soil moisture " + Math.round(state.sensors.soilMoisture) + "%");
    setText("#livePillText", offline ? "Sensor simulation paused (outage)" : "Live Sensor Simulation");
    var livePill = $("#livePill");
    if (livePill) {
      var dot = $(".dot", livePill);
      if (dot) { dot.classList.toggle("dot--muted", offline || !state.simulation.running); }
    }
  }

  /* ==========================================================================
     14. RENDERING - FIELD CARDS, CROP CARDS, OPEN FIELDS
     ========================================================================== */
  function renderFields() {
    var grid = $("#fieldGrid");
    var empty = $("#fieldsEmpty");
    if (!grid) { return; }

    var offline = state.simulation.outages;
    grid.innerHTML = state.fields.map(function (field) {
      var health = fieldHealth(field);
      var irrigation = fieldIrrigationState(field);
      var irrigationTone = irrigation === "Running" ? "info" : (irrigation === "Recommended" ? "warning" : "success");
      var moistureDisplay = offline ? "--" : formatNumber(field.moisture, 0);
      return '' +
        '<div class="col-12 col-md-6 col-xl-4">' +
          '<article class="card field-card" aria-labelledby="fieldTitle' + field.id + '">' +
            '<div class="field-card__media">' +
              '<span class="field-card__name">' + escapeHtml(field.id) + " - " + escapeHtml(field.crop) + "</span>" +
              '<img src="' + field.image + '" width="1200" height="675" loading="lazy" decoding="async" alt="' +
                escapeHtml(field.crop + " crop growing in " + field.name) + '">' +
              '<div class="field-card__badges">' +
                '<span class="badge-status is-tone-' + health.tone + '"><i class="fa-solid fa-leaf" aria-hidden="true"></i>' + escapeHtml(health.label) + "</span>" +
                '<span class="badge-status is-tone-' + irrigationTone + '"><i class="fa-solid fa-faucet-drip" aria-hidden="true"></i>' + escapeHtml(irrigation) + "</span>" +
              "</div>" +
            "</div>" +
            '<div class="field-card__body">' +
              '<div>' +
                '<h3 class="field-card__title" id="fieldTitle' + field.id + '">' + escapeHtml(field.name) + "</h3>" +
                '<p class="field-card__crop">' + escapeHtml(field.crop) + " - " + escapeHtml(field.stage) + " stage</p>" +
              "</div>" +
              '<dl class="field-facts">' +
                '<div class="field-facts__item"><dt class="field-facts__label">Area</dt><dd class="field-facts__value">' + formatNumber(field.area, field.area % 1 === 0 ? 0 : 1) + " acres</dd></div>" +
                '<div class="field-facts__item"><dt class="field-facts__label">Soil Moisture</dt><dd class="field-facts__value">' + moistureDisplay + "%</dd></div>" +
                '<div class="field-facts__item"><dt class="field-facts__label">Target Range</dt><dd class="field-facts__value">' + field.band[0] + "-" + field.band[1] + "%</dd></div>" +
                '<div class="field-facts__item"><dt class="field-facts__label">Sensor</dt><dd class="field-facts__value">' + escapeHtml(field.sensor) + "</dd></div>" +
              "</dl>" +
              '<div class="field-card__footer">' +
                '<span class="status-tag is-tone-' + health.tone + '"><span class="status-tag__dot" aria-hidden="true"></span><span class="status-tag__text">' + escapeHtml(health.label) + "</span></span>" +
                '<button class="btn btn--subtle btn--sm" type="button" data-field-details="' + field.id + '"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><span>View Details</span></button>' +
              "</div>" +
            "</div>" +
          "</article>" +
        "</div>";
    }).join("");

    if (empty) { empty.hidden = !offline; }
  }

  function renderCrops() {
    var grid = $("#cropGrid");
    if (!grid) { return; }
    grid.innerHTML = state.fields.map(function (field) {
      var mid = (field.band[0] + field.band[1]) / 2;
      var deviation = field.moisture - mid;
      var status = Math.abs(deviation) <= (field.band[1] - field.band[0]) / 4
        ? { text: "Optimal", tone: "success" }
        : (deviation < 0 ? { text: "Low - irrigation advised", tone: "danger" } : { text: "High - hold irrigation", tone: "warning" });
      var moistureDisplay = state.simulation.outages ? "--" : formatNumber(field.moisture, 0);
      return '' +
        '<div class="col-12 col-md-6 col-xl-4">' +
          '<article class="card crop-card" aria-labelledby="cropTitle' + field.id + '">' +
            '<span class="crop-card__thumb"><img src="' + field.thumb + '" width="400" height="300" loading="lazy" decoding="async" alt="' +
              escapeHtml(field.crop + " crop at the " + field.stage.toLowerCase() + " stage") + '"></span>' +
            '<div class="crop-card__body">' +
              '<h3 class="crop-card__name" id="cropTitle' + field.id + '">' + escapeHtml(field.crop) + "</h3>" +
              '<dl class="crop-card__facts">' +
                "<div class=\"crop-card__fact\"><dt>Growing stage</dt><dd>" + escapeHtml(field.stage) + "</dd></div>" +
                "<div class=\"crop-card__fact\"><dt>Field</dt><dd>" + escapeHtml(field.name) + "</dd></div>" +
                "<div class=\"crop-card__fact\"><dt>Recommended moisture</dt><dd>" + field.band[0] + "-" + field.band[1] + "%</dd></div>" +
                "<div class=\"crop-card__fact\"><dt>Current moisture</dt><dd>" + moistureDisplay + "%</dd></div>" +
              "</dl>" +
              '<div class="crop-card__foot">' +
                '<span class="status-tag is-tone-' + status.tone + '"><span class="status-tag__dot" aria-hidden="true"></span><span class="status-tag__text">' + escapeHtml(status.text) + "</span></span>" +
                '<button class="link-btn" type="button" data-field-details="' + field.id + '">View details</button>' +
              "</div>" +
            "</div>" +
          "</article>" +
        "</div>";
    }).join("");
  }

  function openFieldModal(fieldId) {
    var field = fieldById(fieldId);
    if (!field) { return; }
    var modalEl = $("#fieldModal");
    if (!modalEl) { return; }

    var health = fieldHealth(field);
    var irrigation = fieldIrrigationState(field);
    var offline = state.simulation.outages;
    var history = buildFieldHistory(field);

    setText("#fieldModalTitle", field.name + " - " + field.crop);
    setText("#fieldModalSubtitle", field.stage + " stage - " + field.area + " acres - sensor " + field.sensor);

    var body = $("#fieldModalBody");
    body.innerHTML = '' +
      '<div class="field-detail__media"><img src="' + field.image + '" width="1200" height="675" loading="lazy" decoding="async" alt="' +
        escapeHtml(field.crop + " crop in " + field.name) + '"></div>' +
      '<div class="row g-3">' +
        '<div class="col-6 col-lg-3"><div class="field-detail__item"><span class="field-detail__label">Soil Moisture</span>' +
          '<p class="field-detail__value">' + (offline ? "--" : formatNumber(field.moisture, 0) + "%") + "</p></div></div>" +
        '<div class="col-6 col-lg-3"><div class="field-detail__item"><span class="field-detail__label">Target Range</span>' +
          '<p class="field-detail__value">' + field.band[0] + "-" + field.band[1] + "%</p></div></div>" +
        '<div class="col-6 col-lg-3"><div class="field-detail__item"><span class="field-detail__label">Crop Health</span>' +
          '<p class="field-detail__value">' + escapeHtml(health.label) + "</p></div></div>" +
        '<div class="col-6 col-lg-3"><div class="field-detail__item"><span class="field-detail__label">Irrigation</span>' +
          '<p class="field-detail__value">' + escapeHtml(irrigation) + "</p></div></div>" +
      "</div>" +
      '<div class="field-detail__chart"><h3 class="card-title">Soil moisture - last 24 hours</h3>' +
        '<canvas id="fieldDetailChart" aria-label="Soil moisture trend for ' + escapeHtml(field.name) + '" role="img"></canvas></div>' +
      '<p class="field-detail__note">Simulated readings for ' + escapeHtml(field.name) + ". Threshold is " + state.settings.threshold +
        "% and the crop target band is " + field.band[0] + "-" + field.band[1] + "%.</p>";

    var footer = $("#fieldModalFooter");
    var isRunning = state.pump.on && state.pump.fieldId === field.id;
    footer.innerHTML = '' +
      (isRunning
        ? '<button class="btn btn--primary is-on" type="button" data-modal-action="stop"><i class="fa-solid fa-stop" aria-hidden="true"></i><span>Stop Irrigation</span></button>'
        : '<button class="btn btn--primary" type="button" data-modal-action="start"><i class="fa-solid fa-play" aria-hidden="true"></i><span>Irrigate this field now</span></button>') +
      '<button class="btn btn--ghost" type="button" data-modal-action="schedule"><i class="fa-solid fa-calendar-plus" aria-hidden="true"></i><span>Schedule irrigation</span></button>' +
      '<button class="btn btn--ghost" type="button" data-bs-dismiss="modal">Close</button>';

    footer.setAttribute("data-field-id", field.id);

    var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();

    modalEl.addEventListener("shown.bs.modal", function onShown() {
      modalEl.removeEventListener("shown.bs.modal", onShown);
      if (state.charts.field) { state.charts.field.destroy(); state.charts.field = null; }
      var canvas = $("#fieldDetailChart");
      if (!canvas || typeof Chart === "undefined") { return; }
      state.charts.field = new Chart(canvas.getContext("2d"), {
        type: "line",
        data: {
          labels: history.labels,
          datasets: [{
            label: field.name + " soil moisture (%)",
            data: history.values,
            borderColor: "#1B7F5B",
            backgroundColor: "rgba(34, 153, 107, 0.14)",
            borderWidth: 2,
            fill: true,
            tension: 0.35,
            pointRadius: 0,
            pointHoverRadius: 4
          }, {
            label: "Target minimum (%)",
            data: history.labels.map(function () { return state.settings.threshold; }),
            borderColor: "#B87A0F",
            borderWidth: 1.5,
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false
          }]
        },
        options: chartOptions({ yMax: 100, yMin: 0, yTitle: "Soil moisture (%)" })
      });
    });

    track("field.details_open", { fieldId: field.id });
  }

  /* ==========================================================================
     15. CHARTS
     ========================================================================== */
  function chartOptions(overrides) {
    var options = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      animation: (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) ? false : { duration: 600 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0B3B2E",
          titleColor: "#F2F7F4",
          bodyColor: "#DCEDE3",
          padding: 10,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {}
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#77837F", font: { size: 11, family: "Inter" }, maxRotation: 0, autoSkipPadding: 12 },
          border: { color: "#DFE4E1" }
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(223, 228, 225, 0.7)" },
          ticks: { color: "#77837F", font: { size: 11, family: "Inter" } },
          border: { display: false }
        }
      }
    };
    if (overrides && overrides.yMax != null) { options.scales.y.max = overrides.yMax; }
    if (overrides && overrides.yMin != null) { options.scales.y.min = overrides.yMin; }
    if (overrides && overrides.yTitle) {
      options.scales.y.title = { display: true, text: overrides.yTitle, color: "#5A6763", font: { size: 11, family: "Inter" } };
    }
    return options;
  }

  /* Build a realistic history series for a field (deterministic seed). */
  function buildFieldHistory(field) {
    var labels = [];
    var values = [];
    var random = createRandom(CONFIG.randomSeed + field.id.charCodeAt(0));
    var value = clamp(field.moisture + 12, field.band[0], field.band[1] + 8);
    for (var hour = 0; hour < 24; hour += 4) {
      labels.push((hour === 0 ? "12 AM" : hour === 12 ? "12 PM" : (hour > 12 ? (hour - 12) + " PM" : hour + " AM")));
      value = clamp(value - 2.6 + (random() - 0.45) * 2.4, 12, 78);
      values.push(round(value, 0));
    }
    values[values.length - 1] = round(field.moisture, 0);
    return { labels: labels, values: values };
  }

  function buildSoilSeries(range) {
    var labels = [];
    var values = [];
    var random = createRandom(CONFIG.randomSeed + 7);
    var average = averageFieldMoisture();
    var i;

    if (range === "7d") {
      var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (i = 6; i >= 0; i--) {
        var day = new Date(Date.now() - i * 86400000);
        labels.push(i === 0 ? "Today" : dayNames[day.getDay()]);
        values.push(round(clamp(average + 6 - i * 1.1 + (random() - 0.5) * 4, 18, 72), 0));
      }
      values[values.length - 1] = round(average, 0);
      return { labels: labels, values: values };
    }

    if (range === "30d") {
      for (i = 29; i >= 0; i--) {
        var date = new Date(Date.now() - i * 86400000);
        labels.push(new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(date));
        values.push(round(clamp(average + 9 - (29 - i) * 0.32 + (random() - 0.5) * 5, 16, 76), 0));
      }
      values[values.length - 1] = round(average, 0);
      return { labels: labels, values: values };
    }

    for (i = 0; i < 24; i += 4) {
      labels.push(i === 0 ? "12 AM" : i === 12 ? "12 PM" : (i > 12 ? (i - 12) + " PM" : i + " AM"));
      values.push(round(clamp(average + 12 - i * 0.62 + (random() - 0.5) * 3, 18, 78), 0));
    }
    values[values.length - 1] = round(average, 0);
    return { labels: labels, values: values };
  }

  function buildWaterSeries() {
    /* Simulated weekly consumption: 1,200 + 950 + 1,400 + 1,100 + 850 + 1,300 + 900 = 7,700 L */
    var labels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    var litres = [1200, 950, 1400, 1100, 850, 1300, 900];
    return { labels: labels, litres: litres };
  }

  function initCharts() {
    if (typeof Chart === "undefined") {
      var loaders = $$(".chart-loader");
      loaders.forEach(function (loader) {
        loader.innerHTML = '<span class="empty-state__text">Charts could not be loaded because the chart library is unavailable in this browser.</span>';
      });
      return;
    }

    Chart.defaults.font.family = "Inter, sans-serif";
    Chart.defaults.color = "#5A6763";

    var soilSeries = buildSoilSeries(state.ui.soilRange);
    var soilCanvas = $("#soilChart");
    if (soilCanvas) {
      state.charts.soil = new Chart(soilCanvas.getContext("2d"), {
        type: "line",
        data: {
          labels: soilSeries.labels,
          datasets: [{
            label: "Average soil moisture (%)",
            data: soilSeries.values,
            borderColor: "#1B7F5B",
            backgroundColor: "rgba(34, 153, 107, 0.16)",
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointBackgroundColor: "#0F4C3A"
          }, {
            label: "Irrigation threshold (%)",
            data: soilSeries.labels.map(function () { return state.settings.threshold; }),
            borderColor: "#B87A0F",
            borderWidth: 1.5,
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false
          }]
        },
        options: chartOptions({ yMax: 100, yMin: 0, yTitle: "Soil moisture (%)" })
      });
    }

    var waterSeries = buildWaterSeries();
    var waterCanvas = $("#waterChart");
    if (waterCanvas) {
      state.charts.water = new Chart(waterCanvas.getContext("2d"), {
        type: "bar",
        data: {
          labels: waterSeries.labels,
          datasets: [{
            label: "Water used (" + unitLabel("volume") + ")",
            data: waterSeries.litres.map(function (value) { return round(convertVolume(value), isImperial() ? 1 : 0); }),
            backgroundColor: "#2E8B62",
            hoverBackgroundColor: "#1B7F5B",
            borderRadius: 6,
            maxBarThickness: 34
          }]
        },
        options: chartOptions({ yTitle: "Water used (" + unitLabel("volume") + ")" })
      });
    }

    window.setTimeout(function () {
      var soilLoader = $("#soilChartLoader");
      var waterLoader = $("#waterChartLoader");
      if (soilLoader) { soilLoader.hidden = true; }
      if (waterLoader) { waterLoader.hidden = true; }
      renderSoilSummary();
      renderWaterSummary();
    }, 420);
  }

  function updateSoilChart(range) {
    if (!state.charts.soil) { return; }
    var series = buildSoilSeries(range);
    state.charts.soil.data.labels = series.labels;
    state.charts.soil.data.datasets[0].data = series.values;
    state.charts.soil.data.datasets[1].data = series.labels.map(function () { return state.settings.threshold; });
    state.charts.soil.update();
    renderSoilSummary();
  }

  function updateWaterChart() {
    if (!state.charts.water) { return; }
    state.charts.water.data.datasets[0].data = buildWaterSeries().litres.map(function (value) {
      return round(convertVolume(value), isImperial() ? 1 : 0);
    });
    state.charts.water.data.datasets[0].label = "Water used (" + unitLabel("volume") + ")";
    if (state.charts.water.options.scales.y.title) {
      state.charts.water.options.scales.y.title.text = "Water used (" + unitLabel("volume") + ")";
    }
    state.charts.water.update();
    renderWaterSummary();
  }

  /* Update the soil chart continuously (last point tracks the live average). */
  function updateChartsLive() {
    if (state.charts.soil) {
      var values = state.charts.soil.data.datasets[0].data;
      values[values.length - 1] = round(averageFieldMoisture(), 0);
      state.charts.soil.data.datasets[1].data = state.charts.soil.data.labels.map(function () { return state.settings.threshold; });
      state.charts.soil.update("none");
      renderSoilSummary();
    }
  }

  function renderSoilSummary() {
    var target = $("#soilChartSummary");
    if (!target) { return; }
    var series = state.charts.soil ? state.charts.soil.data.datasets[0].data : [];
    if (!series.length) { target.innerHTML = ""; return; }
    var min = Math.min.apply(null, series);
    var max = Math.max.apply(null, series);
    var last = series[series.length - 1];
    var first = series[0];
    var change = last - first;
    target.innerHTML = '' +
      '<div class="chart-summary__item"><span class="chart-summary__label">Current average</span><p class="chart-summary__value">' + formatNumber(last, 0) + "%</p></div>" +
      '<div class="chart-summary__item"><span class="chart-summary__label">Lowest</span><p class="chart-summary__value">' + formatNumber(min, 0) + "%</p>" +
        '<p class="chart-summary__note">Highest ' + formatNumber(max, 0) + "%</p></div>" +
      '<div class="chart-summary__item"><span class="chart-summary__label">Change over period</span><p class="chart-summary__value">' +
        (change >= 0 ? "+" : "") + formatNumber(change, 0) + "%</p>" +
        '<p class="chart-summary__note">Threshold ' + state.settings.threshold + "%</p></div>";
  }

  function renderWaterSummary() {
    var series = buildWaterSeries();
    var total = series.litres.reduce(function (sum, value) { return sum + value; }, 0);
    var previous = state.counters.previousWeekLitres;
    var delta = previous > 0 ? Math.round(((previous - total) / previous) * 100) : 0;
    var highestIndex = series.litres.indexOf(Math.max.apply(null, series.litres));

    setText("#weekTotal", formatVolume(total));
    setText("#weekAverage", formatVolume(total / series.litres.length) + " " + unitLabel("volume"));
    setText("#weekHighest", series.labels[highestIndex]);
    setText("#weekPrevious", formatVolume(previous) + " " + unitLabel("volume"));

    var deltaNode = $("#weekDelta");
    if (deltaNode) {
      var less = delta >= 0;
      deltaNode.classList.toggle("is-up", !less);
      deltaNode.innerHTML = '<i class="fa-solid ' + (less ? "fa-arrow-trend-down" : "fa-arrow-trend-up") + '" aria-hidden="true"></i>' +
        "<span>" + Math.abs(delta) + "% " + (less ? "less" : "more") + " than previous week</span>";
    }
  }

  /* ==========================================================================
     16. HEALTH SCORE
     ========================================================================== */
  function fieldSoilScore(field) {
    var low = field.band[0];
    var high = field.band[1];
    var halfBand = (high - low) / 2;
    var mid = (high + low) / 2;
    if (field.moisture < low) {
      var shortfall = low - field.moisture;
      return clamp(86 - (shortfall / halfBand) * 22, 40, 86);
    }
    if (field.moisture > high) {
      var excess = field.moisture - high;
      return clamp(88 - (excess / halfBand) * 12, 55, 88);
    }
    return clamp(94 - (Math.abs(field.moisture - mid) / halfBand) * 10, 84, 94);
  }

  function computeHealth() {
    var soil = 0;
    if (state.fields.length) {
      soil = state.fields.reduce(function (sum, field) { return sum + fieldSoilScore(field); }, 0) / state.fields.length;
    }
    var waterAvailability = clamp(state.sensors.tankPercent * 1.026, 0, 100);
    var efficiency = clamp(60 + state.counters.waterSavedPercent * 1.35, 0, 100);
    var cropScores = state.fields.map(function (field) {
      var health = fieldHealth(field);
      return health.key === "healthy" ? 100 : (health.key === "warning" ? 80 : 55);
    });
    var crop = cropScores.length ? cropScores.reduce(function (a, b) { return a + b; }, 0) / cropScores.length : 0;
    var overall = (soil + waterAvailability + efficiency + crop) / 4;

    return {
      overall: Math.round(overall),
      parts: [
        { key: "soil", label: "Soil Condition", value: Math.round(soil) },
        { key: "water", label: "Water Availability", value: Math.round(waterAvailability) },
        { key: "efficiency", label: "Irrigation Efficiency", value: Math.round(efficiency) },
        { key: "crop", label: "Crop Condition", value: Math.round(crop) }
      ]
    };
  }

  function renderHealth() {
    var health = computeHealth();
    var circle = $("#healthRingCircle");
    var scoreNode = $("#healthRingScore");
    var circumference = 2 * Math.PI * 52;

    if (scoreNode) { scoreNode.textContent = String(health.overall); }
    if (circle) {
      var offset = circumference * (1 - health.overall / 100);
      circle.setAttribute("stroke-dasharray", String(round(circumference, 1)));
      circle.setAttribute("stroke-dashoffset", String(round(offset, 1)));
      var tone = health.overall >= 80 ? "#1B7F5B" : (health.overall >= 65 ? "#D9A32E" : "#B4443B");
      circle.setAttribute("stroke", tone);
    }

    var list = $("#scoreList");
    if (list) {
      list.innerHTML = health.parts.map(function (part) {
        var toneClass = part.value >= 80 ? "" : (part.value >= 65 ? " is-warning" : " is-danger");
        return '' +
          '<li class="score-list__item">' +
            '<div class="score-list__row">' +
              '<span class="score-list__label">' + escapeHtml(part.label) + "</span>" +
              '<span class="score-list__value">' + part.value + "</span>" +
            "</div>" +
            '<span class="score-list__bar" role="progressbar" aria-label="' + escapeHtml(part.label) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + part.value + '">' +
              '<span class="score-list__fill' + toneClass + '" style="width:' + part.value + '%"></span>' +
            "</span>" +
          "</li>";
      }).join("");
    }
  }

  /* ==========================================================================
     17. WEATHER
     ========================================================================== */
  function renderWeather() {
    var sensors = state.sensors;
    var offline = state.simulation.outages;
    setText("#weatherCondition", offline ? "Weather unavailable" : sensors.condition);
    setText("#weatherConditionShort", offline ? "--" : sensors.condition);
    setText("#weatherWind", offline ? "--" : formatNumber(convertSpeed(sensors.windSpeed), isImperial() ? 1 : 0));
    setText("#weatherRain", offline ? "--" : formatNumber(sensors.rainChance));
    setText("#forecastMorning", offline ? "--" : formatTemp(sensors.forecast.morning));
    setText("#forecastAfternoon", offline ? "--" : formatTemp(sensors.forecast.afternoon));
    setText("#forecastEvening", offline ? "--" : formatTemp(sensors.forecast.evening));

    var note = $("#forecastNote");
    if (note) {
      if (offline) {
        note.textContent = "Weather data is unavailable while the simulated sensor feed is offline.";
      } else if (sensors.rainChance >= 60) {
        note.textContent = "Rain is likely today. Consider delaying irrigation to avoid water loss.";
      } else if (sensors.rainChance >= 30) {
        note.textContent = "Rain chance is moderate. Monitor soil moisture before the next irrigation cycle.";
      } else {
        note.textContent = "Rain chance is low, irrigation can proceed as planned.";
      }
    }
  }

  function refreshWeather() {
    var button = $("#refreshWeatherBtn");
    if (button) {
      button.classList.add("is-loading");
      $(".fa-arrows-rotate", button).classList.add("fa-spin");
    }
    window.setTimeout(function () {
      var conditions = ["Sunny", "Partly Cloudy", "Cloudy", "Light Showers", "Clear"];
      state.sensors.condition = conditions[Math.floor(randomBetween(0, conditions.length))];
      state.sensors.windSpeed = round(clamp(state.sensors.windSpeed + randomBetween(-3, 3), 2, 28), 0);
      state.sensors.rainChance = Math.round(clamp(state.sensors.rainChance + randomBetween(-12, 12), 0, 95));
      state.sensors.forecast.morning = round(clamp(state.sensors.temperature - randomBetween(1, 3), 15, 38), 0);
      state.sensors.forecast.afternoon = round(clamp(state.sensors.temperature + randomBetween(1, 3), 16, 42), 0);
      state.sensors.forecast.evening = round(clamp(state.sensors.temperature - randomBetween(0, 2), 14, 38), 0);
      renderWeather();
      renderRecommendation();
      if (button) {
        button.classList.remove("is-loading");
        $(".fa-arrows-rotate", button).classList.remove("fa-spin");
      }
      toast("info", "Weather updated", "Simulated weather for your location has been refreshed.");
      track("weather.refresh", { condition: state.sensors.condition });
    }, 700);
  }

  /* ==========================================================================
     18. SENSOR SIMULATION ENGINE
     ========================================================================== */
  function initializeHistory() {
    state.simulation.history.soil24h = buildSoilSeries("24h").values;
    state.simulation.history.soil7d = buildSoilSeries("7d").values;
    state.simulation.history.soil30d = buildSoilSeries("30d").values;
    state.simulation.history.water7d = buildWaterSeries().litres;
  }

  function sensorTick(manual) {
    if (state.simulation.outages) { return; }
    var sensors = state.sensors;
    var pump = state.pump;

    // Soil moisture: dries slowly when idle, recovers while the pump runs.
    state.fields.forEach(function (field) {
      var delta;
      if (pump.on && pump.fieldId === field.id) {
        delta = randomBetween(0.28, 0.5);
      } else {
        delta = randomBetween(-0.22, -0.05);
      }
      field.moisture = clamp(field.moisture + delta, 12, 82);
    });

    sensors.soilMoisture = round(averageFieldMoisture(), 0);

    // Temperature and humidity drift together.
    sensors.temperature = clamp(sensors.temperature + randomBetween(-0.25, 0.28), 16, 41);
    sensors.humidity = clamp(sensors.humidity + randomBetween(-0.9, 0.9), 32, 92);

    // Tank drains only while the pump runs. The volume drawn per tick matches
    // the configured pump flow rate (30 L/min) and the active update interval,
    // so the tank level and the "L/min" readings always agree.
    if (pump.on) {
      var litresPerTick = CONFIG.pumpFlowLitresPerMinute * (state.simulation.intervalMs / 60000);
      var drawn = litresPerTick * randomBetween(0.9, 1.1);
      var percentDrop = (drawn / state.settings.tankCapacity) * 100;
      sensors.tankPercent = clamp(sensors.tankPercent - percentDrop, 0, 100);
      pump.sessionWater += drawn;
      sensors.waterUsedToday += drawn;

      persistCounters();

      if (sensors.tankPercent <= 1) {
        toast("error", "Tank empty", "Irrigation stopped automatically because the water tank is empty.");
        stopPump("stopped");
      }
    }

    state.simulation.updates += 1;
    state.simulation.lastUpdated = new Date();
    state.simulation.nextUpdateAt = Date.now() + state.simulation.intervalMs;

    if (manual) {
      toast("info", "Sensor Updated", "Latest sensor readings received.");
    }

    renderKpis();
    renderTank();
    renderPump();
    renderFields();
    renderCrops();
    renderStats();
    renderHealth();
    renderWeather();
    renderSensors();
    renderRecommendation();
    evaluateRules();
    updateChartsLive();
    updateLastUpdated();
    renderSimFacts();
    persistCounters();
    track("sensor.tick", { updates: state.simulation.updates, manual: !!manual });
  }

  function startSimulation() {
    stopSimulation();
    if (!state.simulation.running) { return; }
    timers.sim = window.setInterval(function () { sensorTick(false); }, state.simulation.intervalMs);
    state.simulation.nextUpdateAt = Date.now() + state.simulation.intervalMs;
  }

  function stopSimulation() {
    if (timers.sim) { window.clearInterval(timers.sim); timers.sim = null; }
  }

  function updateLastUpdated() {
    setText("#lastUpdated", relativeTime(state.simulation.lastUpdated));
  }

  function renderSimFacts() {
    setText("#simUpdateCount", formatNumber(state.simulation.updates));
    var remaining = Math.max(0, Math.ceil((state.simulation.nextUpdateAt - Date.now()) / 1000));
    setText("#simNextUpdate", state.simulation.running && !state.simulation.outages ? remaining + "s" : "Paused");
  }

  function refreshReadings(options) {
    var opts = options || {};
    var button = opts.button;
    if (button) {
      button.classList.add("is-loading");
      var icon = $(".fa-arrows-rotate", button);
      if (icon) { icon.classList.add("fa-spin"); }
    }
    var progress = $("#headerProgress");
    if (progress) { progress.hidden = false; }

    window.setTimeout(function () {
      if (state.simulation.outages) {
        toast("error", "Sensor unavailable", "Simulated sensor outage is active. Turn it off in Settings to receive readings again.");
      } else {
        sensorTick(true);
      }
      if (button) {
        button.classList.remove("is-loading");
        var icon2 = $(".fa-arrows-rotate", button);
        if (icon2) { icon2.classList.remove("fa-spin"); }
      }
      if (progress) { progress.hidden = true; }
      state.simulation.nextUpdateAt = Date.now() + state.simulation.intervalMs;
    }, 600);
  }

  function setOutage(active) {
    state.simulation.outages = !!active;
    var toggle = $("#simOutageToggle");
    if (toggle) { toggle.checked = state.simulation.outages; }

    if (state.simulation.outages) {
      if (state.pump.on) {
        toast("warning", "Irrigation stopped", "The pump was stopped because the sensor feed went offline.");
        stopPump("stopped");
      }
      addAlert({
        severity: "warning", key: "sensor-outage",
        title: "Sensor feed offline",
        text: "The simulated sensor gateway stopped reporting. Readings are unavailable until the feed is restored."
      });
      toast("error", "Sensor unavailable", "Simulated sensor outage enabled. Dashboard readings are paused.");
    } else {
      addAlert({
        severity: "success", key: "sensor-restored-" + Math.floor(Date.now() / 60000),
        title: "Sensor feed restored",
        text: "The simulated sensor gateway is reporting again and readings have resumed."
      });
      toast("success", "Sensor Updated", "Sensor feed restored. Latest simulated readings received.");
      state.simulation.lastUpdated = new Date();
      state.simulation.nextUpdateAt = Date.now() + state.simulation.intervalMs;
    }

    renderKpis(); renderTank(); renderPump(); renderFields(); renderCrops();
    renderWeather(); renderSensors(); renderRecommendation(); renderAlerts();
    renderBell(); renderStats(); renderStorageInfo();
    track("simulation.outage", { active: state.simulation.outages });
  }

  /* ==========================================================================
     19. SCHEDULING
     ========================================================================== */
  function persistSchedules() { Store.write(STORAGE_KEYS.schedules, state.schedules); }

  function validateSchedule() {
    var valid = true;
    var fieldSelect = $("#scheduleField");
    var dateInput = $("#scheduleDate");
    var timeInput = $("#scheduleTime");
    var durationInput = $("#scheduleDuration");
    var modeSelect = $("#scheduleMode");

    var showError = function (input, errorId, condition) {
      var error = $("#" + errorId);
      if (input) { input.classList.toggle("is-invalid", condition); }
      if (error) { error.hidden = !condition; }
      if (condition) { valid = false; }
    };

    showError(fieldSelect, "scheduleFieldError", !fieldSelect.value);

    var chosen = null;
    if (dateInput.value && timeInput.value) {
      chosen = new Date(dateInput.value + "T" + timeInput.value + ":00");
    }
    showError(dateInput, "scheduleDateError", !dateInput.value || isNaN(chosen ? chosen.getTime() : NaN));
    showError(timeInput, "scheduleTimeError", !timeInput.value);
    if (chosen && chosen.getTime() < Date.now() - 60000) {
      showError(dateInput, "scheduleDateError", true);
      var dateError = $("#scheduleDateError");
      if (dateError) { dateError.textContent = "Choose a time in the future for the irrigation schedule."; }
    }

    var duration = Number(durationInput.value);
    showError(durationInput, "scheduleDurationError", !(duration >= 1 && duration <= 180));
    showError(modeSelect, "scheduleModeError", !modeSelect.value);

    // Duplicate protection
    if (chosen && fieldSelect.value) {
      var duplicate = state.schedules.some(function (item) {
        return item.status === "Scheduled" && item.fieldId === fieldSelect.value &&
          Math.abs(new Date(item.at).getTime() - chosen.getTime()) < 60000;
      });
      if (duplicate) {
        showError(dateInput, "scheduleDateError", true);
        var dateError2 = $("#scheduleDateError");
        if (dateError2) { dateError2.textContent = "A schedule already exists for this field at the same time."; }
      }
    }

    return valid;
  }

  function submitSchedule(event) {
    event.preventDefault();
    if (!validateSchedule()) {
      toast("error", "Schedule not saved", "Please correct the highlighted fields and try again.");
      var firstInvalid = $("#scheduleForm .is-invalid");
      if (firstInvalid) { firstInvalid.focus(); }
      return;
    }

    var button = $("#scheduleSubmitBtn");
    if (button) { button.classList.add("is-loading"); }

    window.setTimeout(function () {
      var fieldId = $("#scheduleField").value;
      var dateValue = $("#scheduleDate").value;
      var timeValue = $("#scheduleTime").value;
      var schedule = {
        id: uid("sch"),
        fieldId: fieldId,
        at: new Date(dateValue + "T" + timeValue + ":00").toISOString(),
        durationMin: Number($("#scheduleDuration").value),
        mode: $("#scheduleMode").value,
        status: "Scheduled",
        createdAt: new Date().toISOString()
      };

      state.schedules.push(schedule);
      persistSchedules();
      renderSchedules();

      var field = fieldById(fieldId);
      addActivity({
        at: schedule.at, fieldId: fieldId, durationMin: schedule.durationMin,
        waterL: Math.round(schedule.durationMin * CONFIG.pumpFlowLitresPerMinute * 0.62),
        mode: schedule.mode, status: "Scheduled"
      });
      renderActivity();

      toast("success", "Irrigation scheduled",
        (field ? field.name : "Field") + " on " + formatDateTime(new Date(schedule.at)) + " for " + schedule.durationMin +
        (schedule.durationMin === 1 ? " minute." : " minutes."));
      track("schedule.create", { fieldId: fieldId, durationMin: schedule.durationMin, mode: schedule.mode });

      if (button) { button.classList.remove("is-loading"); }
      $("#scheduleForm").reset();
      $("#scheduleDate").value = toISODate(new Date());
      $("#scheduleTime").value = "06:30";
      $("#scheduleDuration").value = "20";
      renderStorageInfo();
    }, 500);
  }

  function cancelSchedule(id) {
    var schedule = state.schedules.filter(function (item) { return item.id === id; })[0];
    if (!schedule) { return; }
    state.schedules = state.schedules.filter(function (item) { return item.id !== id; });
    persistSchedules();
    renderSchedules();
    toast("info", "Schedule removed", "The scheduled irrigation task has been cancelled.");
    track("schedule.cancel", { id: id });
  }

  function processDueSchedules() {
    var now = Date.now();
    var changed = false;

    state.schedules.forEach(function (schedule) {
      if (schedule.status !== "Scheduled") { return; }
      var at = new Date(schedule.at).getTime();
      if (at > now) { return; }

      if (!state.pump.on && !state.simulation.outages && state.sensors.tankPercent > 2) {
        startPump({ fieldId: schedule.fieldId, mode: "Scheduled", plannedMinutes: schedule.durationMin });
        toast("info", "Scheduled irrigation started",
          fieldById(schedule.fieldId).name + " irrigation started for " + schedule.durationMin + " minutes.");
      } else if (!state.pump.on) {
        toast("warning", "Scheduled irrigation skipped",
          "The scheduled task could not start because the pump is unavailable or the sensor feed is offline.");
      }
      schedule.status = "Completed";
      schedule.startedAt = new Date().toISOString();
      changed = true;
      track("schedule.run", { id: schedule.id });
    });

    if (changed) { persistSchedules(); renderSchedules(); }
  }

  function scheduleStatusBadge(status) {
    if (status === "Completed") { return '<span class="badge-status is-tone-success"><i class="fa-solid fa-circle-check" aria-hidden="true"></i>Completed</span>'; }
    return '<span class="badge-status is-tone-neutral"><i class="fa-solid fa-clock" aria-hidden="true"></i>Scheduled</span>';
  }

  function renderSchedules() {
    var list = $("#scheduleList");
    var empty = $("#scheduleEmpty");
    var count = $("#scheduleCount");
    if (!list) { return; }

    var sorted = state.schedules.slice().sort(function (a, b) { return new Date(a.at) - new Date(b.at); });
    var upcoming = sorted.filter(function (item) { return item.status === "Scheduled"; });
    var completed = sorted.filter(function (item) { return item.status !== "Scheduled"; }).slice(-3).reverse();
    var visible = upcoming.concat(completed);

    list.innerHTML = visible.map(function (item) {
      var field = fieldById(item.fieldId);
      var at = new Date(item.at);
      var isToday = toISODate(at) === toISODate(new Date());
      var isTomorrow = toISODate(at) === toISODate(new Date(Date.now() + 86400000));
      var dayLabel = isToday ? "Today" : (isTomorrow ? "Tomorrow" : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(at));
      var timeLabel = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).format(at);
      return '' +
        '<li class="schedule-item' + (item.status === "Completed" ? " schedule-item--done" : "") + '">' +
          '<div class="schedule-item__when">' +
            '<p class="schedule-item__day">' + escapeHtml(dayLabel) + "</p>" +
            '<p class="schedule-item__time">' + escapeHtml(timeLabel) + "</p>" +
          "</div>" +
          '<div class="schedule-item__body">' +
            '<p class="schedule-item__field">' + escapeHtml(field ? field.name + " - " + field.crop : "Unknown field") + "</p>" +
            '<p class="schedule-item__meta">Duration: ' + item.durationMin + (item.durationMin === 1 ? " minute" : " minutes") + " &middot; Mode: " + escapeHtml(item.mode) + "</p>" +
          "</div>" +
          '<div class="schedule-item__actions">' +
            scheduleStatusBadge(item.status) +
            (item.status === "Scheduled"
              ? '<button class="btn btn--ghost btn--sm" type="button" data-schedule-now="' + item.id + '" title="Start this irrigation now"><i class="fa-solid fa-play" aria-hidden="true"></i><span class="sr-only">Start now</span></button>' +
                '<button class="btn btn--danger btn--sm" type="button" data-schedule-cancel="' + item.id + '"><i class="fa-solid fa-xmark" aria-hidden="true"></i><span class="sr-only">Cancel schedule</span></button>'
              : "") +
          "</div>" +
        "</li>";
    }).join("");

    if (empty) { empty.hidden = visible.length > 0; }
    list.hidden = visible.length === 0;
    if (count) {
      count.textContent = upcoming.length + " upcoming, " + completed.length + " recent";
    }
  }

  function startScheduleNow(id) {
    var schedule = state.schedules.filter(function (item) { return item.id === id; })[0];
    if (!schedule) { return; }
    startPump({ fieldId: schedule.fieldId, mode: schedule.mode, plannedMinutes: schedule.durationMin });
    schedule.status = "Completed";
    persistSchedules();
    renderSchedules();
  }

  /* ==========================================================================
     20. SETTINGS
     ========================================================================== */
  function loadSettingsIntoForm() {
    var settings = state.settings;
    var thresholdRange = $("#thresholdRange");
    var thresholdInput = $("#thresholdInput");
    var tankInput = $("#tankCapacityInput");
    var unitsSelect = $("#unitsSelect");
    var autoToggle = $("#autoIrrigationToggle");
    var notifToggle = $("#notificationsToggleAlerts");

    if (thresholdRange) { thresholdRange.value = settings.threshold; }
    if (thresholdInput) { thresholdInput.value = settings.threshold; }
    if (tankInput) { tankInput.value = settings.tankCapacity; }
    if (unitsSelect) { unitsSelect.value = settings.units; }
    if (autoToggle) { autoToggle.checked = settings.autoIrrigation; }
    if (notifToggle) { notifToggle.checked = settings.notifications; }

    setText("#autoIrrigationState", settings.autoIrrigation
      ? "Enabled. The pump will start automatically when the average soil moisture falls below " + settings.threshold + "%."
      : "Currently disabled.");
    setText("#ruleThresholdText", settings.threshold + "%");
    setText("#policyThreshold", settings.threshold + "%");
  }

  function validateSettings() {
    var valid = true;
    var threshold = Number($("#thresholdInput").value);
    var capacity = Number($("#tankCapacityInput").value);

    var thresholdError = $("#thresholdError");
    var capacityError = $("#tankCapacityError");

    var thresholdInvalid = !(threshold >= 15 && threshold <= 60) || !$("#thresholdInput").value;
    var capacityInvalid = !(capacity >= 1000 && capacity <= 20000) || !$("#tankCapacityInput").value;

    $("#thresholdInput").classList.toggle("is-invalid", !!thresholdInvalid);
    $("#tankCapacityInput").classList.toggle("is-invalid", !!capacityInvalid);
    if (thresholdError) { thresholdError.hidden = !thresholdInvalid; }
    if (capacityError) { capacityError.hidden = !capacityInvalid; }
    if (thresholdInvalid || capacityInvalid) { valid = false; }
    return valid;
  }

  function saveSettings(event) {
    if (event) { event.preventDefault(); }
    if (!validateSettings()) {
      toast("error", "Settings not saved", "Please correct the highlighted values and try again.");
      var invalid = $("#settingsForm .is-invalid");
      if (invalid) { invalid.focus(); }
      var stateNode = $("#settingsSaveState");
      if (stateNode) { stateNode.classList.add("is-error"); stateNode.textContent = "Not saved"; }
      return;
    }

    var previousCapacity = state.settings.tankCapacity;
    var previousUnits = state.settings.units;
    var button = $("#saveSettingsBtn");
    if (button) { button.classList.add("is-loading"); }

    window.setTimeout(function () {
      state.settings.threshold = Number($("#thresholdInput").value);
      state.settings.tankCapacity = Number($("#tankCapacityInput").value);
      state.settings.units = $("#unitsSelect").value;
      state.settings.autoIrrigation = $("#autoIrrigationToggle").checked;
      state.settings.notifications = $("#notificationsToggleAlerts").checked;

      Store.write(STORAGE_KEYS.settings, state.settings);

      // Keep the tank percentage consistent when the capacity changes.
      if (previousCapacity !== state.settings.tankCapacity) {
        state.sensors.tankPercent = clamp(state.sensors.tankPercent, 0, 100);
      }

      applyUnitLabels();
      loadSettingsIntoForm();
      renderKpis();
      renderTank();
      renderPump();
      renderStats();
      renderHealth();
      renderWeather();
      renderFields();
      renderCrops();
      renderActivity();
      renderRecommendation();
      renderSchedules();
      renderStorageInfo();
      updateWaterChart();
      updateSoilChart(state.ui.soilRange);
      evaluateRules();

      if (button) { button.classList.remove("is-loading"); }
      var stateNode = $("#settingsSaveState");
      if (stateNode) {
        stateNode.classList.remove("is-error");
        stateNode.textContent = "Saved " + new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" }).format(new Date());
      }

      toast("success", "Settings Saved", "Your irrigation settings have been updated.");
      track("settings.save", {
        threshold: state.settings.threshold,
        capacity: state.settings.tankCapacity,
        units: state.settings.units,
        auto: state.settings.autoIrrigation,
        notifications: state.settings.notifications,
        unitsChanged: previousUnits !== state.settings.units
      });

      window.setTimeout(function () {
        if (stateNode) { stateNode.textContent = ""; }
      }, 4000);
    }, 500);
  }

  function resetSettings() {
    state.settings = Object.assign({}, DEFAULT_SETTINGS);
    Store.write(STORAGE_KEYS.settings, state.settings);
    applyUnitLabels();
    loadSettingsIntoForm();
    renderKpis();
    renderTank();
    renderStats();
    renderHealth();
    renderWeather();
    renderRecommendation();
    updateWaterChart();
    updateSoilChart(state.ui.soilRange);
    evaluateRules();
    toast("info", "Settings reset", "Irrigation settings are back to their default values.");
    track("settings.reset", {});
  }

  /* ==========================================================================
     21. STORAGE SUMMARY, EXPORT AND RESET
     ========================================================================== */
  function renderStorageInfo() {
    var settingsSaved = Store.available && !!window.localStorage.getItem(STORAGE_KEYS.settings);
    setText("#storageSettings", settingsSaved ? "Saved in this browser" : "Default values");
    setText("#storageAlerts", formatNumber(state.alerts.length) + " saved");
    setText("#storageActivity", formatNumber(state.activity.length) + " saved");
    setText("#storageSchedules", formatNumber(state.schedules.length) + " saved");
    setText("#storageSession", state.pump.on
      ? "Running since " + formatDateTime(new Date(state.pump.startedAt))
      : "None");
  }

  function exportData() {
    var payload = {
      exportedAt: new Date().toISOString(),
      application: "AquaFarm Smart Irrigation Management Dashboard",
      note: "All values are simulated demonstration data generated in the browser.",
      settings: state.settings,
      sensors: state.sensors,
      fields: state.fields.map(function (field) {
        return { id: field.id, name: field.name, crop: field.crop, stage: field.stage, area: field.area,
                 moisture: round(field.moisture, 1), band: field.band, sensor: field.sensor };
      }),
      pump: { on: state.pump.on, mode: state.pump.mode, fieldId: state.pump.fieldId },
      alerts: state.alerts,
      activity: state.activity,
      schedules: state.schedules,
      counters: state.counters
    };

    try {
      var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = "aquafarm-dashboard-export-" + toISODate(new Date()) + ".json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
      toast("success", "Export ready", "Your simulated dashboard data has been downloaded as JSON.");
      track("data.export", {});
    } catch (error) {
      toast("error", "Export failed", "The browser blocked the download. Try again from a different browser.");
    }
  }

  function resetDemoData(force) {
    if (!force) {
      if (!state.ui.pendingResetConfirm) {
        state.ui.pendingResetConfirm = true;
        toast("warning", "Confirm reset", "Click the reset button again within 5 seconds to clear all saved dashboard data.");
        window.setTimeout(function () { state.ui.pendingResetConfirm = false; }, 5000);
        return;
      }
      state.ui.pendingResetConfirm = false;
    }

    Store.clearAll();
    state.settings = Object.assign({}, DEFAULT_SETTINGS);
    state.alerts = [];
    state.activity = [];
    state.schedules = [];
    state.counters = { sessionsToday: 6, waterSavedPercent: 18, previousWeekLitres: 8750 };
    state.pump.on = false;
    state.pump.startedAt = null;
    state.pump.sessionWater = 0;
    state.pump.mode = "Manual";
    state.sensors.tankPercent = 76;
    state.sensors.waterUsedToday = 1240;
    seedDemonstrationData();

    applyUnitLabels();
    loadSettingsIntoForm();
    renderAll();
    toast("success", "Dashboard reset", "All saved data was cleared and the demonstration data was restored.");
    track("data.reset", {});
  }

  /* ==========================================================================
     22. INITIAL DEMONSTRATION DATA
     ========================================================================== */
  function seedDemonstrationData() {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var yesterday = new Date(today.getTime() - 86400000);
    var threeDaysAgo = new Date(today.getTime() - 3 * 86400000);

    if (!state.activity.length) {
      // Duration, water used and mode match the pump flow rate used by the simulation.
      state.activity = [
        { id: uid("act"), at: new Date(today.getTime() + 8.5 * 3600000).toISOString(), fieldId: "A", durationMin: 20, waterL: 340, mode: "Automatic", status: "Completed" },
        { id: uid("act"), at: new Date(yesterday.getTime() + 18.25 * 3600000).toISOString(), fieldId: "B", durationMin: 15, waterL: 260, mode: "Manual", status: "Completed" },
        { id: uid("act"), at: new Date(threeDaysAgo.getTime() + 7 * 3600000).toISOString(), fieldId: "C", durationMin: 25, waterL: 420, mode: "Scheduled", status: "Completed" }
      ];
      persistActivity();
    }

    if (!state.alerts.length) {
      state.alerts = [
        { id: uid("alert"), severity: "critical", title: "Low Soil Moisture",
          text: "Field B (Tomato) moisture is reading 28%, below the configured " + state.settings.threshold + "% threshold.",
          fieldId: "B", key: "low-moisture-B", at: new Date(now.getTime() - 6 * 60000).toISOString(), read: false },
        { id: uid("alert"), severity: "success", title: "Irrigation Completed",
          text: "Field A irrigation completed successfully. 340 L used in 20 minutes.",
          fieldId: "A", key: "irrigation-completed-A", at: new Date(today.getTime() + 8.5 * 3600000).toISOString(), read: false },
        { id: uid("alert"), severity: "info", title: "Sensor Network Online",
          text: "3 simulated sensor nodes are reporting normally across Field A, Field B and Field C.",
          fieldId: null, key: "sensor-online", at: new Date(now.getTime() - 12 * 60000).toISOString(), read: true }
      ];
      persistAlerts();
    }
  }

  function restoreStoredState() {
    var storedSettings = Store.read(STORAGE_KEYS.settings, null);
    if (storedSettings && typeof storedSettings === "object") {
      state.settings = Object.assign({}, DEFAULT_SETTINGS, storedSettings);
    }

    var storedAlerts = Store.read(STORAGE_KEYS.alerts, null);
    if (Array.isArray(storedAlerts) && storedAlerts.length) { state.alerts = storedAlerts; }

    var storedActivity = Store.read(STORAGE_KEYS.activity, null);
    if (Array.isArray(storedActivity) && storedActivity.length) { state.activity = storedActivity; }

    var storedSchedules = Store.read(STORAGE_KEYS.schedules, null);
    if (Array.isArray(storedSchedules)) { state.schedules = storedSchedules; }

    var storedCounters = Store.read(STORAGE_KEYS.counters, null);
    if (storedCounters && typeof storedCounters === "object") {
      state.counters = Object.assign(state.counters, storedCounters);
      // Restore the live tank level and today's consumption so a refresh does
      // not silently reset the values the farmer is tracking.
      if (typeof storedCounters.tankPercent === "number") {
        state.sensors.tankPercent = clamp(storedCounters.tankPercent, 0, 100);
      }
      if (typeof storedCounters.waterUsedToday === "number") {
        state.sensors.waterUsedToday = Math.max(0, storedCounters.waterUsedToday);
      }
    }

    var storedPump = Store.read(STORAGE_KEYS.pump, null);
    if (storedPump && typeof storedPump === "object") {
      state.pump.mode = storedPump.mode || "Manual";
    }

    var storedPrefs = Store.read(STORAGE_KEYS.prefs, null);
    if (storedPrefs && typeof storedPrefs === "object") {
      state.simulation.intervalMs = storedPrefs.intervalMs || state.simulation.intervalMs;
    }
  }

  function persistPump() {
    Store.write(STORAGE_KEYS.pump, { mode: state.pump.mode, fieldId: state.pump.fieldId });
  }
  function persistCounters() {
    Store.write(STORAGE_KEYS.counters, {
      sessionsToday: state.counters.sessionsToday,
      waterSavedPercent: state.counters.waterSavedPercent,
      previousWeekLitres: state.counters.previousWeekLitres,
      tankPercent: round(state.sensors.tankPercent, 2),
      waterUsedToday: round(state.sensors.waterUsedToday, 1)
    });
  }

  /* ==========================================================================
     23. ROUTING, NAVIGATION AND SCROLL SPY
     ========================================================================== */
  function closeMobileNav() {
    var nav = $("#mainNav");
    var toggle = $("#navToggle");
    var backdrop = $("#navBackdrop");
    if (!nav) { return; }
    nav.classList.remove("is-open");
    if (toggle) { toggle.setAttribute("aria-expanded", "false"); }
    if (backdrop) { backdrop.hidden = true; }
  }

  function openMobileNav() {
    var nav = $("#mainNav");
    var toggle = $("#navToggle");
    var backdrop = $("#navBackdrop");
    if (!nav) { return; }
    nav.classList.add("is-open");
    if (toggle) { toggle.setAttribute("aria-expanded", "true"); }
    if (backdrop) { backdrop.hidden = false; }
  }

  function initNavigation() {
    var toggle = $("#navToggle");
    var backdrop = $("#navBackdrop");

    if (toggle) {
      toggle.addEventListener("click", function () {
        if ($("#mainNav").classList.contains("is-open")) { closeMobileNav(); } else { openMobileNav(); }
      });
    }
    if (backdrop) { backdrop.addEventListener("click", closeMobileNav); }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") { closeMobileNav(); }
    });

    $$('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function () {
        closeMobileNav();
      });
    });

    // Scroll spy
    var sections = $$("section[id]");
    var links = $$(".main-nav__link");
    if (!("IntersectionObserver" in window) || !sections.length) { return; }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        var id = entry.target.getAttribute("id");
        var matched = false;
        links.forEach(function (link) {
          var isMatch = link.getAttribute("data-nav") === id;
          link.classList.toggle("is-active", isMatch);
          if (isMatch) { matched = true; }
        });
        if (!matched) {
          links.forEach(function (link) {
            if (link.getAttribute("data-nav") === "overview") { link.classList.add("is-active"); }
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ==========================================================================
     24. EVENT WIRING
     ========================================================================== */
  function populateSelects() {
    ["#pumpFieldSelect", "#scheduleField", "#activityFilterField"].forEach(function (selector) {
      var select = $(selector);
      if (!select) { return; }
      var includeAll = selector === "#activityFilterField";
      select.innerHTML = (includeAll ? '<option value="">All fields</option>' : "") + state.fields.map(function (field) {
        return '<option value="' + field.id + '">' + escapeHtml(field.name + " - " + field.crop + " (" + field.area + " acres)") + "</option>";
      }).join("");
    });
    var pumpSelect = $("#pumpFieldSelect");
    if (pumpSelect) { pumpSelect.value = state.pump.fieldId; }
  }

  function wireEvents() {
    var refreshBtn = $("#refreshDataBtn");
    if (refreshBtn) { refreshBtn.addEventListener("click", function () { refreshReadings({ button: refreshBtn }); }); }
    var mobileRefresh = $("#mobileRefreshBtn");
    if (mobileRefresh) { mobileRefresh.addEventListener("click", function () { refreshReadings({ button: mobileRefresh }); }); }

    var quickPump = $("#quickPumpBtn");
    if (quickPump) { quickPump.addEventListener("click", togglePump); }
    var mobilePump = $("#mobilePumpBtn");
    if (mobilePump) { mobilePump.addEventListener("click", togglePump); }

    var pumpToggle = $("#pumpToggle");
    if (pumpToggle) {
      pumpToggle.addEventListener("click", function () {
        this.classList.add("is-busy");
        var button = this;
        window.setTimeout(function () { button.classList.remove("is-busy"); }, 400);
        togglePump();
      });
    }

    var pumpFieldSelect = $("#pumpFieldSelect");
    if (pumpFieldSelect) {
      pumpFieldSelect.addEventListener("change", function () {
        state.pump.fieldId = this.value;
        persistPump();
        renderPump();
        renderFields();
        renderRecommendation();
      });
    }

    $$(".segmented__btn").forEach(function (button) {
      button.addEventListener("click", function () { setMode(this.getAttribute("data-mode")); });
    });

    var startBtn = $("#startIrrigationBtn");
    if (startBtn) {
      startBtn.addEventListener("click", function () {
        var data = recommendationData();
        startPump({ fieldId: data.field.id, plannedMinutes: data.minutes || null, mode: state.pump.mode });
        state.recommendation.dismissed = false;
      });
    }
    var ignoreBtn = $("#ignoreRecommendationBtn");
    if (ignoreBtn) {
      ignoreBtn.addEventListener("click", function () {
        state.recommendation.dismissed = true;
        state.recommendation.dismissedAt = recommendationData().moisture;
        $("#recommendationCard").classList.add("is-dismissed");
        toast("info", "Recommendation dismissed", "The suggestion was hidden. It will return if soil moisture drops further.");
        track("recommendation.ignore", {});
      });
    }

    var weatherBtn = $("#refreshWeatherBtn");
    if (weatherBtn) { weatherBtn.addEventListener("click", refreshWeather); }

    var soilRange = $("#soilRange");
    if (soilRange) {
      soilRange.addEventListener("change", function () {
        state.ui.soilRange = this.value;
        var loader = $("#soilChartLoader");
        if (loader) {
          loader.hidden = false;
          loader.querySelector("span:last-child").textContent = "Updating soil moisture history";
          window.setTimeout(function () { loader.hidden = true; }, 350);
        }
        updateSoilChart(this.value);
        track("chart.range_change", { range: this.value });
      });
    }

    var alertFilter = $("#alertFilter");
    if (alertFilter) {
      alertFilter.addEventListener("change", function () {
        state.ui.alertFilter = this.value;
        renderAlerts();
      });
    }

    var markAll = $("#markAllReadBtn");
    if (markAll) { markAll.addEventListener("click", markAllAlertsRead); }
    var markAll2 = $("#markAllReadBtn2");
    if (markAll2) { markAll2.addEventListener("click", markAllAlertsRead); }

    var alertList = $("#alertList");
    if (alertList) {
      alertList.addEventListener("click", function (event) {
        var button = event.target.closest("button[data-action]");
        if (!button) { return; }
        var id = button.getAttribute("data-alert-id");
        if (button.getAttribute("data-action") === "read") { markAlertRead(id); }
        if (button.getAttribute("data-action") === "dismiss") { dismissAlert(id); }
      });
    }

    var bellList = $("#bellList");
    if (bellList) {
      var openFromBell = function (event) {
        var item = event.target.closest(".mini-alert");
        if (!item) { return; }
        var id = item.getAttribute("data-alert-id");
        if (id) {
          markAlertRead(id);
          window.location.hash = "#alerts";
          var dropdown = bootstrap.Dropdown.getInstance($("#notificationBell"));
          if (dropdown) { dropdown.hide(); }
        }
      };
      bellList.addEventListener("click", openFromBell);
      bellList.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openFromBell(event); }
      });
    }

    var activityTableBody = $("#activityTableBody");
    if (activityTableBody) { /* table is read only; filters below */ }

    var filterField = $("#activityFilterField");
    if (filterField) {
      filterField.addEventListener("change", function () {
        state.ui.activityFilters.fieldId = this.value;
        renderActivity();
      });
    }
    var filterStatus = $("#activityFilterStatus");
    if (filterStatus) {
      filterStatus.addEventListener("change", function () {
        state.ui.activityFilters.status = this.value;
        renderActivity();
      });
    }
    var searchInput = $("#activitySearch");
    if (searchInput) {
      var searchTimer = null;
      searchInput.addEventListener("input", function () {
        var value = this.value;
        window.clearTimeout(searchTimer);
        searchTimer = window.setTimeout(function () {
          state.ui.activityFilters.search = value;
          renderActivity();
        }, 180);
      });
    }

    var fieldGrid = $("#fieldGrid");
    if (fieldGrid) {
      fieldGrid.addEventListener("click", function (event) {
        var button = event.target.closest("button[data-field-details]");
        if (!button) { return; }
        openFieldModal(button.getAttribute("data-field-details"));
      });
    }
    var cropGrid = $("#cropGrid");
    if (cropGrid) {
      cropGrid.addEventListener("click", function (event) {
        var button = event.target.closest("button[data-field-details]");
        if (!button) { return; }
        openFieldModal(button.getAttribute("data-field-details"));
      });
    }

    var fieldModalFooter = $("#fieldModalFooter");
    if (fieldModalFooter) {
      fieldModalFooter.addEventListener("click", function (event) {
        var button = event.target.closest("button[data-modal-action]");
        if (!button) { return; }
        var fieldId = this.getAttribute("data-field-id");
        var action = button.getAttribute("data-modal-action");
        var modal = bootstrap.Modal.getInstance($("#fieldModal"));
        if (action === "start") {
          var field = fieldById(fieldId);
          startPump({ fieldId: fieldId, plannedMinutes: field && field.moisture < state.settings.threshold ? 25 : 15 });
          if (modal) { modal.hide(); }
        } else if (action === "stop") {
          stopPump("stopped");
          if (modal) { modal.hide(); }
        } else if (action === "schedule") {
          if (modal) { modal.hide(); }
          var select = $("#scheduleField");
          if (select) { select.value = fieldId; }
          window.location.hash = "#activity";
          var timeInput = $("#scheduleTime");
          if (timeInput && !timeInput.value) { timeInput.value = "06:30"; }
          var dateInput = $("#scheduleDate");
          if (dateInput && !dateInput.value) { dateInput.value = toISODate(new Date(Date.now() + 86400000)); }
          if (timeInput) { window.setTimeout(function () { timeInput.focus(); }, 500); }
        }
      });
    }

    var scheduleForm = $("#scheduleForm");
    if (scheduleForm) {
      scheduleForm.addEventListener("submit", submitSchedule);
      scheduleForm.addEventListener("reset", function () {
        $$("#scheduleForm .is-invalid").forEach(function (input) { input.classList.remove("is-invalid"); });
        $$("#scheduleForm .field__error").forEach(function (error) { error.hidden = true; });
        window.setTimeout(function () {
          $("#scheduleDate").value = toISODate(new Date());
          $("#scheduleTime").value = "06:30";
          $("#scheduleDuration").value = "20";
          $("#scheduleField").value = state.fields[1] ? state.fields[1].id : state.fields[0].id;
        }, 0);
      });
    }

    var scheduleList = $("#scheduleList");
    if (scheduleList) {
      scheduleList.addEventListener("click", function (event) {
        var cancel = event.target.closest("button[data-schedule-cancel]");
        if (cancel) { cancelSchedule(cancel.getAttribute("data-schedule-cancel")); return; }
        var now = event.target.closest("button[data-schedule-now]");
        if (now) {
          var id = now.getAttribute("data-schedule-now");
          var schedule = state.schedules.filter(function (item) { return item.id === id; })[0];
          if (schedule) {
            startScheduleNow(id);
            window.location.hash = "#irrigation-control";
            toast("info", "Irrigation started", fieldById(schedule.fieldId).name + " irrigation started from the schedule list.");
          }
        }
      });
    }

    var settingsForm = $("#settingsForm");
    if (settingsForm) { settingsForm.addEventListener("submit", saveSettings); }

    var thresholdRange = $("#thresholdRange");
    var thresholdInput = $("#thresholdInput");
    if (thresholdRange && thresholdInput) {
      thresholdRange.addEventListener("input", function () { thresholdInput.value = this.value; });
      thresholdInput.addEventListener("input", function () {
        var value = Number(this.value);
        if (value >= 15 && value <= 60) { thresholdRange.value = value; }
      });
    }

    var resetSettingsBtn = $("#resetSettingsBtn");
    if (resetSettingsBtn) { resetSettingsBtn.addEventListener("click", resetSettings); }

    var unitsSelect = $("#unitsSelect");
    if (unitsSelect) {
      unitsSelect.addEventListener("change", function () {
        state.settings.units = this.value;
        applyUnitLabels();
        renderKpis(); renderTank(); renderWeather(); renderActivity();
        updateWaterChart(); updateSoilChart(state.ui.soilRange); renderPump(); renderStats();
      });
    }

    var autoToggle = $("#autoIrrigationToggle");
    if (autoToggle) {
      autoToggle.addEventListener("change", function () {
        state.settings.autoIrrigation = this.checked;
        setText("#autoIrrigationState", this.checked
          ? "Enabled. The pump will start automatically when the average soil moisture falls below " + state.settings.threshold + "%."
          : "Currently disabled.");
        evaluateRules();
      });
    }

    var notifToggle = $("#notificationsToggleAlerts");
    if (notifToggle) {
      notifToggle.addEventListener("change", function () {
        state.settings.notifications = this.checked;
        Store.write(STORAGE_KEYS.settings, state.settings);
        if (this.checked) { toast("success", "Notifications enabled", "You will now see messages for important irrigation events."); }
        track("settings.notifications", { enabled: this.checked });
      });
    }

    var simSpeed = $("#simSpeed");
    if (simSpeed) {
      simSpeed.addEventListener("change", function () {
        state.simulation.intervalMs = Number(this.value);
        Store.write(STORAGE_KEYS.prefs, { intervalMs: state.simulation.intervalMs });
        if (state.simulation.running) { startSimulation(); }
        renderSimFacts();
        toast("info", "Update speed changed", "Sensors now update every " + (state.simulation.intervalMs / 1000) + " seconds.");
      });
    }

    var simPause = $("#simPauseToggle");
    if (simPause) {
      simPause.addEventListener("change", function () {
        state.simulation.running = this.checked;
        if (this.checked) {
          startSimulation();
          toast("success", "Live updates resumed", "Simulated sensor readings are updating again.");
        } else {
          stopSimulation();
          toast("info", "Live updates paused", "Readings are frozen until you resume the simulation.");
        }
        renderSimFacts();
        renderSensors();
      });
    }

    var simOutage = $("#simOutageToggle");
    if (simOutage) {
      simOutage.addEventListener("change", function () { setOutage(this.checked); });
    }

    var retryButtons = $$("[data-retry]");
    retryButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        if (state.simulation.outages) {
          setOutage(false);
          var outageToggle = $("#simOutageToggle");
          if (outageToggle) { outageToggle.checked = false; }
        } else {
          refreshReadings({ button: button });
        }
      });
    });

    ["#exportDataBtn", "#exportDataBtn2"].forEach(function (selector) {
      var button = $(selector);
      if (button) { button.addEventListener("click", exportData); }
    });
    ["#resetDemoBtn", "#resetDemoBtn2"].forEach(function (selector) {
      var button = $(selector);
      if (button) { button.addEventListener("click", function () { resetDemoData(false); }); }
    });

    var cookiePrefs = $("#cookiePrefsToggle");
    if (cookiePrefs) {
      cookiePrefs.addEventListener("change", function () {
        if (this.checked) {
          Store.available = true;
          toast("success", "Local storage enabled", "Dashboard settings and schedules will be remembered in this browser.");
        } else {
          Store.clearAll();
          Store.available = false;
          toast("warning", "Local storage disabled", "Saved values were cleared and new changes will not be remembered after a refresh.");
        }
      });
    }

    // Keep countdown and relative time labels ticking
    var bellTick = 0;
    timers.clock = window.setInterval(function () {
      updateLastUpdated();
      renderSimFacts();
      if (state.pump.on) { renderPump(); }
      // Refresh relative timestamps in the notification panel every 15 seconds
      bellTick += 1;
      if (bellTick % 15 === 0) { renderBell(); }
    }, CONFIG.clockInterval);

    timers.schedule = window.setInterval(function () {
      processDueSchedules();
      renderSchedules();
    }, CONFIG.scheduleCheckInterval);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stopSimulation();
      } else if (state.simulation.running) {
        startSimulation();
      }
    });
  }

  /* ==========================================================================
     25. RENDER ALL
     ========================================================================== */
  function renderAll() {
    populateSelects();
    applyUnitLabels();
    loadSettingsIntoForm();
    renderKpis();
    renderTank();
    renderPump();
    renderFields();
    renderCrops();
    renderStats();
    renderHealth();
    renderWeather();
    renderSensors();
    renderAlerts();
    renderBell();
    renderActivity();
    renderSchedules();
    renderRecommendation();
    renderStorageInfo();
    renderSimFacts();
    updateLastUpdated();
    evaluateRules();
  }

  /* ==========================================================================
     26. STARTUP
     ========================================================================== */
  function initFormDefaults() {
    var dateInput = $("#scheduleDate");
    var timeInput = $("#scheduleTime");
    if (dateInput) { dateInput.value = toISODate(new Date()); }
    if (timeInput) { timeInput.value = "06:30"; }
    if (dateInput) { dateInput.min = toISODate(new Date()); }
    var scheduleField = $("#scheduleField");
    if (scheduleField) { scheduleField.value = "B"; }
    var simSpeed = $("#simSpeed");
    if (simSpeed) { simSpeed.value = String(state.simulation.intervalMs); }
  }

  function showLoadingState() {
    // Brief skeleton state so loading feedback is real, then bind live values.
    $$("[data-bind]").forEach(function (node) {
      if (!node.textContent || node.textContent.indexOf("--") === 0) { node.classList.add("is-loading-region"); }
    });
  }

  function clearLoadingState() {
    $$(".is-loading-region").forEach(function (node) { node.classList.remove("is-loading-region"); });
  }

  function init() {
    showLoadingState();
    restoreStoredState();
    seedDemonstrationData();
    initializeHistory();

    window.setTimeout(function () {
      initFormDefaults();
      renderAll();
      initCharts();
      wireEvents();
      initNavigation();
      clearLoadingState();
      startSimulation();
      renderSimFacts();

      var statusLabel = $("#sensorSourceLabel");
      if (statusLabel) {
        statusLabel.textContent = state.simulation.outages
          ? "Sensor node offline (simulated)"
          : "Sensor node AF-01 to AF-03 (simulated)";
      }
      if (!Store.available) {
        toast("warning", "Local storage blocked",
          "Your browser blocked local storage, so settings and schedules will not be remembered after a refresh.");
      }
      track("app.load", { updates: 0 });
    }, 260);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
