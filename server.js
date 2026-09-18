import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// API routes first
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'AquaFarm Dashboard' });
});

// Serve static dashboard files
const staticDir = path.join(__dirname, 'irrigation-dashboard');
app.use(express.static(staticDir));

// Fallback to index.html for any unhandled routes
app.use((req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`AquaFarm dashboard listening on http://${HOST}:${PORT}`);
});
