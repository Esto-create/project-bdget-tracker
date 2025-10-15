// db/db.js
import mysql from 'mysql2/promise';
import 'dotenv/config';

// Create the connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/**
 * Utility function to execute a query against the pool.
 * @param {string} sql - The SQL query string.
 * @param {Array} params - Parameters to be escaped in the query.
 * @returns {Promise<Array>} - Query results.
 */
async function executeQuery(sql, params) {
    try {
        const [rows, fields] = await pool.execute(sql, params);
        return [rows, fields];
    } catch (error) {
        console.error("Database query failed:", sql, params, error);
        throw error;
    }
}

export default executeQuery;
