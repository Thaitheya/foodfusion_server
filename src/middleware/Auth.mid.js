const { verify } = require("jsonwebtoken");
const { UNAUTHORIZED } = require("../constants/httpStatus");

const authenticate = (req, res, next) => {
  const token = req.headers.access;
  if (!token) return res.status(UNAUTHORIZED).send();

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    return res.status(UNAUTHORIZED).send();
  }

  next();
};

module.exports = authenticate;
