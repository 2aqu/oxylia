const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = 5001;
const webhookURL = 'https://discord.com/api/webhooks/1213506519514218517/Yv3X_oJZPEpGu8UVqcQBG0H8oKVdmICOSgRn66C3rcAlD0tvV9QQbsjWEdipkkIdmaoh';

app.use(express.json());

// Tüm burçları içeren bir dizi
const burclar = ['kova', 'balik', 'koc', 'boga', 'ikizler', 'yengec', 'aslan', 'basak', 'terazi', 'akrep', 'yay', 'oglak'];

app.get('/sendToWebhook', async (req, res) => {
    try {
        // Tüm burçlar için ayrı ayrı istekler yap
        for (const burc of burclar) {
            const response = await fetch(`http://localhost:5000/get/${burc}`);
            const burcData = await response.json();

            // Burç verilerini formatlayarak bir mesaj oluştur
            const message = `
             >  ## * **Burc:**\n${burcData[0].Burc}
             >  ## * **Burc Mottosu:**\n${burcData[0].Mottosu}
             >  ## *  **Gezegeni:**\n${burcData[0].Gezegeni}
             >  ## *  **Elementi:**\n${burcData[0].Elementi}
             >  ## *  **Günlük Yorum:**\n ${burcData[0].GunlukYorum}
             # ✿✿✿✿✿✿✿✿✿✿✿✿✿✿✿✿✿✿✿✿✿✿✿✿✿✿✿✿✿✿✿✿✿✿✿✿✿✿
            `;

            // Discord webhook'a gönderilecek mesaj
            const discordMessage = {
                content: message
            };

            // Discord webhook'a mesajı gönderme
            await fetch(webhookURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(discordMessage),
            });
        }

        res.status(200).send('Tüm burçlar için mesajlar başarıyla Discord webhook\'una gönderildi.');
    } catch (error) {
        console.error('Hata:', error);
        res.status(500).send('Bir hata oluştu.');
    }
});

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda başlatıldı.`);
});
