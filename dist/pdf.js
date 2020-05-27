"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlToPdf = void 0;
const page_1 = require("./page");
async function urlToPdf(req, res) {
    let page = null;
    try {
        const { url, width, height, printBackground = true, fileName, format = 'A4', landscape, displayHeaderFooter, margin, ...options } = req.body;
        if (!url) {
            res.statusCode = 400;
            res.send("No url specified");
            return;
        }
        page = await page_1.openPage(url, {
            ...options,
            headers: req.headers && req.headers['authorization']
                ?
                    { authorization: req.headers['authorization'] }
                :
                    undefined
        });
        if (width && height) {
            await page.addStyleTag({
                content: `
          @page {
            size: ${width} ${height};
          }
        `
            });
        }
        else if (format) {
            await page.addStyleTag({
                content: `
          @page {
            size: ${format};
          }
        `
            });
        }
        let pdfFileName = fileName;
        if (!pdfFileName) {
            const title = await page.title();
            pdfFileName = (title || 'No title').toLowerCase().replace(/ /g, '_') + '.pdf';
        }
        const myPdf = await page.pdf({
            width: width,
            height: height,
            format: format,
            printBackground: !!printBackground,
            landscape: !!landscape,
            displayHeaderFooter: !!displayHeaderFooter,
            margin
        });
        res.setHeader('Content-Length', myPdf.length);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${pdfFileName}`);
        res.send(myPdf);
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
exports.urlToPdf = urlToPdf;
