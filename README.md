# AI-Powered Database Assistant (MCP Style)

This project demonstrates a simple AI-powered interface to interact with a MySQL database using natural language.

## Project Structure
- **server/**: Node.js + Express backend. Contains logic to convert prompts to SQL and execute them.
- **client/**: React + Vite frontend. Provides a premium chat-style UI for users.
- **db/**: SQL scripts to initialize the database and seed data.

## Prerequisites
- Node.js installed.
- MySQL Server installed and running.
- MySQL Credentials:
  - Host: `localhost`
  - User: `root`
  - Password: `root` (Update in `server/index.js` if different)

## Setup Instructions

### 1. Database Setup
Execute the SQL commands in `db/setup.sql` in your MySQL instance (Workbench, CLI, etc.) to create the `ai_mcp_demo` database and tables.

### 2. Backend Setup
```bash
cd server
npm install
node index.js
```
The server will run on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
The app will run on `http://localhost:5173`.

## Supported Operations
- **SELECT**: "Show all customers", "Show all customers from New York"
- **JOIN**: "Show all orders for Alice Smith"
- **WHERE**: "Show users above age 30"
- **INSERT**: "Add new customer"

## MCP Workflow Logic
1. **AI Interprets Prompt**: Input is processed via `generateSQL` function in `server/index.js`.
2. **Tool Execution**: The generated SQL is sent to the MySQL database.
3. **Response**: Results are formatted as a table and returned to the UI.
