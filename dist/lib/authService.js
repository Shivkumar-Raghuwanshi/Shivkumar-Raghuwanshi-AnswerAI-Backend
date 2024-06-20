"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.refreshAccessToken = exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
// Import necessary modules
const argon2_1 = __importDefault(require("argon2"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("./prisma"));
// Define JWT secret and expiration times
const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_ACCESS_TOKEN_EXPIRES_IN = '15m';
const JWT_REFRESH_TOKEN_EXPIRES_IN = '7d';
// Function to generate a token (access or refresh) and store it in the database if it's a refresh token
const generateToken = (userId, expiresIn, isRefreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = { userId };
    const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn });
    if (isRefreshToken) {
        // Store the refresh token in the database
        yield prisma_1.default.refreshToken.create({
            data: {
                userId,
                token,
            },
        });
    }
    else {
        // Store the access token in the database
        yield prisma_1.default.accessToken.create({
            data: {
                userId,
                token,
            },
        });
    }
    return token;
});
// Function to register a new user with hashed password and store in the database
const registerUser = (username, email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield argon2_1.default.hash(password);
    const user = yield prisma_1.default.user.create({
        data: {
            username,
            email,
            password: hashedPassword,
        },
    });
    return user;
});
exports.registerUser = registerUser;
// Function to log in a user, validate credentials, and generate tokens
const loginUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('Invalid credentials');
    }
    const isPasswordValid = yield argon2_1.default.verify(user.password, password);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }
    // Generate access and refresh tokens for the user
    const accessToken = yield generateToken(user.id, JWT_ACCESS_TOKEN_EXPIRES_IN, false);
    const refreshToken = yield generateToken(user.id, JWT_REFRESH_TOKEN_EXPIRES_IN, true);
    return { accessToken, refreshToken };
});
exports.loginUser = loginUser;
// Function to log out a user by deleting their access and refresh tokens from the database
const logoutUser = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch the user ID associated with the refresh token
        const tokenData = yield prisma_1.default.refreshToken.findUnique({ where: { token: refreshToken } });
        if (!tokenData) {
            throw new Error('Invalid refresh token');
        }
        const userId = tokenData.userId;
        // Delete the refresh token from the database
        yield prisma_1.default.refreshToken.deleteMany({
            where: {
                token: refreshToken,
            },
        });
        // Delete all access tokens associated with the user ID
        yield prisma_1.default.accessToken.deleteMany({
            where: {
                userId,
            },
        });
    }
    catch (error) {
        throw new Error('Invalid refresh token');
    }
});
exports.logoutUser = logoutUser;
// Function to refresh an access token and generate a new refresh token
const refreshAccessToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokenData = yield prisma_1.default.refreshToken.findUnique({ where: { token: refreshToken } });
        if (!tokenData) {
            throw new Error('Invalid refresh token');
        }
        // Generate a new access token and refresh token using the userId from the refresh token data
        const { userId } = tokenData;
        const accessToken = yield generateToken(userId, JWT_ACCESS_TOKEN_EXPIRES_IN, false);
        const newRefreshToken = yield generateToken(userId, JWT_REFRESH_TOKEN_EXPIRES_IN, true);
        // Delete the old refresh token from the database
        yield prisma_1.default.refreshToken.deleteMany({
            where: {
                token: refreshToken,
            },
        });
        return { accessToken, refreshToken: newRefreshToken };
    }
    catch (error) {
        throw new Error('Invalid refresh token');
    }
});
exports.refreshAccessToken = refreshAccessToken;
// Function to verify an access token and retrieve associated user data
const verifyToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Decode the JWT and extract userId
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const userId = decoded.userId;
        // Fetch user data from the database using userId
        const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        return user;
    }
    catch (error) {
        throw new Error('Invalid access token');
    }
});
exports.verifyToken = verifyToken;
