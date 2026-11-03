const jwt = require("jsonwebtoken");


async function authArtist(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized Access!!!" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(decoded.role !== "artist") {
            return res.status(403).json({ message: "You dont have access to this resource" });
        }

        req.user = decoded;
        next();
         
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ message: "Invalid Token!!!" });
    }
}


async function authUser(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized Access!!!" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(decoded.role !== "user" && decoded.role !== "artist") {
            return res.status(403).json({ message: "You dont have access to this resource" });
        }
        req.user = decoded;
        next();

    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ message: "Invalid Token!!!" });
    }
}

module.exports = {authArtist, authUser};