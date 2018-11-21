const express = require('express');
const puppeteer = require('puppeteer');

var app = express();

const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };


 const urlToPdf = async (req, res) => {
  const url = req.query.url
  if(!url){
    res.statusCode = 400;
    res.send("No url specified!")
    return
  }

  const { width, height, printBackground=true, fileName } = req.query

  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    userDataDir: './.pdfcache',
    // dumpio: true
  })
  const page = await browser.newPage()
  try {
    await page.goto(url, {waitUntil: 'networkidle2'})
  } catch(err) {
    res.statusCode = 400;
    res.send(err)
    return
  }

  const status = page.headers.status
  console.log("page status", status)

  const title = await page.title()
  const pdfFileName = fileName ? fileName : title.toLowerCase().replace(/ /g, '_') + '.pdf'
  await page.pdf({
    path: pdfFileName,
    width,
    height,
    printBackground: !!printBackground
  });

  await page.close();
  await browser.close();
  res.download(__dirname + '/' + pdfFileName, pdfFileName);
}

app.get('/', asyncMiddleware(urlToPdf));

app.listen(3000, function () {
  console.log('pdf-puppet listening on port 3000!');
});
