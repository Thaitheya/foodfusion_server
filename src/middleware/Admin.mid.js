
const {UNAUTHORIZED} = require('../constants/httpStatus')
const authMid = require('../middleware/Auth.mid')
const  adminMid = (req, res, next) =>{
  if(!req.user.isAdmin) res.status(UNAUTHORIZED).send();
  return next();
}

module.exports =  [authMid, adminMid]