import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'beancraft_super_secret_jwt_key_2026';

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// Middleware to ensure user is admin
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin rights required.' });
  }
  next();
};

export default {
  verifyToken,
  isAdmin,
};
