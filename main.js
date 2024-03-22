const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');

const app = express();
const PORT = process.env.PORT || 80;
const webhookURL = 'https://discord.com/api/webhooks/1213514739334782987/BuLfPw3_-ZwzNB4g85PDs7ltPnRVYFQn5XgchpMMmZNrQLYudlE-B_ISNWCDGgh4odLU';

const API_URI_1 = "https://www.hurriyet.com.tr/mahmure/astroloji/{0}-burcu/";
const API_URI_2 = "https://www.hurriyet.com.tr/mahmure/astroloji/{0}-burcu-{1}-yorum/";
const API_URI_3 = "https://www.hurriyet.com.tr/mahmure/astroloji/burclar/{0}-burcu/{1}";

const roleIDs = {
    'kova': '1213513099756445726',
    'balik': '1213513140818546738',
    'koc': '1213513143662280704',
    'boga': '1213513146568933426',
    'ikizler': '1213513149857136690',
    'yengec': '1213513152688300193',
    'aslan': '1213513156186345523',
    'basak': '1213513159600771072',
    'terazi': '1213513162784116778',
    'akrep': '1213513165892222996',
    'yay': '1213513168802947132',
    'oglak': '1213513172149997628'
};

app.use(express.json());

app.get('/get/:burc', async (req, res) => {
    try {
        const burc = req.params.burc;
        const datas = [];

        const response = await fetch(API_URI_1.replace('{0}', slugify(burc)));
        const body = await response.text();
        const $ = cheerio.load(body);

        $('div[class=main-wrapper]').each((i, e) => {
            datas[i] = {
                Burc: burc.charAt(0).toUpperCase() + burc.slice(1),
                Mottosu: $(e).find('div[class=page] div div .region-type-1.col-12 .row.mb20 div div div[class=horoscope-menu-detail] ul li ').eq(0).text().match(/(.*):\s\s(.*)/)[2],
                Gezegeni: $(e).find('div[class=page] div div .region-type-1.col-12 .row.mb20 div div div[class=horoscope-menu-detail] ul li ').eq(1).text().match(/(.*):\s\s(.*)/)[2],
                Elementi: $(e).find('div[class=page] div div .region-type-1.col-12 .row.mb20 div div div[class=horoscope-menu-detail] ul li ').eq(2).text().match(/(.*):\s\s(.*)/)[2],
                GunlukYorum: $(e).find('div[class=page] div div .region-type-2.col-lg-8.col-md-12 div div div[class=horoscope-detail-content] div p').text()
            };
        });

        res.send(datas);
    } catch (error) {
        console.error('error:', error);
        res.status(500).send('An error occurred');
    }
});

app.get('/get/:burc/:zaman', async (req, res) => {
    try {
        const burc = req.params.burc;
        const zaman = req.params.zaman;
        const datas = [];

        const response = await fetch(API_URI_2.replace('{0}', slugify(burc)).replace('{1}', slugify(zaman)));
        const body = await response.text();
        const $ = cheerio.load(body);

        $('div[class=main-wrapper]').each((i, e) => {
            datas[i] = {
                Burc: burc.charAt(0).toUpperCase() + burc.slice(1),
                Zaman: zaman.charAt(0).toUpperCase() + zaman.slice(1),
                Mottosu: $(e).find('div[class=page] div div .region-type-1.col-12 .row.mb20 div div div[class=horoscope-menu-detail] ul li ').eq(0).text().match(/(.*):\s\s(.*)/)[2],
                Gezegeni: $(e).find('div[class=page] div div .region-type-1.col-12 .row.mb20 div div div[class=horoscope-menu-detail] ul li ').eq(1).text().match(/(.*):\s\s(.*)/)[2],
                Elementi: $(e).find('div[class=page] div div .region-type-1.col-12 .row.mb20 div div div[class=horoscope-menu-detail] ul li ').eq(2).text().match(/(.*):\s\s(.*)/)[2],
                Yorum: $(e).find('div[class=page] div div .region-type-2.col-lg-8.col-md-12 div div div[class=horoscope-detail-content] div p').text()
            };
        });

        res.send(datas);
    } catch (error) {
        console.error('error:', error);
        res.status(500).send('An error occurred');
    }
});

app.get('/gets/:burc/:ozellik', async (req, res) => {
    try {
        const burc = req.params.burc;
        const ozellik = req.params.ozellik;
        const datas = [];

        const response = await fetch(API_URI_3.replace('{0}', slugify(burc)).replace('{1}', slugify(ozellik)));
        const body = await response.text();
        const $ = cheerio.load(body);

        $('.col-md-12.col-lg-8').each((i, e) => {
            datas[i] = {
                Burc: burc.charAt(0).toUpperCase() + burc.slice(1),
                Ozellik: ozellik.charAt(0).toUpperCase() + ozellik.slice(1),
                Baslik: $(e).find('div h2').text().match(/(.*)\"(.*)\.(.*)/)[2],
                Yorum: $(e).find('div div p').text(),
                Unluler: $(e).find('div div ul li').text()
            };
        });

        res.send(datas);
    } catch (error) {
        console.error('error:', error);
        res.status(500).send('An error occurred');
    }
});

app.get('/sendToWebhook', async (req, res) => {
    try {
        for (const burc in roleIDs) {
            const response = await fetch(`http://localhost:${PORT}/get/${burc}`);
            const burcData = await response.json();

            const message = `
> ## Burc:
> * ${burcData[0].Burc}
> ## Burc Mottosu:
> * ${burcData[0].Mottosu}
> ## Gezegeni:
> * ${burcData[0].Gezegeni}
> ## Elementi:
> * ${burcData[0].Elementi}
> ## Günlük Yorum:
> * ${burcData[0].GunlukYorum}
> || <@&${roleIDs[burc]}> ||
            `;

            const discordMessage = { content: message };

            await fetch(webhookURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(discordMessage),
            });
        }

        res.status(200).send('All messages sent.');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Message could not be sent');
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
