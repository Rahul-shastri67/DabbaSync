const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/db');
const { initCronJobs } = require('./utils/cron');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET','POST'] }
});

// Socket rooms
io.on('connection', (socket) => {
  socket.on('join', (roomId) => socket.join(roomId));
  socket.on('disconnect', () => {});
});
app.set('io', io);

connectDB();

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });

app.use(helmet());
app.use(compression());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use('/api', limiter);

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/customer',      require('./routes/customer'));
app.use('/api/vendor',        require('./routes/vendor'));
app.use('/api/orders',        require('./routes/order'));
app.use('/api/subscriptions', require('./routes/subscription'));
app.use('/api/payments',      require('./routes/payment'));
app.use('/api/meal-plans',    require('./routes/mealPlan'));
app.use('/api/admin',         require('./routes/admin'));

app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
});

initCronJobs();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 DabbaSync server on port ${PORT}`));
