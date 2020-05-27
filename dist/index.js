"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const pdf_1 = require("./pdf");
const screenshot_1 = require("./screenshot");
const app = express_1.default();
app.use(body_parser_1.default.json());
app.post('/', pdf_1.urlToPdf);
app.post('/screenshot/', screenshot_1.urlToPng);
const port = process.env.PORT || 3040;
app.listen(port, () => {
    console.log(`pdf-puppet listening on port ${port}`);
});
