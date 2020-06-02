const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { v4: uuidv4 } = require('uuid');
const json2xls = require('json2xls');
var fs = require('fs');
(async () => {
    const categoryArray=[];
    const detailArray=[];
    const sidArray = [4, 5, 17, 44]//
    const browser = await puppeteer.launch({ headless: false });

    for (let index = 0; index < sidArray.length; index++) {
        const sidNumber = sidArray[index];
        const page = await browser.newPage();
        await page.goto(`https://www.upl.com.tw/news.php?sid=${sidNumber}`);
        const newsList = await page.evaluate(() => document.body.innerHTML);
        const $ = cheerio.load(newsList);
        const item=$('.item');
        const currentTypeName=$('.current').attr('title')
        console.log(currentTypeName);

        const CategoryData={
            ID:uuidv4(),
            Category:currentTypeName,
            Icon:'',
            IsEnable:1,
            Seq:index,
            InitUID:'BD3A1EFC-17FD-4EC7-8E8D-F7926E30268C',
            InitDT:'2020-06-02 11:20:03.930',
            ModifiedUID:'BD3A1EFC-17FD-4EC7-8E8D-F7926E30268C',
            ModifiedDT:'2020-06-02 11:20:03.930'
        }
        categoryArray.push(CategoryData)
        console.log(CategoryData)
        for (let index = 0; index < item.length; index++) {
            const element = item[index];
            const detailContentUrl='https://www.upl.com.tw/'+$(element).find('.itemTitle').children('a').attr('href');
            console.log(detailContentUrl);
            //col_content
            const browser2 = await puppeteer.launch();
            const page2 = await browser2.newPage();
            await page2.goto(detailContentUrl);
            const detailContent = await page2.evaluate(() => document.getElementsByClassName('col_content')[0].innerHTML);
            await browser2.close();

            const detailData={
                ID:uuidv4(),
                NewsCatID:CategoryData.ID,
                DetailTitle:$(element).find('a').attr('title'),
                DetailContent:detailContent,
                Avatar:`https://www.upl.com.tw${$(element).find('img').attr('src')}`,
                PublishDate:$(element).find('.itemDate').text().split(" ")[1],
                Attachment:'',
                IsEnable:1,
                Seq:index,
                Publisher:$(element).find('.poster').text(),
                InitUID:'BD3A1EFC-17FD-4EC7-8E8D-F7926E30268C',
                InitDT:'2020-06-02 11:20:03.930',
                ModifiedUID:'BD3A1EFC-17FD-4EC7-8E8D-F7926E30268C',
                ModifiedDT:'2020-06-02 11:20:03.930'
            }
            detailArray.push(detailData)
            console.log(detailData);

        }
        console.log(`https://www.upl.com.tw/news.php?sid=${sidNumber}`);
    }


    await browser.close();

    let xls = json2xls(categoryArray);
    fs.writeFileSync(`Category.xlsx`, xls, 'binary');

    let xls2 = json2xls(detailArray);
    fs.writeFileSync(`Detail.xlsx`, xls2, 'binary');
})();
