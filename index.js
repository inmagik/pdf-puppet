const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');



var app = express();

var output_folder = __dirname + '/outputs'
if (!fs.existsSync(output_folder)){
    fs.mkdirSync(output_folder);
}

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
    const pageResp = await page.goto(url, {waitUntil: 'networkidle2'})
  } catch(err) {
    res.statusCode = 400;
    res.send(err)
    return
  }

  const title = await page.title()
  const pdfFileName = fileName ? fileName : title.toLowerCase().replace(/ /g, '_') + '.pdf'
  const path = output_folder + '/' + pdfFileName
  await page.pdf({
    path,
    width,
    height,
    printBackground: !!printBackground
  });

  await page.close();
  await browser.close();
  res.download(path, pdfFileName);
}

app.get('/', asyncMiddleware(urlToPdf));

app.listen(3000, function () {
  console.log('pdf-puppet listening on port 3000!');
});
