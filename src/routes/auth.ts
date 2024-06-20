import express from 'express';
import { loginUser, logoutUser, refreshAccessToken } from '../lib/authService';
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

// POST route to handle user login
router.post('/login', async (req, res) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;
  
    // Authenticate user and retrieve access and refresh tokens
    const { accessToken, refreshToken } = await loginUser(email, password);

    // Set cookies for access and refresh tokens with appropriate security settings
    // Access token cookie configuration
    res.cookie('accessToken', accessToken, {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === 'production', // Cookie is only sent over HTTPS
      sameSite: 'strict', // Cookie is not sent with cross-site requests
      maxAge: 60 * 15, // Access token expires in 15 minutes
      path: '/', // Cookie is sent for all routes
    });

    // Refresh token cookie configuration
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // Refresh token expires in 7 days
      path: '/',
    });

    // Send success response with tokens
    res.status(201).json({ message: 'Login successful', accessToken, refreshToken });
  } catch (error: any) {
    // Send error response if authentication fails
    res.status(401).json({ error: error.message });
  }
});

// POST route to handle user logout
router.post('/logout', authMiddleware, async (req, res) => {
  // Retrieve refresh token from cookies
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    // Send error response if no refresh token is provided
    return res.status(401).json({ error: 'No refresh token provided' });
  }

  try {
    // Invalidate the provided refresh token and revoke associated access tokens
    await logoutUser(refreshToken);
    
    // Clear access and refresh token cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    // Send success response on successful logout
    res.status(201).json({ message: 'Logout successful' });
  } catch (error) {
    // Send error response if invalid refresh token is provided
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// POST route to handle access and refresh token refresh
router.post('/refresh', authMiddleware, async (req, res) => {
  // Retrieve refresh token from cookies
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    // Send error response if no refresh token is provided
    return res.status(401).json({ error: 'No refresh token provided' });
  }

  try {
    // Refresh access and refresh tokens using the provided refresh token
    const { accessToken, refreshToken: newRefreshToken } = await refreshAccessToken(refreshToken);

    // Update access token cookie with new token
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 15, // Access token expires in 15 minutes
      path: '/',
    });

    // Update refresh token cookie with new token
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // Refresh token expires in 7 days
      path: '/',
    });

    // Send success response with the new access token and refresh token
    res.status(201).json({ message: 'Tokens refreshed successfully', accessToken, refreshToken: newRefreshToken });
  } catch (error: any) {
    // Send error response if there's an issue refreshing the tokens
    res.status(401).json({ error: error.message });
  }
});

export default router;