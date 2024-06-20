import express from 'express';
import prisma from '../lib/prisma';
import { generateAnswer } from '../lib/anthropic';
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

// Questions routes

// POST route to submit a new question
router.post('/', authMiddleware, async (req, res) => {
  // Extract question and userId from request body
  const { question, userId } = req.body;
  try {
    // Find the user in the database using Prisma ORM
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    // If user is not found, send a 404 error response
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate an answer for the question using a helper function
    const answer = await generateAnswer(question);
    
    // Create a new question entry in the database with the generated answer
    const newQuestion = await prisma.question.create({
      data: {
        question,
        answer: answer || null, // If no answer is generated, store null
        user: { connect: { id: userId } }, // Associate the question with the user
      },
    });

    // Send a 201 response with the created question object
    res.status(201).json(newQuestion);
  } catch (error) {
    // Log and send a 500 error response if there's an error during the process
    console.error(error);
    res.status(500).json({ error: 'Error generating answer' });
  }
});

// GET route to retrieve a specific question by its ID
router.get('/:questionId', authMiddleware, async (req, res) => {
  // Extract questionId from request parameters
  const { questionId } = req.params;
  try {
    // Find the specific question in the database using Prisma ORM
    const question = await prisma.question.findUnique({
      where: { id: parseInt(questionId) }, // Parse questionId to integer
    });

    // If question is not found, send a 404 error response
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Send a 200 response with the found question object
    res.status(200).json(question);
  } catch (error) {
    // Log and send a 500 error response if there's an error during retrieval
    console.error(error);
    res.status(500).json({ error: 'Error retrieving question' });
  }
});

export default router;
