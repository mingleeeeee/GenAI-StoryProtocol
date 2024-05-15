"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getConfig = () => {
    return {
        PORT: parseInt(process.env.PORT, 10),
        DATABASE_URL: process.env.DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        accessKeyId: process.env.accessKeyId,
        secretAccessKey: process.env.secretAccessKey,
        region: process.env.region
    };
};
const config = getConfig();
exports.default = config;
