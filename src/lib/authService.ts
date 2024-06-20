// Import necessary modules
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import prisma from './prisma';

// Define JWT secret and expiration times
const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_ACCESS_TOKEN_EXPIRES_IN = '15m';
const JWT_REFRESH_TOKEN_EXPIRES_IN = '7d';

// Function to generate a token (access or refresh) and store it in the database if it's a refresh token
const generateToken = async (userId: number, expiresIn: string, isRefreshToken: boolean) => {
  const payload = { userId };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn });

  if (isRefreshToken) {
    // Store the refresh token in the database
    await prisma.refreshToken.create({
      data: {
        userId,
        token,
      },
    });
  } else {
    // Store the access token in the database
    await prisma.accessToken.create({
      data: {
        userId,
        token,
      },
    });
  }

  return token;
};

// Function to register a new user with hashed password and store in the database
export const registerUser = async (username: string, email: string, password: string) => {
  const hashedPassword = await argon2.hash(password);
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });
  return user;
};

// Function to log in a user, validate credentials, and generate tokens
export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await argon2.verify(user.password, password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Generate access and refresh tokens for the user
  const accessToken = await generateToken(user.id, JWT_ACCESS_TOKEN_EXPIRES_IN, false);
  const refreshToken = await generateToken(user.id, JWT_REFRESH_TOKEN_EXPIRES_IN, true);

  return { accessToken, refreshToken };
};


// Function to log out a user by deleting their access and refresh tokens from the database
export const logoutUser = async (refreshToken: string) => {
  try {
    // Fetch the user ID associated with the refresh token
    const tokenData = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!tokenData) {
      throw new Error('Invalid refresh token');
    }
    const userId = tokenData.userId;

    // Delete the refresh token from the database
    await prisma.refreshToken.deleteMany({
      where: {
        token: refreshToken,
      },
    });

    // Delete all access tokens associated with the user ID
    await prisma.accessToken.deleteMany({
      where: {
        userId,
      },
    });
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Function to refresh an access token and generate a new refresh token
export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const tokenData = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!tokenData) {
      throw new Error('Invalid refresh token');
    }

    // Generate a new access token and refresh token using the userId from the refresh token data
    const { userId } = tokenData;
    const accessToken = await generateToken(userId, JWT_ACCESS_TOKEN_EXPIRES_IN, false);
    const newRefreshToken = await generateToken(userId, JWT_REFRESH_TOKEN_EXPIRES_IN, true);

    // Delete the old refresh token from the database
    await prisma.refreshToken.deleteMany({
      where: {
        token: refreshToken,
      },
    });

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Function to verify an access token and retrieve associated user data
export const verifyToken = async (token: string) => {
  try {
    // Decode the JWT and extract userId
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    // Fetch user data from the database using userId
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user;
  } catch (error) {
    throw new Error('Invalid access token');
  }
};