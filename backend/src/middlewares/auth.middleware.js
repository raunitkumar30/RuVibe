const jwt = require("jsonwebtoken");

function extractToken(req) {
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
}

async function authArtist(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized Access: Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "artist") {
      return res.status(403).json({ message: "You do not have access to this resource (Artist only)" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

async function authUser(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized Access: Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "user" && decoded.role !== "artist") {
      return res.status(403).json({ message: "You do not have access to this resource" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = { authArtist, authUser };