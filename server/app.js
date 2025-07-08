const express = require('express');
const app = express();
const authRoute = require('./routes/authRoutes');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();
console.log(process.env.PORT)
//routes
const firebase = require('./routes/authRoutes');
connectDB();
app.use(cors({
  origin: 'http://localhost:3000', // 👈 your React app URL
  credentials: true
}));
// in app.js
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is up ✅' });
});

app.use(express.json());

app.use('/api/auth',authRoute);

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});