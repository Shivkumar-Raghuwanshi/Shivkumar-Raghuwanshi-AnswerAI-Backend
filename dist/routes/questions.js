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
const prisma_1 = __importDefault(require("../lib/prisma"));
const anthropic_1 = require("../lib/anthropic");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = express_1.default.Router();
// Questions routes
// POST route to submit a new question
router.post('/', authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract question and userId from request body
    const { question, userId } = req.body;
    try {
        // Find the user in the database using Prisma ORM
        const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        // If user is not found, send a 404 error response
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Generate an answer for the question using a helper function
        const answer = yield (0, anthropic_1.generateAnswer)(question);
        // Create a new question entry in the database with the generated answer
        const newQuestion = yield prisma_1.default.question.create({
            data: {
                question,
                answer: answer || null, // If no answer is generated, store null
                user: { connect: { id: userId } }, // Associate the question with the user
            },
        });
        // Send a 201 response with the created question object
        res.status(201).json(newQuestion);
    }
    catch (error) {
        // Log and send a 500 error response if there's an error during the process
        console.error(error);
        res.status(500).json({ error: 'Error generating answer' });
    }
}));
// GET route to retrieve a specific question by its ID
router.get('/:questionId', authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract questionId from request parameters
    const { questionId } = req.params;
    try {
        // Find the specific question in the database using Prisma ORM
        const question = yield prisma_1.default.question.findUnique({
            where: { id: parseInt(questionId) }, // Parse questionId to integer
        });
        // If question is not found, send a 404 error response
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        // Send a 200 response with the found question object
        res.status(200).json(question);
    }
    catch (error) {
        // Log and send a 500 error response if there's an error during retrieval
        console.error(error);
        res.status(500).json({ error: 'Error retrieving question' });
    }
}));
exports.default = router;
