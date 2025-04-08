// backend/server.js
const express = require('express');
const connectDB = require('./config/db'); // Correct import
const cors = require('cors');
require('dotenv').config();

const app = express();

// Connect to Database
connectDB(); // Call the imported function

// Init Middleware
app.use(express.json());
app.use(cors());

// Define Routes
app.use('/api', require('./routes/api'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));