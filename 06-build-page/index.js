const fs = require('fs');
const path = require('path');
const targetFolder = path.join(__dirname, 'project-dist');
const startAssetsFolder = path.join(__dirname, 'assets');
const targetAssets = path.join(targetFolder, 'assets');

fs.access(targetFolder, (err) => {
    if (err) {
        fs.mkdir(targetFolder, error => {
            if(error) throw error;
        });
        fs.mkdir(targetAssets, error => {
            if(error) throw error;
        });
        getBundle();
        getIndex();
        getAssets(startAssetsFolder);
    } else {
        fs.readdir(targetFolder, {withFileTypes: true}, (error, files) => {
            if (error) throw error;
            for (const file of files) {
                let currentFile = path.join(targetFolder, file.name);
                fs.stat(currentFile, (statError, Dirent) => {
                    if(statError) throw statError;
                    if (file.isFile()) {
                        fs.unlink(currentFile, err => {
                            if(err) throw err;
                        })
                    } else {
                        deleteFolder(currentFile);
                    }
                });
            }
        });
        getBundle();
        getIndex();
        getAssets(startAssetsFolder);
    }
});

function deleteFolder(folder) {
    fs.readdir(folder, {withFileTypes: true}, (err, files) => {
        if(err) throw err;
        for (const file of files) {
            let currentFile = path.join(folder, file.name);
            fs.stat(currentFile, (statError, Dirent) => {
                if(statError) throw statError;
                if(file.isFile()) {
                    fs.unlink(path.join(folder, file), error => {
                        if(error) throw error;
                    });
                } else {
                    deleteFolder(file);
                }
            });
        }
    });
    fs.rmdir(folder, error => {
        if(error) throw error;
    });
}

function getBundle() {
    const startStylesFolder = path.join(__dirname, 'styles');
    fs.readdir(startStylesFolder, (error, files) => {
        const targetStyles = path.join(targetFolder, 'style.css');
        const onStream = fs.createWriteStream(targetStyles, 'utf-8');
        if (error) throw error;
        for (const file of files) {
            if(path.extname(file) === '.css') {
                const outStream = fs.createReadStream(path.join(startStylesFolder, file), 'utf-8');
                outStream.on('data', chunk => {
                    onStream.write(chunk);
                })
            }
        }
    });
}

function getIndex() {
    const startIndex = path.join(__dirname, 'template.html');
    const targetIndex = path.join(targetFolder, 'index.html');
    const components = path.join(__dirname, 'components');
        fs.readFile(startIndex, 'utf-8', (error, value) => {
            if(error) throw error;
            fs.readdir(components, {withFileTypes: true}, (err, files) => {
                if(err) throw err;
                for (const file of files) {
                    let currentFile = path.join(components, file.name);
                    let tagName = file.name.slice(0, file.name.indexOf('.'));
                    fs.readFile(currentFile, 'utf-8', (readError, data) => {
                        if(readError) throw readError;
                        value = value.replace(`{{${tagName}}}`, data);
                        fs.writeFile(targetIndex, value, writeError => {
                            if(writeError) throw writeError;
                        });
                    });
                }
            });
        });
}

function getAssets(startAssetsFolder) {
    fs.readdir(startAssetsFolder, {withFileTypes: true}, (error, files) => {
        if(error) throw error;
        for (const file of files) {
            let currentFile = path.join(startAssetsFolder, file.name);
            fs.stat(currentFile, (statError, Dirent) => {
                if(statError) throw statError;
                if (file.isFile()) {
                    fs.copyFile(currentFile, path.join(targetAssets, file.name), error => {
                        if(error) throw error;
                    });
                } else {
                    fs.readdir(currentFile, (fileError, files2) => {
                        fs.mkdir(path.join(targetAssets, file.name), dirError => {
                            if(dirError) throw dirError;
                        });
                        if(fileError) throw fileError;
                        for (const file2 of files2) {
                            let resultFolder = path.join(targetAssets, file.name);
                            fs.copyFile(path.join(currentFile, file2), path.join(resultFolder, file2), copyError => {
                                if(copyError) throw copyError;
                            });
                        }
                    });
                }
            });
        }
    });
}