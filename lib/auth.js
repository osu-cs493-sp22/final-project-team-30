const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const secretKey = 'SuperSecret123';

exports.generateAuthToken = function (userId, role) {
  const payload = { sub: userId, role: role};
  return jwt.sign(payload, secretKey, { expiresIn: '24h' });
};

exports.requireAuthentication = function (req, res, next) {
  if (req.user.id && req.user.role){
    next();
  }else {
    res.status(401).send({
      error: "Invalid authentication token"
    });
  }
};

exports.optionalAuthentication = function (req, _, next) {
  const authHeader = req.get('Authorization') || '';
  const authHeaderParts = authHeader.split(' ');
  const token = authHeaderParts[0] === 'Bearer' ?
    authHeaderParts[1] : null;

  try {
    const payload = jwt.verify(token, secretKey);
    req.user = { id: new ObjectId(payload.sub), role: payload.role };
    next();
  } catch (err) {
    req.user = {} // prevent id & role spoofing
    console.log("  -- No valid token detected");
    next();
  }
};

exports.requireAuthorizationURL = function(req, res, next, fieldName){
  console.log(req.user.id);
  console.log(req.params[fieldName]);
  if (req.user.id == req.params[fieldName] || req.user.role == 0){
    return 1;
  }
  else {
    return -1;
  }
}

exports.requireAuthorizationBody = function(req, res, next, fieldName){
  if (req.user.id === new ObjectId(req.body[fieldName]) || req.user.role === 0){
    next();
  }
  else {
    res.status(401).send({
      error: "User is not authorized to perform this action"
    });
  }
}