const rateLimit = require('express-rate-limit');

// Rate limiter for general abuse prevention
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, error: 'Too many requests, please try again later.' }
});

// In-memory usage limiter for "50 AI generations per authenticated user per day"
const usageMap = new Map();

const usageLimiter = (req, res, next) => {
  if (!req.user || !req.user.uid) return next();
  
  const uid = req.user.uid;
  const limit = parseInt(process.env.AI_DAILY_LIMIT, 10) || 50;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  let userData = usageMap.get(uid);
  if (!userData || userData.date !== today) {
    userData = { count: 0, date: today };
  }
  
  if (userData.count >= limit) {
    return res.status(429).json({ success: false, error: 'Daily AI generation limit reached. Please try again tomorrow.' });
  }
  
  // Increment count
  userData.count += 1;
  usageMap.set(uid, userData);
  
  next();
};

module.exports = { apiRateLimiter, usageLimiter };
