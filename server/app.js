const express = require('express');
const app = express();
const port = 5000;
const authRouter = require('./routes/authRoutes');
const cors = require('cors');
app.use(cors);
app.use(express.json());

app.post('/api/auth',authRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});