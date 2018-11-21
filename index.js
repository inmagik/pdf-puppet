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


async function getPage(url, viewport){
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    userDataDir: './.pdfcache',
    // dumpio: true
  })
  const page = await browser.newPage()
  if(viewport){
    await page.setViewport({
      width: viewport.width,
      height: viewport.height,
    })
  }
  await page.goto(url, { waitUntil: 'networkidle2'})
  const title = await page.title()
  return { page:page, browser:browser, title:title }
}

async function urlToPdf(req, res){
  const url = req.query.url
  if(!url){
    res.statusCode = 400;
    res.send("No url specified!")
    return
  }

  const {
    width, height,
    printBackground=true,
    fileName, format,
    landscape,
    displayHeaderFooter
  } = req.query

  var result;
  try {
    result = await getPage(url)
  } catch(err) {
    res.statusCode = 404;
    res.send(err)
    return
  }

  const { page, title, browser } = result

  const pdfFileName = fileName ? fileName : title.toLowerCase().replace(/ /g, '_') + '.pdf'
  const path = output_folder + '/' + pdfFileName
  await page.pdf({
    path,
    width,
    height,
    format,
    printBackground: !!printBackground,
    landscape: !!landscape,
    displayHeaderFooter: !!displayHeaderFooter,
  });

  await page.close();
  await browser.close();
  res.download(
    path,
    pdfFileName,
    () => { fs.unlinkSync(path); }
  )
}

async function urlToScreenshot(req, res){
  const url = req.query.url
  if(!url){
    res.statusCode = 400;
    res.send("No url specified!")
    return
  }
  const {
    fileName,
    fullPage=true,
    viewportWidth=1440,
    viewportHeight=900,
  } = req.query
  let result
  try {
    result = await getPage(url, { width: viewportWidth, height: viewportHeight})
  } catch(err) {
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
    ()=>{fs.unlinkSync(path);}
  )
}

app.get('/', asyncMiddleware(urlToPdf));
app.get('/screenshot/', asyncMiddleware(urlToScreenshot));


app.listen(3000, function () {
  console.log('pdf-puppet listening on port 3000!');
});
