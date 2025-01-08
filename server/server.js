// server/server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { Pool } = require('pg');
const fs = require('fs');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'spotifystats',
    password: 'zzbros22',
    port: 5432,
});

// Helper function to process JSON data in chunks
async function processJsonInChunks(filePath) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const chunkSize = 1000; // Process 1000 records at a time
    
    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await insertDataChunk(chunk);
    }
}

// Helper function to insert a chunk of data
async function insertDataChunk(records) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        for (const record of records) {
            if (!record.master_metadata_track_name) {
                console.log('Skipping record; missing track_name:', record);
                continue; 
            }
            const query = `
                INSERT INTO listening_history 
                (track_name, artist_name, album_name, played_at, ms_played, platform, spotify_track_uri)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;
            const values = [
                record.master_metadata_track_name,
                record.master_metadata_album_artist_name,
                record.master_metadata_album_album_name,
                record.ts,
                record.ms_played,
                record.platform,
                record.spotify_track_uri
            ];
            await client.query(query, values);
        }

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

// Upload and process endpoint
// server/server.js - Modify the upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        console.log('File received:', req.file); // Add this log
        
        try {
            await processJsonInChunks(req.file.path);
        } catch (processError) {
            console.error('Error processing JSON:', processError); // Add this log
            throw processError;
        }
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        
        res.json({ message: 'File processed successfully' });
    } catch (error) {
        console.error('Full error details:', error); // Enhanced error logging
        res.status(500).json({ error: 'Processing failed: ' + error.message });
    }
});

// Get top artists
app.get('/api/stats/top-artists', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                artist_name,
                COUNT(*) as play_count,
                SUM(ms_played) as total_time_played
            FROM listening_history
            GROUP BY artist_name
            ORDER BY play_count DESC
            LIMIT 10
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch top artists' });
    }
});

// Get listening patterns by time
app.get('/api/stats/time-patterns', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                EXTRACT(HOUR FROM played_at) as hour,
                COUNT(*) as play_count
            FROM listening_history
            GROUP BY hour
            ORDER BY hour
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch time patterns' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});