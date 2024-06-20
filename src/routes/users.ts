import express from 'express';
import { registerUser } from '../lib/authService';
import prisma from '../lib/prisma';
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

// Users routes

// POST route to register a new user
router.post('/', async (req, res) => {
  // Extract username, email, and password from request body
  const { username, email, password } = req.body;
  try {
    // Register user with provided credentials using authService
    await registerUser(username, email, password);
    // Send a success response if registration is successful
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    // Send an error response if registration fails
    res.status(500).json({ error: 'Registration failed' });
  }
});

// GET route to retrieve a specific user by their ID
router.get('/:userId', authMiddleware, async (req, res) => {
  // Extract userId from request parameters
  const { userId } = req.params;
  try {
    // Find the user in the database with selected fields using Prisma ORM
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { username: true, email: true },
    });
    // If user is not found, send a 404 error response
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Send a success response with the user's data
    res.status(200).json(user);
  } catch (error) {
    // Log and send an error response if there's an error during retrieval
    console.error(error);
    res.status(500).json({ error: 'Error retrieving user' });
  }
});

// GET route to retrieve all questions posted by a specific user
router.get('/:userId/questions', authMiddleware, async (req, res) => {
  // Extract userId from request parameters and parse it to an integer
  const { userId } = req.params;
  const parsedUserId = parseInt(userId);
  
  // Validate the parsed userId is a number
  if (isNaN(parsedUserId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  try {
    // Find the user and include their questions using Prisma ORM
    const user = await prisma.user.findUnique({
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
  } catch (error) {
    // Log and send an error response if there's an error during retrieval of questions
    console.error(error);
    res.status(500).json({ error: 'Error retrieving questions' });
  }
});

export default router;
