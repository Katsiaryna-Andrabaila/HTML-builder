const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'text.txt');
const myStream = fs.createReadStream(file, 'utf-8');
myStream.on('data', chunk => console.log(chunk));
myStream.on('error', error => console.log('Error', error.message));