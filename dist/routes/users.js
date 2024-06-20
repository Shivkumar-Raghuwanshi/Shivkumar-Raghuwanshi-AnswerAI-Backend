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
const express_1 = __importDefault(require("express"));
const authService_1 = require("../lib/authService");
const prisma_1 = __importDefault(require("../lib/prisma"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = express_1.default.Router();
// Users routes
// POST route to register a new user
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract username, email, and password from request body
    const { username, email, password } = req.body;
    try {
        // Register user with provided credentials using authService
        yield (0, authService_1.registerUser)(username, email, password);
        // Send a success response if registration is successful
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (error) {
        // Send an error response if registration fails
        res.status(500).json({ error: 'Registration failed' });
    }
}));
// GET route to retrieve a specific user by their ID
router.get('/:userId', authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract userId from request parameters
    const { userId } = req.params;
    try {
        // Find the user in the database with selected fields using Prisma ORM
        const user = yield prisma_1.default.user.findUnique({
            where: { id: parseInt(userId) },
            select: { username: true, email: true },
        });
        // If user is not found, send a 404 error response
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Send a success response with the user's data
        res.status(200).json(user);
    }
    catch (error) {
        // Log and send an error response if there's an error during retrieval
        console.error(error);
        res.status(500).json({ error: 'Error retrieving user' });
    }
}));
// GET route to retrieve all questions posted by a specific user
router.get('/:userId/questions', authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract userId from request parameters and parse it to an integer
    const { userId } = req.params;
    const parsedUserId = parseInt(userId);
    // Validate the parsed userId is a number
    if (isNaN(parsedUserId)) {
        return res.status(400).json({ error: 'Invalid userId' });
    }
    try {
        // Find the user and include their questions using Prisma ORM
        const user = yield prisma_1.default.user.findUnique({
            where: { id: parsedUserId },
            include: { questions: true },
        });
        // If user is not found, send a 404 error response
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // If no questions are found for the user, send a message stating so
        if (user.questions.length === 0) {
            return res.status(404).json({ message: 'No questions found for this user' });
        }
        // Send a success response with the list of questions posted by the user
        res.status(200).json(user.questions);
    }
    catch (error) {
        // Log and send an error response if there's an error during retrieval of questions
        console.error(error);
        res.status(500).json({ error: 'Error retrieving questions' });
    }
}));
exports.default = router;
