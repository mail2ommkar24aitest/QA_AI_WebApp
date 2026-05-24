const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root' // Adjust if needed
};

async function setup() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL...');

        const sql = fs.readFileSync(path.join(__dirname, '../db/setup.sql'), 'utf8');
        const commands = sql.split(';').filter(cmd => cmd.trim());

        for (let cmd of commands) {
            console.log(`Executing: ${cmd.substring(0, 50)}...`);
            await connection.query(cmd);
        }

        console.log('Database setup completed successfully!');
        await connection.end();
    } catch (error) {
        console.error('Setup failed:', error.message);
        console.log('Please ensure MySQL is running and the password in server/setup-db.js matches your "root" password.');
    }
}

setup();
