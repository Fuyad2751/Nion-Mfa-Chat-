const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // টোকেন থেকে id নিঃসরণ
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // রিকোয়েস্টে ইউজার যোগ করে দেওয়া
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'অনুমোদন নেই, টোকেন ব্যর্থ' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'অনুমোদন নেই, টোকেন নেই' });
  }
};

module.exports = { protect };