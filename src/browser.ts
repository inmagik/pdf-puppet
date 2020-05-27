import { Browser, launch } from "puppeteer";
import path from 'path';

let browser: Browser = null;

export async function getBrowser() {
  if (browser === null) {
    browser = await launch({
      args: ['--no-sandbox'],
      userDataDir: process.env.PDF_CACHE || path.join(process.cwd(), '.pdfcache'),
      defaultViewport: null,
    })
  }
  return browser
}