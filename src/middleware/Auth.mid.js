// const { verify } = require("jsonwebtoken");
// const { UNAUTHORIZED } = require("../constants/httpStatus");

// const mid = (req, res, next) => {
//   const token = req.headers.access_token;
//   if (!token) return res.status(UNAUTHORIZED).send();
//   try {
//     const decoded = verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//   } catch (error) {
//     req.status(UNAUTHORIZED).send();
//   }
//   return next();
// };

// module.exports = mid;
