const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const targetFolder = path.join(__dirname, 'project-dist');
const startAssetsFolder = path.join(__dirname, 'assets');
const targetAssets = path.join(targetFolder, 'assets');

fs.access(targetFolder, (err) => {
    if (err) {
        fs.mkdir(targetFolder, { recursive: true }, error => {
            if(error) throw error;
        });
        fs.mkdir(targetAssets, { recursive: true }, error => {
            if(error) throw error;
        });
        getBundle().then(() => {
            return getBundle();
        }).then(() => {
            return getIndex();
        }).then(() => {
            getAssets(startAssetsFolder);
        });
    } else {
        fs.truncate(path.join(targetFolder, 'index.html'), 0, error => {
            if(error) throw error;
        });
        fs.truncate(path.join(targetFolder, 'style.css'), 0,  error => {
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
                fs.rmdir(path.join(targetAssets, file), { recursive: true }, folderError => {
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
                        fs.rmdir(path.join(targetAssets, file), { recursive: true }, folderError => {
                            if(folderError) throw folderError;
                        });
                    }
                });
            }
        });
        getBundle().then(() => {
            return getBundle();
        }).then(() => {
            return getIndex();
        }).then(() => {
            getAssets(startAssetsFolder);
        });
    }
});

async function getBundle() {
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

async function getIndex() {
    const startIndex = path.join(__dirname, 'template.html');
    const components = path.join(__dirname, 'components');
    let value = await fsPromises.readFile(startIndex, 'utf-8');
    let componentsParts = await fsPromises.readdir(components);
    let targetIndex = path.join(targetFolder, 'index.html');
    for (const file of componentsParts) {
        let currentFile = path.join(components, file);
        let data = await fsPromises.readFile(currentFile);
        let tagName = path.parse(currentFile).name;
            value = value.replace(`{{${tagName}}}`, data);
        }
    fs.writeFile(targetIndex, value, writeError => {
        if(writeError) throw writeError;
    });
}

async function getAssets(startAssetsFolder) {
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
                    fs.mkdir(path.join(targetAssets, file.name), { recursive: true }, dirError => {
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