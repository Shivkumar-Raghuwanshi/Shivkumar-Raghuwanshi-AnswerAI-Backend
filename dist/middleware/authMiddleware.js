"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const accessToken = req.cookies.accessToken || req.headers.authorization;
    if (!accessToken) {
        return res.status(401).json({ error: 'Access token not provided' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(accessToken, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(403).json({ error: 'Invalid access token' });
    }
};
exports.default = authMiddleware;
