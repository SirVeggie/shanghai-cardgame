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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = exports.getSeconds = exports.getJsonResponse = void 0;
const axios_1 = __importDefault(require("axios"));
const timeout = 30000;
const getJsonResponse = (path, errorMode = "") => __awaiter(void 0, void 0, void 0, function* () {
    console.log("API JSON request to: ", path);
    try {
        const response = yield axios_1.default.get(path, {
            timeout,
            headers: {
                'x-force-error-mode': errorMode
            }
        });
        return response.data;
    }
    catch (e) {
        console.log("Error fetching JSON from API: ", e.message);
        throw e;
    }
});
exports.getJsonResponse = getJsonResponse;
const getSeconds = () => {
    return new Date().getTime() / 1000;
};
exports.getSeconds = getSeconds;
const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.delay = delay;
