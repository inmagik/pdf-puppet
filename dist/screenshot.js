"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlToPng = void 0;
const page_1 = require("./page");
async function urlToPng(req, res) {
    let page = null;
    try {
        const { url, fileName, fullPage = true, viewportWidth = 1440, viewportHeight = 900, ...options } = req.body;
        if (!url) {
            res.statusCode = 400;
            res.send("No url specified");
            return;
        }
        page = await page_1.openPage(url, {
            ...options,
            viewport: { width: viewportWidth, height: viewportHeight },
            headers: req.headers && req.headers['authorization']
                ?
                    { authorization: req.headers['authorization'] }
                :
                    undefined
        });
        let pngFileName = fileName;
        if (!pngFileName) {
            const title = await page.title();
            pngFileName = (title || 'No title').toLowerCase().replace(/ /g, '_') + '.pdf';
        }
        const image = await page.screenshot({
            fullPage
        });
        res.setHeader('Content-Length', image.length);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${pngFileName}`);
        res.send(image);
    }
    catch (err) {
        console.error(err);
        res.statusCode = 404;
        res.send(err);
    }
    finally {
        if (page) {
            await page.close();
        }
    }
}
exports.urlToPng = urlToPng;
