import { Request, Response } from "express";
import { Page, PDFFormat, LayoutDimension } from "puppeteer";
import { openPage } from "./page";

interface Config {
  url: string;
  fileName?: string;
  fullPage: boolean,
  viewportWidth: number,
  viewportHeight: number
}

export async function urlToPng(req: Request, res: Response) {
  let page: Page = null
  try {
    const {
      url,
      fileName,
      fullPage = true,
      viewportWidth = 1440,
      viewportHeight = 900,
      ...options
    } = <Config>req.body

    if (!url) {
      res.statusCode = 400;
      res.send("No url specified")
      return
    }

    page = await openPage(url, {
      ...options,
      viewport: { width: viewportWidth, height: viewportHeight },
      headers: req.headers && req.headers['authorization']
        ?
        { authorization: req.headers['authorization'] }
        :
        undefined
    })


    let pngFileName = fileName
    if (!pngFileName) {
      const title = await page.title()
      pngFileName = (title || 'No title').toLowerCase().replace(/ /g, '_') + '.pdf'
    }

    const image = await page.screenshot({
      fullPage
    })

    res.setHeader('Content-Length', image.length)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=${pngFileName}`)
    res.send(image)

  } catch(err) {
    console.error(err)
    res.statusCode = 404;
    res.send(err)
  } finally {
    if (page) {
      await page.close()
    }
  }
}