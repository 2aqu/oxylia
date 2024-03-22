const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = 5001;
const webhookURL = 'https://discord.com/api/webhooks/1213514739334782987/BuLfPw3_-ZwzNB4g85PDs7ltPnRVYFQn5XgchpMMmZNrQLYudlE-B_ISNWCDGgh4odLU';

app.use(express.json());

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

app.get('/sendToWebhook', async (req, res) => {
    try {

        for (const burc in roleIDs) {
            const response = await fetch(`http://localhost:8000/get/${burc}`);
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

            const discordMessage = {
                content: message
            };

            await fetch(webhookURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(discordMessage),
            });
        }

        res.status(200).send('all messages sent.');
    } catch (error) {
        console.error('err:', error);
        res.status(500).send('message cannot send');
    }
});

app.listen(PORT, () => {
    console.log(`server starting port: ${PORT}`);
});
