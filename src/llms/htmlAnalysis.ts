import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";

/**
 * Loader uses `page.evaluate(() => document.body.innerHTML)`
 * as default evaluate function
 **/
export const run = async()=>{
    const loader = new PuppeteerWebBaseLoader("https://www.baidu.com",{
    launchOptions: {
        headless: true,
        timeout: 600000,
      },
      gotoOptions: {
        waitUntil: "domcontentloaded",
        timeout:600000,
      },
      /** Pass custom evaluate, in this case you get page and browser instances */
      async evaluate(page: Page, browser: Browser) {
        // await page.waitForResponse("https://www.baidu.com");
    
        const result = await page.evaluate(() => document.body.innerHTML);
        return result;
      },
});

const docs = await loader.load();
console.log(docs);

}
