const fs = require('fs');
const path = require('path');
const process = require('process');
const file = path.join(__dirname, 'text.txt');
const myStream = fs.createWriteStream(file, 'utf-8');
const { stdin, stdout } = process;
stdout.write('Please, enter your text:\n');

stdin.on('data', data => {
    if (data.toString().trim() === 'exit') {
        stdout.write('Thank you for checking!');
        process.exit();
    }
    myStream.write(data);
});

process.on('SIGINT', () => {
    stdout.write('Thank you for checking!');
    process.exit();
});