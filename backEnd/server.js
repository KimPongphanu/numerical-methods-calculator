const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));

app.get('/api/chapters', (req, res) => {
  res.json(data.chapters);
});

app.get('/api/methods', (req, res) => {
  res.json(data.methods);
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

module.exports = app;
