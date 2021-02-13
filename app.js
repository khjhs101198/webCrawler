const puppeteer = require('puppeteer-core');
const fs = require("fs");
const rp = require("request-promise-native");
const express = require("express");
const app = express();
const urlencodedParser = express.urlencoded({extended: false});
const jsonParser = express.json();

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
      fs.writeFile(`./download/example${idx}${type}`, res, function(err){
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
    let fileName = await `./download/example${i}` + result[i].slice( result[i].lastIndexOf("."), result[i].length );
    await rp(result[i]).pipe(fs.createWriteStream(fileName));
  }
  console.log("Complete");
}

/*Get mutiple pages*/
async function getUrl_multiple(url, pageS, pageE, imgS, imgE) {
  let result;
  const browser = await puppeteer.launch({
    executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"
  });
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForSelector(".jump-input");
  await page.click(".jump-input");
  await page.keyboard.sendCharacter((pageS+1).toString());
  await page.waitForFunction("document.querySelector('.jump-btn').disabled === false");
  await Promise.all([
    page.click(".jump-btn"),
    page.waitForFunction("document.querySelector('.jump-btn').disabled === true")
  ]);
  for(let i=pageS; i<pageE; i++) {
    await page.waitForSelector(".cuc.grows");
    await page.waitForSelector(".my-3 .btn--large:last-child");
    await page.evaluate(function(imgS, imgE) {
      let data = document.querySelectorAll(".cuc.grows");
      let result = [];
      for(let i=imgS; i<imgE; i++) {
        result.push(data[i].href);
      }
      return result;
    }, imgS, imgE).then(function(res){
      result = res;
    }).catch(function(err){
      console.log(err);
    })
    for(let j=0; j<result.length; j++) {
      let fileName = await `./download/example${i}-${j+imgS}` + result[j].slice( result[j].lastIndexOf("."), result[j].length );
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

async function getImage(req, res, next) {
  await getUrl_multiple("https://members.hanime.tv/browse/images", Number(req.body.pageS), Number(req.body.pageE), Number(req.body.imgS), Number(req.body.imgE));
  await next();
}

app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
app.use(urlencodedParser, jsonParser);

app.get("/", function(req, res){
  res.render("main.ejs");
});
app.post("/", getImage, function(req, res){
  res.send("Complete to download all images");
})

app.listen(process.env.PORT||3000, function(err){
  if(err) throw err;
  console.log("Work properly");
});
