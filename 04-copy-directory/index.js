const fs = require('fs');
const path = require('path');
const folder = path.join(__dirname, 'files');
const newFolder = path.join(__dirname, 'files-copy');

fs.access(newFolder, (err) => {
    if (err) {
        fs.mkdir(newFolder, error => {
            if(error) throw error;
            copyFolder();
        });
    } else {
        fs.readdir(newFolder, (error, files) => {
            if (error) throw error;
            for (const file of files) {
                fs.unlink(path.join(newFolder, file), error => {
                    if(error) throw error;
                    copyFolder();
                });
            }
        });
    }
});

function copyFolder() {
    fs.readdir(folder, (error, files) => {
        if(error) throw error;
        for (const file of files) {
            fs.copyFile(path.join(folder, file), path.join(newFolder, file), error => {
                if(error) throw error;
            });
        }
    });
}

