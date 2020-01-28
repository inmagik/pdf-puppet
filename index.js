const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
var bodyParser = require('body-parser')

var app = express();

app.use(bodyParser.json())

var output_folder = __dirname + '/outputs'
if (!fs.existsSync(output_folder)) {
  fs.mkdirSync(output_folder);
}

async function getPage(url, options = {}) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    userDataDir: './.pdfcache',
    defaultViewport: null,
    // dumpio: true
  })
  const page = await browser.newPage()

  if (options.viewport) {
    await page.setViewport({
      width: options.viewport.width,
      height: options.viewport.height,
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

  const title = await page.title()
  return { page: page, browser: browser, title: title }
}

async function urlToPdf(req, res) {

  const {
    url,
    width,
    height,
    printBackground = true,
    fileName,
    format = 'A4',
    landscape,
    displayHeaderFooter,
    ...options
  } = req.body

  if (!url) {
    res.statusCode = 400;
    res.send("No url specified!")
    return
  }

  let result;
  try {
    result = await getPage(url, {
      ...options,
      headers: req.headers && req.headers['authorization']
        ?
        { authorization: req.headers['authorization'] }
        :
        undefined
    })
  } catch (err) {
    console.error(err)
    res.statusCode = 404;
    res.send(err)
    return
  }

  const { page, title, browser } = result

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



  const pdfFileName = fileName ? fileName : (title || 'No title').toLowerCase().replace(/ /g, '_') + '.pdf'

  const path = output_folder + '/' + pdfFileName
  await page.pdf({
    path,
    width: width,
    height: height,
    format: format,
    printBackground: !!printBackground,
    landscape: !!landscape,
    displayHeaderFooter: !!displayHeaderFooter,
  });

  await page.close();
  await browser.close();

  res.download(
    path,
    pdfFileName,
    () => {
      fs.unlinkSync(path);
    }
  )
}

async function urlToScreenshot(req, res) {

  const {
    url,
    fullPage = true,
    viewportWidth = 1440,
    viewportHeight = 900,
    ...options
  } = req.body

  if (!url) {
    res.statusCode = 400;
    res.send("No url specified!")
    return
  }

  let result;
  try {
    result = await getPage(url, {
      ...options,
      viewport: { width: viewportWidth, height: viewportHeight },
      headers: req.headers && req.headers['authorization']
        ?
        { authorization: req.headers['authorization'] }
        :
        undefined
    })
  } catch (err) {
    console.error(err)
    res.statusCode = 404;
    res.send(err)
    return
  }

  const { page, title, browser } = result

  // const pdfFileName = fileName ? fileName : title.toLowerCase().replace(/ /g, '_') + '.png'
  const pdfFileName = url.replace(/\//g, '-') + ".png"
  const path = output_folder + '/' + pdfFileName

  await page.screenshot({
    path,
    fullPage: !!fullPage,
  });

  await page.close();
  await browser.close();
  res.download(
    path,
    pdfFileName,
    () => { fs.unlinkSync(path); }
  )
}

app.post('/', urlToPdf);
app.post('/screenshot/', urlToScreenshot);


app.listen(3040, function () {
  console.log('pdf-puppet listening on port 3040!');
});
