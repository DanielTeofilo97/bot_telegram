const puppeteer = require("puppeteer");
const groups = require("./utils/groups");
const selector = require("./utils/selectors");
require("dotenv").config();
require("colors");

console.log(
  ` ${("\n", ">>".yellow)} Serviço iniciado ${"Bot Telegram".bgBlue}`
);

const mainSetup = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: "./user_data",
    ignoreHTTPSErrors: true,
    defaultViewport: null,
    args: [
      "--log-level=3",
      "--no-default-browser-check",
      "--disable-infobars",
      "--disable-web-security",
      "--disable-site-isolation-trials",
      "--no-experiments",
      "--ignore-gpu-blacklist",
      "--ignore-certificate-errors",
      "--ignore-certificate-errors-spki-list",
      "--disable-extensions",
      "--disable-default-apps",
      "--enable-features=NetworkService",
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--window-size=720,1020",
    ],
  });

  const page = await browser.newPage();
  browser.on("disconnected", mainSetup);

  page._client.on("unhandledRejection", (reason, p) => {
    console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
    browser.close();
  });

  page._client.on("Network.webSocketCreated", ({ requestId, url }) => {
    console.log("Network.webSocketCreated", requestId, url);
  });

  page._client.on("Network.webSocketClosed", ({ requestId, timestamp }) => {
    console.log("Network.webSocketClosed", requestId, timestamp);
  });

  page._client.on(
    "Network.webSocketFrameSent",
    ({ requestId, timestamp, response }) => {
      console.log(
        "Network.webSocketFrameSent",
        requestId,
        timestamp,
        response.payloadData
      );
    }
  );

  page._client.on(
    "Network.webSocketFrameReceived",
    ({ requestId, timestamp, response }) => {
      console.log(
        "Network.webSocketFrameReceived",
        requestId,
        timestamp,
        response.payloadData
      );
    }
  );

  await page.setRequestInterception(true);

  page.on("error", (err) => {
    console.error("Error Page", err);
    browser.close();
  });

  page.on("request", (request) => {
    if (
      [
        "image",
        "stylesheet",
        "script",
        "media",
        "font",
        "texttrack",
        "object",
        "beacon",
        "csp_report",
        "imageset",
      ].indexOf(request.resourceType()) !== -1
    ) {
      request.abort();
    } else {
      request.continue();
    }
  });

  
  try {

    for (let group of groups) {
      await page.goto(group.split("|")[1]);
      await page.waitFor(5000);
      await page.keyboard.down("ControlLeft");
      await page.keyboard.press("KeyA");
      await page.keyboard.up("ControlLeft");
      await page.keyboard.down("ControlLeft");
      await page.keyboard.press("KeyC");
      await page.keyboard.up("ControlLeft");
      await page.goto(selector.urlGroupPublic);
      await page.type(selector.messageTextArea, group.split("|")[0]);
      await page.waitFor(5000);
      await page.keyboard.down("ControlLeft");
      await page.keyboard.press("KeyV");
      await page.keyboard.up("ControlLeft");
      await page.waitFor(5000);
      await page.keyboard.press("Enter");
    }
    browser.close();

  } catch (err) {
    console.error(`#ERRO ${err}`.red);
    browser.close();
  }
};

mainSetup();
