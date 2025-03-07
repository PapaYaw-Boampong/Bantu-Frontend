import express from 'express';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// Transcription endpoint
app.post('/api/transcribe', async (req, res) => {
  const { audioUrl, language } = req.body;

  try {
    // Simulate transcription process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const transcription = "This is a simulated transcription result.";
    
    // Store the result
    await pool.query(
      'INSERT INTO transcriptions (audio_url, language, text) VALUES ($1, $2, $3)',
      [audioUrl, language, transcription]
    );

    res.json({ transcription });
  } catch (error) {
    console.error('Error during transcription:', error);
    res.status(500).json({ error: 'Error processing transcription' });
  }
});

// Translation endpoint
app.post('/api/translate', async (req, res) => {
  const { text, sourceLang, targetLang } = req.body;

  try {
    // Simulate translation process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const translation = "This is a simulated translation result.";
    
    // Store the result
    await pool.query(
      'INSERT INTO translations (source_text, source_lang, target_lang, translated_text) VALUES ($1, $2, $3, $4)',
      [text, sourceLang, targetLang, translation]
    );

    res.json({ translation });
  } catch (error) {
    console.error('Error during translation:', error);
    res.status(500).json({ error: 'Error processing translation' });
  }
});

const PORT = process.env.API_SERVICE_PORT || 3002;
app.listen(PORT, () => {
  console.log(`API service running on port ${PORT}`);
});