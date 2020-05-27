"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrowser = void 0;
const puppeteer_1 = require("puppeteer");
const path_1 = __importDefault(require("path"));
let browser = null;
async function getBrowser() {
    if (browser === null) {
        browser = await puppeteer_1.launch({
            args: ['--no-sandbox'],
            userDataDir: process.env.PDF_CACHE || path_1.default.join(process.cwd(), '.pdfcache'),
            defaultViewport: null,
        });
    }
    return browser;
}
exports.getBrowser = getBrowser;
