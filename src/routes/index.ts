import express from "express";
import authRoutes from "./auth";
import questionsRoutes from "./questions";
import usersRoutes from "./users";

const router = express.Router();

// Mount authentication-related routes on '/auth' path
router.use("/auth", authRoutes);

// Mount question-related routes on '/questions' path
router.use("/questions", questionsRoutes);

// Mount user-related routes on '/users' path
router.use("/users", usersRoutes);

export default router;
