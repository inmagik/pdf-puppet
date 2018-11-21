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

  const { width, height, printBackground=true, fileName } =

  const browser = await puppeteer.launch({
    userDataDir: './.pdfcache',
    dumpio: true
  })
  const page = await browser.newPage()

  await page.goto(url, {waitUntil: 'networkidle2'})
  const title = await page.title()
  const pdfFileName = fileName ? fileName : title.toLowerCase().replace(/ /g, '_') + '.pdf'
  await page.pdf({
    path: pdfFileName,
    width,
    height,
    printBackground: !!printBackground
  });
  await browser.close();
  res.download(__dirname + '/' + pdfFileName, pdfFileName);
}

app.get('/', asyncMiddleware(urlToPdf));

app.listen(3000, function () {
  console.log('pdf-puppet listening on port 3000!');
});
