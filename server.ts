import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_DATA = {
  maintenance: {
    enabled: false,
    message: 'System maintenance in progress. Updating audio streams. Please check back shortly!',
    updatedAt: new Date().toISOString(),
    hasCountdown: false,
    estimatedFinishTime: null,
  },
  banner: {
    enabled: true,
    versionName: 'v2.5 Liquid Crystal',
    sloganText: 'School Audio Stream Hub · by LiamDev12027',
    colorTheme: 'cyan-violet',
    ribbonEnabled: true,
    ribbonNotice: 'All audio streams are school-safe and work without YouTube access · LiamDev12027',
  },
  popups: [
    {
      id: 'popup-welcome-school',
      targetUserId: 'all',
      title: 'Welcome to YouSong by LiamDev12027',
      message:
        'Welcome to YouSong! Created by LiamDev12027. Browse songs, create playlists, and request any song directly to LiamDev12027.',
      type: 'announcement',
      createdAt: new Date().toISOString(),
      active: true,
    },
  ],
  songRequests: [
    {
      id: 'req-welcome-1',
      songTitle: 'Clair de Lune',
      artist: 'Claude Debussy',
      webLink: '',
      notes: 'Need this peaceful piano track for studying AP Chem!',
      requestedByUserId: 'user-pending-1',
      requestedByUsername: 'jordan_ap_chem',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      status: 'pending',
    },
  ],
};

function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      return {
        ...DEFAULT_DATA,
        ...data,
        maintenance: { ...DEFAULT_DATA.maintenance, ...(data.maintenance || {}) },
        banner: { ...DEFAULT_DATA.banner, ...(data.banner || {}) },
      };
    }
  } catch (err) {
    console.error('Error reading db.json:', err);
  }
  return { ...DEFAULT_DATA };
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing db.json:', err);
  }
}

if (!fs.existsSync(DB_FILE)) {
  writeDb(DEFAULT_DATA);
}

app.use(express.json({ limit: '50mb' }));

// Health / Status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  const db = readDb();
  res.json({
    status: 'online',
    appName: 'YouSong',
    creator: 'LiamDev12027',
    version: db.banner?.versionName || 'v2.5 Liquid Crystal',
    maintenance: db.maintenance || DEFAULT_DATA.maintenance,
    banner: db.banner || DEFAULT_DATA.banner,
  });
});

// Banner / Branding Configuration API
app.get('/api/banner', (req: Request, res: Response) => {
  const db = readDb();
  res.json({ banner: db.banner || DEFAULT_DATA.banner });
});

app.post('/api/admin/banner', (req: Request, res: Response) => {
  const { enabled, versionName, sloganText, colorTheme, ribbonEnabled, ribbonNotice } = req.body;
  const db = readDb();
  db.banner = {
    enabled: enabled !== undefined ? !!enabled : db.banner.enabled,
    versionName: (versionName || db.banner.versionName || 'v2.5 Liquid Crystal').trim(),
    sloganText: (sloganText || db.banner.sloganText || 'School Audio Stream Hub · by LiamDev12027').trim(),
    colorTheme: colorTheme || db.banner.colorTheme || 'cyan-violet',
    ribbonEnabled: ribbonEnabled !== undefined ? !!ribbonEnabled : db.banner.ribbonEnabled,
    ribbonNotice: (ribbonNotice || db.banner.ribbonNotice || '').trim(),
  };
  writeDb(db);
  res.json({ success: true, banner: db.banner });
});

// Update maintenance mode with optional countdown (admin)
app.post('/api/admin/maintenance', (req: Request, res: Response) => {
  const { enabled, message, hasCountdown, estimatedFinishTime } = req.body;
  const db = readDb();
  db.maintenance = {
    enabled: !!enabled,
    message: message || db.maintenance?.message || 'System maintenance in progress.',
    updatedAt: new Date().toISOString(),
    hasCountdown: !!hasCountdown,
    estimatedFinishTime: hasCountdown ? estimatedFinishTime || null : null,
  };
  writeDb(db);
  res.json({ success: true, maintenance: db.maintenance });
});

// Song Requests API
app.get('/api/requests', (req: Request, res: Response) => {
  const db = readDb();
  res.json({ requests: db.songRequests || [] });
});

app.post('/api/requests', (req: Request, res: Response) => {
  const { songTitle, artist, webLink, notes, requestedByUserId, requestedByUsername } = req.body;
  if (!songTitle || !songTitle.trim()) {
    res.status(400).json({ error: 'Song title is required' });
    return;
  }
  const db = readDb();
  const newRequest = {
    id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    songTitle: songTitle.trim(),
    artist: (artist || '').trim(),
    webLink: (webLink || '').trim(),
    notes: (notes || '').trim(),
    requestedByUserId: requestedByUserId || 'guest',
    requestedByUsername: (requestedByUsername || 'Student').trim(),
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  db.songRequests = [newRequest, ...(db.songRequests || [])];
  writeDb(db);
  res.json({ success: true, request: newRequest });
});

app.patch('/api/admin/requests/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, adminNote } = req.body;
  const db = readDb();
  const index = (db.songRequests || []).findIndex((r: any) => r.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }
  if (status) db.songRequests[index].status = status;
  if (adminNote !== undefined) db.songRequests[index].adminNote = adminNote;
  writeDb(db);
  res.json({ success: true, request: db.songRequests[index] });
});

app.delete('/api/admin/requests/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();
  db.songRequests = (db.songRequests || []).filter((r: any) => r.id !== id);
  writeDb(db);
  res.json({ success: true });
});

// Server popups API
app.get('/api/popups', (req: Request, res: Response) => {
  const db = readDb();
  res.json({ popups: db.popups || [] });
});

app.post('/api/popups', (req: Request, res: Response) => {
  const { targetUserId, title, message, type } = req.body;
  const db = readDb();
  const newPopup = {
    id: `popup-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    targetUserId: targetUserId || 'all',
    title: title || 'Notice',
    message: message || '',
    type: type || 'announcement',
    createdAt: new Date().toISOString(),
    active: true,
  };
  db.popups = [newPopup, ...(db.popups || [])];
  writeDb(db);
  res.json({ success: true, popup: newPopup });
});

app.delete('/api/popups/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();
  db.popups = (db.popups || []).filter((p: any) => p.id !== id);
  writeDb(db);
  res.json({ success: true });
});

// Start server with Vite middleware in dev or static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`YouSong Server listening on port ${PORT} (created by LiamDev12027)`);
  });
}

startServer();
