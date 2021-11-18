const puppeteer = require('puppeteer')
let cTab;
let link = "https://www.youtube.com/playlist?list=PLzkuLC6Yvumv_Rd5apfPRWEcjf9b1JRnq";
const pdf = require('pdfkit');
const fs = require('fs');


//IIFI -> use ; in the end for line above it

(async function () {
    try {
        const browserOpenInstance = await puppeteer.launch({
            headless: false,
            args: ['--start-maximized'],
            defaultViewport: null
        })
        let allTabs = await browserOpenInstance.pages();
        cTab = allTabs[0];
        await cTab.goto(link)
        await cTab.waitForSelector('h1[id="title"]')
        let name = await cTab.evaluate(function (select) {
            return document.querySelector(select).innerText
        }, 'h1[id="title"]') // pass- function, or argument of function
        console.log(name)
        let allData = await cTab.evaluate(getData, '#stats .style-scope.ytd-playlist-sidebar-primary-info-renderer')
        console.log(name, allData.noOfVideos, allData.noOfViews)

        let totalVideos = allData.noOfVideos.split(" ")[0]
        console.log(totalVideos)
        //no of videos of current page
        let cVideoslength = await getVideosLength();
        console.log(cVideoslength);
        while (totalVideos - cVideoslength >= 20) {
            await scrollToBottom()
            cVideoslength = await getVideosLength()
             
            
        }
        let finalList = await getStats();;
        console.log(finalList)
        let pdfDoc = new pdf
        pdfDoc.pipe(fs.createWriteStream('playlist.pdf'));
        pdfDoc.text(JSON.stringify(finalList));
        pdfDoc.end();





    } catch (error) {
        console.log(error)
    }
})();


function getData(selector) {
    let allElems = document.querySelectorAll(selector);
    let noOfVideos = allElems[0].innerText;
    let noOfViews = allElems[1].innerText;
    return {
        noOfVideos,
        noOfViews
    }
}

async function getVideosLength() {
    let length = await cTab.evaluate(getlength, '#contents #thumbnail #img.style-scope.yt-img-shadow')
    return length
}


async function getStats() {
    let list = await cTab.evaluate(getNameAndDuration, '#video-title',"#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer")
    return list;
}

async function scrollToBottom() {
    await cTab.evaluate(gotoBottom)
    function gotoBottom() {
        window.scrollBy(0, window.innerHeight)
    }
}

function getlength(durationSelect) {
    let durationElem = document.querySelectorAll(durationSelect)
    return durationElem.length;
}

//
function getNameAndDuration(videoSelector, durationSelector) {
    let videoElem = document.querySelectorAll(videoSelector)
    let duratonELem = document.querySelectorAll(durationSelector)

    let currentList = []
    for (let i = 0; i < duratonELem.length; i++) {
        let videoTitle = videoElem[i].innerText
        let duration = duratonELem[i].innerText
        currentList.push({ videoTitle, duration })
    }
    return currentList;//array of objects
}