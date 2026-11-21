
const mysql = require('mysql2');
require('dotenv').config({
    path: require('path').join(__dirname, '.env')
});

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'incidentlab',
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }

    console.log('Connected to IncidentLab database!');
});

module.exports = db;
