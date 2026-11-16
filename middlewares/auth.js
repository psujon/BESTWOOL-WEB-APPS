const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkeyforgarmentsdashboard12345';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || req.query.token;
  
  if (!token) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token is invalid or expired' });
    }
    req.user = user;

    // Unit context parsing:
    const rawUnit = req.headers['x-unit-id'] || req.query.unit_id;
    if (user.role === 'admin' || !user.unit_id) {
      // User has full access to all units, so they can switch unit or view all ('ALL')
      req.unitId = (rawUnit && rawUnit !== 'ALL' && rawUnit !== '') ? parseInt(rawUnit) : null;
    } else {
      // Restricted to assigned unit
      req.unitId = user.unit_id;
    }

    next();
  });
}

module.exports = authenticateToken;
