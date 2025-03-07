import express from 'express';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__dirname);

const app = express();
const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'bantu',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Upload audio file
app.post('/storage/upload', async (req, res) => {
  const { fileName, fileType, userId } = req.body;

  try {
    // Generate a presigned URL for direct upload
    const uploadUrl = `https://storage.example.com/${fileName}`;
    
    // Store file metadata
    await pool.query(
      'INSERT INTO files (file_name, file_type, user_id, storage_url) VALUES ($1, $2, $3, $4)',
      [fileName, fileType, userId, uploadUrl]
    );

    res.json({ uploadUrl });
  } catch (error) {
    console.error('Error handling upload:', error);
    res.status(500).json({ error: 'Error processing upload' });
  }
});

// Download audio file
app.get('/storage/download/:fileId', async (req, res) => {
  const { fileId } = req.params;

  try {
    const result = await pool.query(
      'SELECT storage_url FROM files WHERE id = $1',
      [fileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Generate a presigned URL for download
    const downloadUrl = result.rows[0].storage_url;

    res.json({ downloadUrl });
  } catch (error) {
    console.error('Error handling download:', error);
    res.status(500).json({ error: 'Error processing download' });
  }
});

const PORT = process.env.STORAGE_SERVICE_PORT || 3003;
app.listen(PORT, () => {
  console.log(`Storage service running on port ${PORT}`);
});