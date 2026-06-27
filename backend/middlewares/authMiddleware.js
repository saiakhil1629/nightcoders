import jwt from 'jsonwebtoken';
import supabase from '../config/supabaseClient.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_code2career_key_12345');

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.id)
        .single();
        
      if (error || !user) {
        return res.status(401).json({ success: false, message: 'User not found in system' });
      }

      // omit password hash if any
      const { password_hash, ...userWithoutPassword } = user;
      req.user = userWithoutPassword;

      if (req.user.role === 'Student' && req.user.status !== 'Approved') {
        return res.status(403).json({ success: false, message: `Access denied. Account is currently ${req.user.status}` });
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role ${req.user ? req.user.role : 'Guest'} is not authorized to access this route` 
      });
    }
    next();
  };
};
