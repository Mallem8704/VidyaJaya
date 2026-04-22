const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const logger = require('./utils/logger');
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

// Route HTTP logs through Winston
app.use(morgan('combined', { stream: logger.stream }));

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
const dashboardRoutes = require('./routes/dashboard');

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
app.use('/api/dashboard', dashboardRoutes);

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

// Removed MongoDB connection as we have migrated to Supabase.

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Server running heavily on port ${PORT}`);
});
