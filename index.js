const fs = require('fs');
const express = require('express');
const cors = require('cors');
const chalk = require('chalk');
const AWS = require('@aws-sdk/client-s3');
const axios = require('axios');

const {
  default: makeWASocket,
  BufferJSON,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  jidNormalizedUser,
  delay
} = require("@adiwajshing/baileys");

async function qr() {
  const { version, isLatest } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  const conn = makeWASocket({
    printQRInTerminal: true,
    browser: ['BOT', 'Web', 'v1'],
    auth: state,
    version
  });

  console.log('⏳  Connecting to Whatsapp... Please wait.');
  await conn.ev.on('creds.update', saveCreds);

  conn.ev.on('connection.update', async (update) => {
    let _a, _b;
    let connection = update.connection, lastDisconnect = update.lastDisconnect;

    if (connection === 'connecting') {
      console.log('Connecting...');
    }

    if (connection === 'open') {
      console.log('✅ Successfully connected');
      let router = express.Router();

      router.get('/', (req, res) => {
        const jsond = { "status": "ok" };
        res.json(jsond);
      });

      // Initialize AWS S3
      const s3 = new AWS.S3();

      let app = express();
      app.enable('trust proxy');
      app.set("json spaces", 2);
      app.use(cors());
    //  app.use(secure);
      app.use(express.static("assets"));

      router.get('/api', async (req, res) => {
         // Initialize the `sentArticles` set.
  const sentArticles = new Set();

  try {
    // Read the old news from AWS S3.
    const s3File = await s3.getObject({
      Bucket: process.env.BUCKET,
      Key: 'news.json',
    }).promise();

    const oldNews = JSON.parse(s3File.Body.toString());

    // Add the old news to the `sentArticles` set.
    for (const article of oldNews) {
      sentArticles.add(article.title);
    }
  } catch (error) {
    console.error("Error reading news data from S3:", error);
  }

  // Read the new news from the API.
  try {
    const response = await axios.get("https://test.ayodyavichaksha.repl.co/api/latest");
    const newsData = response.data;
    const newsArticles = Object.values(newsData);

    // Loop through the new news articles and send them if they have not already been sent.
    for (const article of newsArticles) {
      if (!sentArticles.has(article.title)) {
        // Send the article (your existing code for sending articles goes here).
// Send the article.
const imgurl = article.image;

// Check if the image URL is incomplete.
if (imgurl === undefined || imgurl.length === 0) {
  // Send a backup image URL.
  await conn.sendMessage('120363175378138503@g.us', { image: { url: 'https://telegra.ph/file/af7cf83d69b39b5ddf1f9.jpg' }, caption: `*${article.title}*\n\n${article.desc}\n\n🗓️ ${article.time}\n⛦ ꜱᴏᴜʀᴄᴇ - ᴡᴡᴡ.ʜɪʀᴜɴᴇᴡs.ʟᴋ` });
} else {
  // Check if the image URL contains jpg, png, or webp.
  const imageExtensionRegex = /(jpg|png|webp)$/i;
  if (!imageExtensionRegex.test(imgurl)) {
    // Send a backup image URL.
    await conn.sendMessage('120363175378138503@g.us', { image: { url: 'https://telegra.ph/file/af7cf83d69b39b5ddf1f9.jpg' }, caption: `*${article.title}*\n\n${article.desc}\n\n🗓 ️${article.time}\n⛦ ꜱᴏᴜʀᴄᴇ - ᴡᴡᴡ.ʜɪʀᴜɴᴇᴡs.ʟᴋ` });
  } else {
    // Send the original image URL.
    await conn.sendMessage('120363175378138503@g.us', { image: { url: imgurl }, caption: `*${article.title}*\n\n${article.desc}\n\n🗓️ ${article.time}\n⛥ ꜱᴏᴜʀᴄᴇ - ᴡᴡᴡ.ʜɪʀᴜɴᴇᴡs.ʟᴋ` });
  }
}

        // Add the article to the set of sent articles.
        sentArticles.add(article.title);
      }
    }

    // Update the JSON file with the new news.
    try {
      await s3.putObject({
        Body: JSON.stringify(newsArticles),
        Bucket: process.env.BUCKET,
        Key: 'news.json',
      }).promise();
    } catch (error) {
      console.error("Error writing news data to S3:", error);
    }
  } catch (error) {
    console.error("Error fetching news data from the API:", error);
  }

  const jsond = { "status": "ok" };
  res.json(jsond);
      });

      const PORT = process.env.PORT || 8989;
      app.use('/', router);

      app.listen(PORT, () => {
        console.log("Server running on port " + PORT);
      });

      app.use((req, res, next) => {
        setInterval(async () => {
          await axios.get('https://successful-fly-cowboy-boots.cyclic.app').catch(console.error);
        }, 300000);
      });

      if (connection === 'close') {
        if (lastDisconnect.error && lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut) {
          qr();
        } else {
          console.log("error");
          process.exit(0);
        }
      }
    }
  });
}

qr();