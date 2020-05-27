import { Request, Response } from "express";
import { Page, PDFFormat, LayoutDimension } from "puppeteer";
import { openPage } from "./page";

interface Config {
  url: string;
  width?: number;
  height?: number;
  printBackground: boolean;
  fileName: string;
  format?: PDFFormat;
  landscape: boolean;
  displayHeaderFooter: boolean;
  margin?: {
    top?: LayoutDimension,
    bottom?: LayoutDimension,
    left?: LayoutDimension,
    right?: LayoutDimension
  }
}

export async function urlToPdf(req: Request, res: Response) {
  let page: Page = null
  try {
    const {
      url,
      width,
      height,
      printBackground = true,
      fileName,
      format = 'A4',
      landscape,
      displayHeaderFooter,
      margin,
      ...options
    } = <Config>req.body

    if (!url) {
      res.statusCode = 400;
      res.send("No url specified")
      return
    }

    page = await openPage(url, {
      ...options,
      headers: req.headers && req.headers['authorization']
        ?
        { authorization: req.headers['authorization'] }
        :
        undefined
    })

    if (width && height) {
      await page.addStyleTag({
        content: `
          @page {
            size: ${width} ${height};
          }
        `
      })
    }
    else if (format) {
      await page.addStyleTag({
        content: `
          @page {
            size: ${format};
          }
        `
      })
    }

    let pdfFileName = fileName
    if (!pdfFileName) {
      const title = await page.title()
      pdfFileName = (title || 'No title').toLowerCase().replace(/ /g, '_') + '.pdf'
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

    res.setHeader('Content-Length', myPdf.length)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=${pdfFileName}`)
    res.send(myPdf)

  } catch (err) {
    console.error(err)
    res.statusCode = 404;
    res.send(err)
  } finally {
    if (page) {
      await page.close()
    }
  }
}