const fs = require('fs');
const path = require('path');
const folder = path.join(__dirname, 'secret-folder');

fs.readdir(folder, {withFileTypes: true}, (error, files) => {
    if (error) throw error;
    for (let i = 0; i < files.length; i++) {
        let currentFile = path.join(folder, files[i].name);
        fs.stat(currentFile, (statError, Dirent) => {
            if(statError) throw statError;
            if (files[i].isFile()) {
                console.log(`${files[i].name.slice(0, files[i].name.indexOf('.'))} - ${path.extname(files[i].name).slice(1)} - ${(Dirent.size / 1024).toFixed(3)}kb`);
            }
        })
    }
});
