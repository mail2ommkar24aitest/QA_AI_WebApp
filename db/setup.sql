USE ai_mcp_demo;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS RegistrationDetails;
DROP TABLE IF EXISTS UserNames;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Customers;

-- Table: Customers
CREATE TABLE IF NOT EXISTS Customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    city VARCHAR(100),
    age INT
);

-- Table: Orders
CREATE TABLE IF NOT EXISTS Orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    product_name VARCHAR(255),
    amount DECIMAL(10, 2),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(id)
);

-- Table: RegistrationDetails
CREATE TABLE IF NOT EXISTS RegistrationDetails (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    registration_date DATE,
    status ENUM('Pending', 'Active', 'Inactive') DEFAULT 'Pending'
);

-- Table: UserNames
CREATE TABLE IF NOT EXISTS UserNames (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Seed Data
INSERT INTO Customers (name, email, city, age) VALUES 
('Alice Smith', 'alice@example.com', 'New York', 28),
('Bob Johnson', 'bob@example.com', 'Los Angeles', 35),
('Charlie Brown', 'charlie@example.com', 'New York', 42);

INSERT INTO Orders (customer_id, product_name, amount) VALUES 
(1, 'Laptop', 1200.00),
(1, 'Mouse', 25.00),
(2, 'Smartphone', 800.00);
