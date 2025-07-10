require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const path = require('path')
const authRoute = require('./routes/authRoutes');
const scriptRoute = require('./routes/scriptRoute');
const widgetRoute = require('./routes/widgetRoute');
const app = express();

// Connect DB
connectDB();

// middleware
app.use(cors({
  origin: ['http://localhost:3000','http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// routes calling
app.use('/api/auth', authRoute);
app.use('/api/script', scriptRoute);
app.use('/api/widget', widgetRoute);
//  Test if server is up
app.get('/api/test', (req, res) => {
  console.log(" Test route hit");
  res.json({ message: "Server is live" });
});



app.listen(process.env.PORT || 5000, () => {
  console.log(` Server running on port ${process.env.PORT || 5000}`);
});
