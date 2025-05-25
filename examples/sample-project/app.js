const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World from Express!');
});

app.get('/api/data', (req, res) => {
  res.json({ message: 'This is sample data from the API.', timestamp: new Date() });
});

app.listen(port, () => {
  console.log(`Sample Express app listening at http://localhost:${port}`);
});
