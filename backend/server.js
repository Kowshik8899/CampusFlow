const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Route files
const auth = require('./routes/auth');
const requests = require('./routes/requests');
const admin = require('./routes/admin');
const notifications = require('./routes/notifications');
const data = require('./routes/data'); // for categories, departments

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors({ origin: true, credentials: true }));

// Mount routers
app.use('/api/auth', auth);
app.use('/api/requests', requests);
app.use('/api/admin', admin);
app.use('/api/notifications', notifications);
app.use('/api/data', data);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
