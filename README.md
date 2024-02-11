# Pharmacy Database Project

## Overview
This project implements a pharmacy database management system using Node.js for the backend and Oracle Database for data storage. 
The system allows pharmacies to manage their inventory, orders, customers, and prescriptions efficiently.

## Features
- Inventory Management: Track and manage pharmacy inventory, including medicines, quantities, and expiration dates.
- Order Management: Place and manage orders for restocking inventory from suppliers.
- Customer Management: Maintain customer records, including personal information and prescription history.
- Prescription Management: Manage prescriptions, including prescription details, dispensing, and refills.
- User Authentication and Authorization: Secure login system for pharmacists with role-based access control

## Requirements
- Node.js
- Oracle Database
- Oracle Instant Client (for connecting Node.js to Oracle Database)
- Express.js (Node.js web application framework)
- Oracle Database driver for Node.js (e.g., oracledb)

## Installation
- Clone or download the project repository from GitHub link.
- Install Node.js if not already installed on your system.
- Install Oracle Instant Client and set up the necessary environment variables as per Oracle documentation.
- Install project dependencies using npm:
```
npm install
```
- Set up the Oracle Database schema using the provided SQL scripts (schema.sql, seed.sql, etc.).

## Configuration
- Configure the Oracle Database connection settings in the config.js file.
- Modify other configuration settings such as server port, session secret, etc., in the config.js file as needed.

## Usage
- Start the Node.js server:
```
node server.js
```
- Access the pharmacy management system through the provided web interface.
- Login with valid credentials to access different features based on user roles.
- Perform CRUD operations on pharmacy data, manage inventory, place orders, etc.

