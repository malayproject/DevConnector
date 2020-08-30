const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
  //get token from header
  const token = req.header('x-auth-token');

  //check if no token
  if (!token) {
    return res.status(401).json({ msg: 'no token, authorization denied' });
  }

  //verify token
  try {
    let decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'invalid token' });
  }
};
