console.log('Starting application...');

import express from 'express';

import apiRoutes from './routes';

import cookieParser from 'cookie-parser';
const app = express();


// Use the cookie-parser middleware
app.use(cookieParser());

// Middleware for parsing request body
app.use(express.json());

// Mount API routes
app.use('/api', apiRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});