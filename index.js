require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb');
const dns = require('dns');
const urlParser = require('url');
// MongoDB Client configuration
const client = new MongoClient(process.env.MONGO_URI);
const db = client.db('urlshortener');
const urls = db.collection('urls');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(`${process.cwd()}/public`));


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;
  const dnsLookUp = dns.lookup(urlParser.parse(url).hostname, async (err, address) => {
    if (err) return console.log(err);

    if (!address) {
      res.json({ error: 'invalid url' });
    } else {
      const urlCount = await urls.countDocuments({});
      const urlDoc = {
        url,
        short_url: urlCount
      }

      const result = await urls.insertOne(urlDoc);

      res.json({ 
        original_url: url,  
        short_url: urlCount
      });
    }
  });
});

app.get('/api/shorturl/:shorturl', async (req, res) => {
  const shortUrl = req.params.shorturl;r
  const urlDoc = await urls.findOne({ short_url: Number(shortUrl)});
  res.redirect(urlDoc.url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
