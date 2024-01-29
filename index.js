const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello Capstone!');
})

app.listen(port, () => {
    console.log(`Capstone Project listening at http://localhost:${port}`)
})