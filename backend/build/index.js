"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var server_1 = __importDefault(require("./server"));
console.log('Started application');
console.log("Cache all: ", process.env.CACHE_ALL);
server_1.default();
