const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// Root Endpoint for health check
app.get('/', (req, res) => {
    res.send('AI MySQL MCP Backend is running. Use POST /api/query to interact.');
});

// Database Connection Configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'mcp_ai_demotest'
};

/**
 * MCP-style Workflow Explanation:
 * 1. AI Interprets Prompt: The `generateSQL` function simulates an AI model 
 *    that takes natural language and converts it into a structured SQL query.
 * 2. Tool/Database Operation Executed: The generated SQL is then executed 
 *    against the MySQL database using the `mysql2` driver.
 * 3. Response Returned: The raw database results are returned to the frontend 
 *    along with the generated SQL for transparency.
 */

// AI logic – maps natural language prompts to SQL for all 4 tables:
//   customers (id, name, city, age)
//   orders (order_id, customer_id, subject, company, order_date)
//   registrationdetails (id_number, first_name, last_name, phone_number, occupation, gender, password, is_18_or_older)
//   usernames (id_number, email)

function generateSQL(prompt) {
    const input = prompt.toLowerCase().trim();

    // ─────────────────────────────────────────────
    // 7. RAW SQL PASSTHROUGH
    // ─────────────────────────────────────────────
    // Moved to top: if the user provides a raw SQL query, use it directly before trying natural language rules.
    if (/^(select|insert|update|delete|describe|alter|drop|create)\s+/i.test(input) || /^(show\s+(tables|databases|columns))/i.test(input)) {
        return prompt;
    }

    // ─────────────────────────────────────────────
    // 1. CUSTOMERS TABLE
    // ─────────────────────────────────────────────

    // City filter  (must come before generic "show customers")
    if ((input.includes('customers from') || input.includes('customers in')) && !input.includes('order')) {
        const city = prompt.split(/from|in/i).pop().trim().replace(/[?!.]/g, '');
        return `SELECT * FROM customers WHERE city = '${city}';`;
    }

    // Age filter – "customers above age 30", "customers older than 25", "show customers with age > 28"
    if (input.includes('customer') && (/above age|older than|age\s*>|age\s*greater/i.test(input)) && /\d+/.test(input)) {
        const age = input.match(/\d+/)[0];
        return `SELECT * FROM customers WHERE age > ${age};`;
    }
    if (input.includes('customer') && (/below age|younger than|age\s*</i.test(input)) && /\d+/.test(input)) {
        const age = input.match(/\d+/)[0];
        return `SELECT * FROM customers WHERE age < ${age};`;
    }

    // Customers who placed at least one order (JOIN)
    if (input.includes('customer') && (input.includes('placed') || input.includes('at least one order') || input.includes('have order'))) {
        return "SELECT DISTINCT c.* FROM customers c JOIN orders o ON c.id = o.customer_id;";
    }

    // Customers who have NOT placed any order
    if (input.includes('customer') && (input.includes('not placed') || input.includes('no order') || input.includes('without order'))) {
        return "SELECT * FROM customers WHERE id NOT IN (SELECT DISTINCT customer_id FROM orders);";
    }

    // Count customers
    if (input.includes('count') && input.includes('customer')) {
        return "SELECT COUNT(*) AS total_customers FROM customers;";
    }

    // Average age of customers
    if (input.includes('average age') && input.includes('customer')) {
        return "SELECT AVG(age) AS average_age FROM customers;";
    }

    // Customers sorted by age
    if (input.includes('customer') && input.includes('sort') && input.includes('age')) {
        if (input.includes('desc')) return "SELECT * FROM customers ORDER BY age DESC;";
        return "SELECT * FROM customers ORDER BY age ASC;";
    }

    // Customers sorted by name
    if (input.includes('customer') && input.includes('sort') && input.includes('name')) {
        return "SELECT * FROM customers ORDER BY name ASC;";
    }

    // Show all customers  (generic catch-all for customer table, keep AFTER specific filters)
    if (input.includes('customer') &&
        (input.includes('show') || input.includes('get') || input.includes('list') ||
         input.includes('display') || input.includes('fetch') || input.includes('all')) &&
        !input.includes('order') && !input.includes('registration') && !input.includes('username')) {
        return "SELECT * FROM customers;";
    }

    // ─────────────────────────────────────────────
    // 2. ORDERS TABLE
    // ─────────────────────────────────────────────

    // Orders for a specific customer name
    if (input.includes('orders for')) {
        const name = prompt.split(/for/i).pop().trim().replace(/[?!.]/g, '');
        return `SELECT o.* FROM orders o JOIN customers c ON o.customer_id = c.id WHERE c.name LIKE '%${name}%';`;
    }

    // Latest / most recent order for each customer
    if (input.includes('latest order') || input.includes('most recent order') || input.includes('last order')) {
        return "SELECT c.name, o.* FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.order_date = (SELECT MAX(o2.order_date) FROM orders o2 WHERE o2.customer_id = o.customer_id);";
    }

    // Orders by company
    if (input.includes('orders') && (input.includes('company') || input.includes('from company'))) {
        const company = prompt.split(/company/i).pop().trim().replace(/[?!.]/g, '');
        if (company.length > 1) {
            return `SELECT * FROM orders WHERE company LIKE '%${company}%';`;
        }
        return "SELECT DISTINCT company FROM orders;";
    }

    // Orders by subject
    if (input.includes('orders') && input.includes('subject')) {
        const subject = prompt.split(/subject/i).pop().trim().replace(/[?!.]/g, '');
        if (subject.length > 1) {
            return `SELECT * FROM orders WHERE subject LIKE '%${subject}%';`;
        }
        return "SELECT DISTINCT subject FROM orders;";
    }

    // Orders after a date
    if (input.includes('orders') && input.includes('after') && /\d{4}/.test(input)) {
        const dateMatch = input.match(/\d{4}-\d{2}-\d{2}/);
        if (dateMatch) return `SELECT * FROM orders WHERE order_date > '${dateMatch[0]}';`;
    }

    // Count orders
    if (input.includes('count') && input.includes('order')) {
        return "SELECT COUNT(*) AS total_orders FROM orders;";
    }

    // Total orders per customer
    if ((input.includes('total orders') || input.includes('number of orders') || input.includes('orders per customer'))) {
        return "SELECT c.name, COUNT(o.order_id) AS total_orders FROM customers c LEFT JOIN orders o ON c.id = o.customer_id GROUP BY c.name;";
    }

    // Show all orders
    if (input.includes('order') &&
        (input.includes('show') || input.includes('get') || input.includes('list') ||
         input.includes('display') || input.includes('all'))) {
        return "SELECT * FROM orders;";
    }

    // ─────────────────────────────────────────────
    // 3. REGISTRATIONDETAILS TABLE
    // ─────────────────────────────────────────────

    // Registration by occupation
    if (input.includes('registration') && input.includes('occupation')) {
        const occ = prompt.split(/occupation/i).pop().trim().replace(/[?!.]/g, '');
        if (occ.length > 1) {
            return `SELECT * FROM registrationdetails WHERE occupation LIKE '%${occ}%';`;
        }
        return "SELECT DISTINCT occupation FROM registrationdetails;";
    }

    // Registration by gender
    if (input.includes('registration') && (input.includes('male') || input.includes('female'))) {
        const gender = input.includes('female') ? 'Female' : 'Male';
        return `SELECT * FROM registrationdetails WHERE gender = '${gender}';`;
    }

    // Registrations who are 18 or older
    if (input.includes('registration') && (input.includes('18') || input.includes('adult') || input.includes('older'))) {
        return "SELECT * FROM registrationdetails WHERE is_18_or_older = 1;";
    }

    // Registration with email (JOIN usernames)
    if (input.includes('registration') && input.includes('email')) {
        return "SELECT r.*, u.email FROM registrationdetails r JOIN usernames u ON r.id_number = u.id_number;";
    }

    // Show all registrations
    if (input.includes('registration') &&
        (input.includes('show') || input.includes('get') || input.includes('list') ||
         input.includes('display') || input.includes('all'))) {
        return "SELECT * FROM registrationdetails;";
    }

    // ─────────────────────────────────────────────
    // 4. USERNAMES TABLE
    // ─────────────────────────────────────────────

    // Usernames/Customers with gmail
    if ((input.includes('username') || input.includes('customer') || input.includes('email')) && input.includes('gmail')) {
        return "SELECT * FROM usernames WHERE email LIKE '%gmail.com%';";
    }

    // Show all usernames
    if (input.includes('username') &&
        (input.includes('show') || input.includes('get') || input.includes('list') ||
         input.includes('display') || input.includes('all') || input.includes('email'))) {
        return "SELECT * FROM usernames;";
    }

    // ─────────────────────────────────────────────
    // 5. CROSS-TABLE / JOIN QUERIES
    // ─────────────────────────────────────────────

    // Join customers with orders
    if (input.includes('join') && input.includes('customer') && input.includes('order')) {
        return "SELECT c.name, c.city, c.age, o.order_id, o.subject, o.company, o.order_date FROM customers c JOIN orders o ON c.id = o.customer_id;";
    }

    // Join registrations with usernames
    if (input.includes('join') && input.includes('registration') && input.includes('username')) {
        return "SELECT r.id_number, r.first_name, r.last_name, u.email, r.occupation, r.gender FROM registrationdetails r JOIN usernames u ON r.id_number = u.id_number;";
    }

    // Update customer city (natural language mock)
    if (input.includes('update') && input.includes('customer') && input.includes('city')) {
        return "UPDATE customers SET city = 'Updated City' WHERE id = 1;";
    }

    // Update username email (natural language mock)
    if (input.includes('update') && (input.includes('username') || input.includes('email'))) {
        return "UPDATE usernames SET email = 'updated@gmail.com' WHERE id_number = 'USER001';";
    }

    // ─────────────────────────────────────────────
    // 6. SHOW ALL TABLES
    // ─────────────────────────────────────────────
    if (input.includes('show tables') || input.includes('list tables') || input.includes('all tables')) {
        return "SHOW TABLES;";
    }

    // ─────────────────────────────────────────────
    // FALLBACK – return helpful message instead of SELECT 1
    // ─────────────────────────────────────────────
    return null;
}

// API Endpoint
app.post('/api/query', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        // 1. AI interprets prompt
        const sql = generateSQL(prompt);

        // 2. Database operation executed
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(sql);
        await connection.end();

        // 3. Response returned
        res.json({
            sql,
            results: rows,
            message: "Query executed successfully"
        });
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({
            error: 'Database error or Invalid SQL',
            details: error.message,
            generatedSql: generateSQL(prompt)
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
