const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Non authentifié.' });
  const token = auth.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'JWT_SECRET is missing.' });
    }
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide.' });
  }
}

module.exports = { authMiddleware };
