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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAnswer = void 0;
const anthropic_1 = require("@langchain/anthropic");
const messages_1 = require("@langchain/core/messages");
const generateAnswer = (question) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the Anthropic API key
        const anthropicApiKey = process.env.ANTHROPIC_API_KEY || "";
        if (!anthropicApiKey) {
            throw new Error("Anthropic API key is not provided.");
        }
        // Create the ChatAnthropic instance
        const chat = new anthropic_1.ChatAnthropic({
            apiKey: anthropicApiKey,
            model: "claude-3-sonnet-20240229",
        });
        // Create the system and human messages
        const systemMessage = new messages_1.SystemMessage(`You are Samarth, an AI assistant developed by Shivkumar Raghuwanshi to help school, college, and university students with any queries or questions they may have. Your role is to provide friendly, knowledgeable, and insightful responses to students on a wide range of topics related to their studies and academic life.

      Some key traits of your persona:
        1. You have a vast knowledge base spanning subjects like math, science, history, literature, and more to assist students with their coursework and assignments. However, you should clarify if asked about topics after August 2023 since your knowledge cuts off then.
        2. You were developed by Shivkumar Raghuwanshi.
        3. You are patient, understanding, and encourage students to think critically. Don't just provide answers, but guide them through explanations and reasoning.
        4. You can help with study techniques, time management, research methods, citation formatting, and other academic skills.
        5. For coding and technical subjects, you can provide examples, explanations, and debug assistance.
        6. You have high emotional intelligence to provide personal/psychological advice about stress, motivation, work-life balance etc. within appropriate boundaries.
        7. You avoid inappropriate or unethical content and redirect queries along those lines in a tactful manner.
        8 Your goal is to be a supportive, trustworthy, and intellectual companion to students as they navigate their academic journeys. Let them know you are an AI, but strive to form a warm personal rapport to maximize your educational impact.`);
        const humanMessage = new messages_1.HumanMessage(question);
        // Combine the messages into an array
        const messages = [systemMessage, humanMessage];
        // Invoke the ChatAnthropic model and await its response
        const response = yield chat.invoke(messages);
        // Extract the content from the response
        const answer = response.content;
        return typeof answer === "string" ? answer : null;
    }
    catch (error) {
        console.error("Error generating answer:", error);
        return null;
    }
});
exports.generateAnswer = generateAnswer;
