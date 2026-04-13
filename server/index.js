const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

app.use(express.json());
// Force allow all origins to prevent Render from blocking Vercel
app.use(cors({
  origin: '*'
}));

// Basic Rate Limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Import Routes
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/tests');
const submissionRoutes = require('./routes/submissions');
const aiRoutes = require('./routes/ai');
const leaderboardRoutes = require('./routes/leaderboard');
const doubtRoutes = require('./routes/doubts');
const rewardRoutes = require('./routes/rewards');
const streakRoutes = require('./routes/streak');

// Import Cron Jobs
const startStreakResetJob = require('./jobs/streakReset');
const startLeaderboardUpdateJob = require('./jobs/leaderboardUpdate');
const startDailyContentJob = require('./jobs/dailyContent');

// Start Cron Jobs
startStreakResetJob();
startLeaderboardUpdateJob(io);
startDailyContentJob();

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/streak', streakRoutes);

// Placeholder routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.io for Real-time features
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Avoid connecting to Mongo right away if env isn't ready
if (process.env.MONGO_URI && process.env.MONGO_URI !== 'mongodb://localhost:27017/vidyajaya') {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.log('MongoDB URI uses default local address. Update .env for production.');
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
