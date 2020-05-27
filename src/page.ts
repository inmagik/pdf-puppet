import { getBrowser } from "./browser";

export interface PageOptions {
  viewport?: {
    width: number,
    height: number
  };
  headers?: { [key: string]: string },
  localStorage?: { [key: string]: string },
  timeout?: number
}

export async function openPage(url: string, options: PageOptions) {
  const browser = await getBrowser()
  const page = await browser.newPage()
  try {
    if (options.viewport) {
      await page.setViewport({
        width: options.viewport.width,
        height: options.viewport.height
      })
    }
  
    if (options.headers) {
      await page.setExtraHTTPHeaders(options.headers)
    }
  
    await page.goto(url, { waitUntil: 'networkidle0' })
  
    if (options.localStorage) {
      await page.evaluate(ls => {
        for (let k in ls) {
          localStorage.setItem(k, ls[k])
        }
      }, options.localStorage)
      await page.goto(url, { waitUntil: 'networkidle0' })
    }
  
    let timeout = options.timeout
    // When no tiemout or invalid use default 1 second
    if (timeout === null || timeout === undefined || Number(timeout) !== timeout) {
      timeout = 1000
    }
    if (timeout > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  
    return page
  } catch (e) {
    page.close()
    throw e
  }
}