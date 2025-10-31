require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const path = require('path')
const app = express();
const webData = require('./models/WebData.js');
const {widgetGen} = require('./widgets/integrated.js');
//routes
const authRoute = require('./routes/authRoutes');
const scriptRoute = require('./routes/scriptRoute');
const widgetRoute = require('./routes/widgetRoute');
const feedRoute = require('./routes/feedback');
const llmRoute = require('./routes/LLMRoutes'); 
const mailRoute = require('./routes/mailRoutes');
const  teamRoute = require('./routes/teamRoutes'); 
const { findOne } = require('./models/WebData.js');

// Connect DB
connectDB();

app.use(async (req, res, next) => {
  const origin = req.headers.origin;
  try {
    // Skip CORS for non-browser calls (e.g. Postman, CLI)
    if (!origin) return next();
    console.log("CORS Origin:", origin);
    if (origin === process.env.FRONTEND) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.header("Access-Control-Allow-Credentials", "true");
    
      return next();
    }
    // Check if the origin exists in your WebData DB
    const site = await webData.findOne({ webUrl: origin });
    
    if (site) {
      // Allow only the verified origin
      res.header("Access-Control-Allow-Origin", origin);
    } else {
      // Optionally log unauthorized origins
      console.log(" Blocked CORS request from:", origin);
    }

    // Common headers
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");

    // If it's a preflight OPTIONS request, end early
    if (req.method === "OPTIONS") return res.sendStatus(200);

    next();
  } catch (err) {
    console.error("Dynamic CORS error:", err);
    next();
  }
});
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// routes calling
app.use('/api/auth', authRoute);
app.use('/api/script', scriptRoute);
app.use('/api/widget', widgetRoute);
app.use('/api/feedback', feedRoute);

//mail route
app.use('/api/mail',mailRoute);
app.use('/check', ()=>{
  console.log("Check route hit");
});

//team routes
app.use('/api/team', teamRoute);

app.use('/api/llm', llmRoute);

//widget script hosting
// ✅ CORRECTED CODE
app.get('/widget/script', async (req, res) => {
  try {
    const url = req.query.webUrl;
    
    if (!url) {
      return res.status(400).send('// Error: webUrl parameter required');
    }

    // Fetch config from database
    let config = await webData.findOne({ webUrl: url });
    
    if (!config) {
      // Send default config if not found
      config = {
        color: "#667eea",
        bgColor: "#ffffff",
        position: "bottom right",
        widgetText: "Feedback"
      };
    }

    // Generate dynamic widget script
    const dynamicWidget = widgetGen(config);
    
    // ⚡ CRITICAL: Set proper headers for JavaScript
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache'); // Prevent caching during development
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow cross-origin
    
    // Send the script
    res.send(dynamicWidget);
    
  } catch (error) {
    console.error("Error fetching web data:", error);
    
    // Send fallback script on error
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.status(500).send('// Error loading widget configuration');
  }
});
//  Test if server is up
app.get('/api/test', (req, res) => {
  // console.log(" Test route hit");
  res.json({ message: "Server is live" });
});


// Listening to the server
app.listen(process.env.PORT || 5000, () => {
  console.log(` Server running on port ${process.env.PORT || 5000}`);
});
