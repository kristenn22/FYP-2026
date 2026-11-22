
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// Test backend connection
app.get('/', (req, res) => {
    res.send('IncidentLab Backend is running!');
});

// Test database connection
app.get('/test-db', (req, res) => {
    db.query('SHOW TABLES', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(results);
    });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`IncidentLab server running on port ${PORT}`);
});
