const fs = require('fs');
const path = require('path');
const folder = path.join(__dirname, 'styles');
const targetFolder = path.join(__dirname, 'project-dist');
const bundle = path.join(targetFolder, 'bundle.css');

const onStream = fs.createWriteStream(bundle, 'utf-8');

fs.readdir(folder, (error, files) => {
    if (error) throw error;
    for (const file of files) {
        if(path.extname(file) === '.css') {
            const outStream = fs.createReadStream(path.join(folder, file), 'utf-8');
            outStream.on('data', chunk => {
                onStream.write(chunk);
                onStream.write('\n\n');
            })
        }
    }
})