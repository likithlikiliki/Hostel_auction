const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const csv = require('csv-parser');
const store = require('../store');

// Setup uploads directory
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'players');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `player_${Date.now()}_${Math.round(Math.random() * 1e5)}${ext}`;
    cb(null, uniqueName);
  }
});

// Multer Filter (JPG, JPEG, PNG only)
const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG, and WEBP image formats are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Multer storage for CSV/Excel imports
const docStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `import_${Date.now()}_${file.originalname}`);
  }
});
const uploadDoc = multer({ storage: docStorage });

// GET all players (with optional query filter: category, status, search)
router.get('/', (req, res) => {
  let players = store.getPlayers();
  const { category, status, search } = req.query;

  if (category && category !== 'All') {
    players = players.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (status && status !== 'All') {
    players = players.filter(p => p.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    players = players.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.id.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, count: players.length, players });
});

// GET single player
router.get('/:id', (req, res) => {
  const player = store.getPlayer(req.params.id);
  if (!player) {
    return res.status(404).json({ success: false, message: 'Player not found' });
  }
  res.json({ success: true, player });
});

// POST single player photo upload
router.post('/upload-photo', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No photo file provided' });
  }

  const photoUrl = `/uploads/players/${req.file.filename}`;
  res.json({
    success: true,
    photoUrl,
    filename: req.file.filename,
    originalName: req.file.originalname
  });
});

// POST create player manually
router.post('/', (req, res) => {
  const { id, name, photoUrl, category, basePrice, status } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Player Name is required' });
  }

  // Check unique ID if provided
  if (id && store.getPlayer(id)) {
    return res.status(400).json({ success: false, message: `Player ID '${id}' already exists` });
  }

  const newPlayer = store.createPlayer({
    id,
    name,
    photoUrl: photoUrl || '',
    category: category || 'Batsman',
    basePrice: Number(basePrice) || 500,
    status: status || 'Available'
  });

  res.status(201).json({ success: true, player: newPlayer });
});

// PUT update player
router.put('/:id', (req, res) => {
  const updatedPlayer = store.updatePlayer(req.params.id, req.body);
  if (!updatedPlayer) {
    return res.status(404).json({ success: false, message: 'Player not found' });
  }
  res.json({ success: true, player: updatedPlayer });
});

// DELETE player
router.delete('/:id', (req, res) => {
  const player = store.getPlayer(req.params.id);
  if (!player) {
    return res.status(404).json({ success: false, message: 'Player not found' });
  }

  if (player.status === 'In Auction') {
    return res.status(400).json({ success: false, message: 'Cannot delete player currently in active auction' });
  }

  store.deletePlayer(req.params.id);
  res.json({ success: true, message: 'Player deleted successfully' });
});

// POST bulk import from CSV/Excel file upload
router.post('/import-file', uploadDoc.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a CSV or Excel (.xlsx) file' });
  }

  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();
  const parsedPlayers = [];

  try {
    if (ext === '.xlsx' || ext === '.xls') {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet);

      rows.forEach((row, i) => {
        // Map common column name variations
        const id = row['Player ID'] || row['PlayerId'] || row['ID'] || row['id'] || `P${String(Date.now() + i).slice(-4)}`;
        const name = row['Player Name'] || row['Name'] || row['name'] || row['Player'] || '';
        const category = row['Category'] || row['Role'] || row['category'] || 'Batsman';
        const basePrice = row['Base Price'] || row['BasePrice'] || row['Price'] || row['basePrice'] || 500;
        const photo = row['Photo'] || row['PhotoUrl'] || row['photo'] || row['photoUrl'] || '';

        if (name.trim()) {
          parsedPlayers.push({
            id: String(id).trim(),
            name: String(name).trim(),
            category: normalizeCategory(category),
            basePrice: Number(basePrice) || 500,
            photoUrl: photo ? String(photo).trim() : ''
          });
        }
      });
    } else if (ext === '.csv') {
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            const id = row['Player ID'] || row['PlayerId'] || row['ID'] || row['id'];
            const name = row['Player Name'] || row['Name'] || row['name'] || row['Player'] || '';
            const category = row['Category'] || row['Role'] || row['category'] || 'Batsman';
            const basePrice = row['Base Price'] || row['BasePrice'] || row['Price'] || row['basePrice'] || 500;
            const photo = row['Photo'] || row['PhotoUrl'] || row['photo'] || row['photoUrl'] || '';

            if (name.trim()) {
              parsedPlayers.push({
                id: id ? String(id).trim() : undefined,
                name: String(name).trim(),
                category: normalizeCategory(category),
                basePrice: Number(basePrice) || 500,
                photoUrl: photo ? String(photo).trim() : ''
              });
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });
    } else {
      // Clean temp file
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: 'Unsupported file format. Please upload .csv or .xlsx' });
    }

    // Clean temp file
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    if (parsedPlayers.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid player records found in the file' });
    }

    const added = store.bulkAddPlayers(parsedPlayers);
    res.json({
      success: true,
      message: `Successfully imported ${added.length} players`,
      importedCount: added.length,
      players: added
    });
  } catch (error) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error('Import error:', error);
    res.status(500).json({ success: false, message: `Import failed: ${error.message}` });
  }
});

// Helper category normalizer
function normalizeCategory(cat) {
  if (!cat) return 'Batsman';
  const c = String(cat).toLowerCase();
  if (c.includes('bowl')) return 'Bowler';
  if (c.includes('all') || c.includes('round')) return 'All-Rounder';
  if (c.includes('keep') || c.includes('wk') || c.includes('wicket')) return 'Wicket Keeper';
  return 'Batsman';
}

module.exports = router;
