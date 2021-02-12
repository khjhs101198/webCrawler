const puppeteer = require('puppeteer-core');
const fs = require("fs");
const rp = require("request-promise-native");
const express = require("express");
const app = express();

async function getUrl(url) {
  let result;
  const browser = await puppeteer.launch({
    executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"
  });
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForSelector(".cuc.grows");
  await page.evaluate(function() {
    let data = document.querySelectorAll(".cuc.grows");
    let result = [];
    for(let i=0; i<9; i++) {
      result.push(data[i].href);
    }
    return result;
  }).then(function(res){
    result = res;
  }).catch(function(err){
    console.log(err);
  })
  for(let i=0; i<result.length; i++) {
    let type = await result[i].slice( result[i].lastIndexOf("."), result[i].length );
    await store(page, result[i], i, type);
  }
  await browser.close();
}

async function store(page, url, idx, type) {
  await page.goto(url)
    .then(function(res){
      return res.buffer();
    })
    .then(function(res){
      fs.writeFile(`./example${idx}${type}`, res, function(err){
        if(err) console.log("Error in write file:" + err);
      });
    })
    .catch(function(err){
      console.log(err);
    })
}

/*Download images by using request-promise-native*/
async function getUrl_req(url) {
  let result;
  const browser = await puppeteer.launch({
    executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"
  });
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForSelector(".cuc.grows");
  await page.evaluate(function() {
    let data = document.querySelectorAll(".cuc.grows");
    let result = [];
    for(let i=0; i<5; i++) {
      result.push(data[i].href);
    }
    return result;
  }).then(function(res){
    result = res;
  }).catch(function(err){
    console.log(err);
  })
  await browser.close();
  for(let i=0; i<result.length; i++) {
    let fileName = await `./images/example${i}` + result[i].slice( result[i].lastIndexOf("."), result[i].length );
    await rp(result[i]).pipe(fs.createWriteStream(fileName));
  }
  console.log("Complete");
}

/*Get mutiple pages*/
async function getUrl_multiple(url) {
  let result;
  const browser = await puppeteer.launch({
    executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"
  });
  const page = await browser.newPage();
  await page.goto(url);
  for(let i=0; i<5; i++) {
    await page.waitForSelector(".cuc.grows");
    await page.waitForSelector(".my-3 .btn--large:last-child");
    await page.evaluate(function() {
      let data = document.querySelectorAll(".cuc.grows");
      let result = [];
      for(let i=0; i<2; i++) {
        result.push(data[i].href);
      }
      return result;
    }).then(function(res){
      result = res;
    }).catch(function(err){
      console.log(err);
    })
    for(let j=0; j<result.length; j++) {
      let fileName = await `./images/example${i}-${j}` + result[j].slice( result[j].lastIndexOf("."), result[j].length );
      await rp(result[j]).pipe(fs.createWriteStream(fileName));
    }
    await Promise.all([
      page.click(".my-3 .btn--large:last-child"),
      page.waitForFunction(function(page){
        return `${page+1} / 100` !== document.querySelector(".mx-4").innerHTML;
      }, {}, i)
    ])
  }

  await browser.close();
  console.log("Complete");
}

app.use(express.static(__dirname+"/script"));
app.get("/", function(req, res){
  res.sendFile(`${__dirname}/main.html`);
});
app.get("/download", function(req, res){
  getUrl_req("https://members.hanime.tv/browse/images");
  res.send("test");
});
app.listen(process.env.PORT||3000, function(err){
  if(err) throw err;
  console.log("Work properly");
});
