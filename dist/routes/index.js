"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./auth"));
const questions_1 = __importDefault(require("./questions"));
const users_1 = __importDefault(require("./users"));
const router = express_1.default.Router();
// Mount authentication-related routes on '/auth' path
router.use("/auth", auth_1.default);
// Mount question-related routes on '/questions' path
router.use("/questions", questions_1.default);
// Mount user-related routes on '/users' path
router.use("/users", users_1.default);
exports.default = router;
