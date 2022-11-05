const fs = require('fs');
//const promises = require('fs/promises');
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
        fs.truncate(path.join(targetFolder, 'index.html'), error => {
            if(error) throw error;
        });
        fs.truncate(path.join(targetFolder, 'style.css'), error => {
            if(error) throw error;
        });
        fs.readdir(targetAssets, (err, files) => {
            if(err) throw err;
            for (const file of files) {
                let currentAssetsFolder = path.join(targetAssets, file);
                fs.readdir(currentAssetsFolder, (assetError, assets) => {
                    if(assetError) throw assetError;
                    for (const asset of assets) {
                        let currentAsset = path.join(currentAssetsFolder, asset);
                        fs.unlink(currentAsset, currentAssetError => {
                            if(currentAssetError) throw currentAssetError;
                        });
                    }
                });
            }
            for (const file of files) {
                fs.rmdir(path.join(targetAssets, file), folderError => {
                    if(folderError) {
                        fs.readdir(path.join(targetAssets, file), (assetError, assets) => {
                            if(assetError) throw assetError;
                            for (const asset of assets) {
                                let currentAsset = path.join(path.join(targetAssets, file), asset);
                                fs.unlink(currentAsset, currentAssetError => {
                                    if(currentAssetError) throw currentAssetError;
                                });
                            }
                        });
                        fs.rmdir(path.join(targetAssets, file), folderError => {
                            if(folderError) throw folderError;
                        });
                    }
                });
            }
        });
        getBundle();
        getIndex();
        getAssets(startAssetsFolder);
    }
});

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
                    onStream.write('\n\n');
                });
            }
        }
    });
}

function getIndex() {
    const startIndex = path.join(__dirname, 'template.html');
    const components = path.join(__dirname, 'components');
    fs.readFile(startIndex, 'utf-8', (error, value) => {
        if(error) throw error;
        fs.readdir(components, {withFileTypes: true}, (err, files) => {
            if(err) throw err;
            let targetIndex = path.join(targetFolder, 'index.html');
            for (const file of files) {
                let currentFile = path.join(components, file.name);
                fs.readFile(currentFile, 'utf-8', (readError, data) => {
                    if(readError) throw readError;
                    let tagName = file.name.slice(0, file.name.indexOf('.'));
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
                    fs.mkdir(path.join(targetAssets, file.name), dirError => {
                        if(dirError) throw dirError;
                    });
                    fs.readdir(currentFile, (fileError, files2) => {
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