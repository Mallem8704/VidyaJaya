require('dotenv').config();

// ── Critical environment variable check ────────────────────────────────────────
// If any of these are missing the server will fail silently. Log loudly and early.
const REQUIRED_ENV_VARS = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];
const missingVars = REQUIRED_ENV_VARS.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error('═══════════════════════════════════════════════════════');
  console.error('[FATAL] Missing required environment variables:');
  missingVars.forEach(v => console.error(`  ✗ ${v} is NOT SET`));
  console.error('Login and all authenticated routes will FAIL.');
  console.error('Add these variables in your Render dashboard → Environment.');
  console.error('═══════════════════════════════════════════════════════');
} else {
  console.log('[ENV] All required environment variables are present ✓');
}
// ──────────────────────────────────────────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const logger = require('./utils/logger');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.set('trust proxy', 1); // Trust Render/Vercel proxies

// Global Request Logger for Debugging
app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  next();
});
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

app.use(express.json());
// Force allow all origins with specific headers to prevent CORB/CORS blocks
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
  credentials: true
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
const streakRoutes = require('./routes/streak');
const dashboardRoutes = require('./routes/dashboard');
const profileRoutes = require('./routes/profiles');
const practiceRoutes = require('./routes/practice');
const questionRoutes = require('./routes/questions');

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
app.use('/api/rewards', require('./routes/rewards'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/streak', streakRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/verification', require('./routes/verification'));
app.use('/api/referrals', require('./routes/referrals'));
app.use('/api/public', require('./routes/public'));
app.use('/api/influencer', require('./routes/influencer'));
console.log('[SERVER] Public route mounted ✓');
console.log('[SERVER] Referrals route mounted ✓');

// Placeholder routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
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
