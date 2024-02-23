const { app, BrowserWindow, ipcMain, desktopCapturer, Menu, screen } = require('electron');
const path = require('path');

if (require('electron-squirrel-startup')) {
    app.quit();
}

const menus = [
    {
        label: 'File',
        submenu: [
            { role: 'close' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    },
    {
        label: 'Window',
        submenu: [
            { role: 'close' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    },
]

const menu = Menu.buildFromTemplate(menus)
Menu.setApplicationMenu(menu)

let mainWindow
let pickerDialog
let smallWindow;


const createSmallWindow = () => {
    const screenWidth = screen.getPrimaryDisplay().size.width;
    const screenHeight = screen.getPrimaryDisplay().size.height;
    const windowWidth = 280;
    const windowHeight = 33;
    const windowX = Math.floor((screenWidth - windowWidth) / 2);
    const windowY = screenHeight - 85;

    smallWindow = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        transparent: true,
        alwaysOnTop: true,
        autoHideMenuBar: true,
        x: windowX,
        y: windowY,
        webPreferences: {
            preload: path.join(__dirname, 'smallWindow.js'),
        },
        frame: false,
        closable: true,
        fullscreenable: false,
        maximizable: false,
        resizable: false,
    });

    smallWindow.loadFile(path.join(__dirname, 'renderer/smallWindow.html'));
}

const createWindow = () => {
    mainWindow = new BrowserWindow({
        height: 600,
        width: 900, 
        // show: false,
        titleBarStyle: 'hidden',
        // alwaysOnTop: true,
        webPreferences: {
            preload: path.join(__dirname, 'app.js'),
        },
    });
    mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
    // smallWindow.webContents.openDevTools();
};


app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});


ipcMain.on('show-picker', (event, options) => {

    pickerDialog = new BrowserWindow({
        parent: mainWindow,
        skipTaskbar: true,
        modal: true,
        show: true,
        height: 600,
        width: 1000,
        webPreferences: {
            preload: path.join(__dirname, 'picker.js'),
        },
    })
    pickerDialog.loadFile(path.join(__dirname, 'renderer/picker.html'));

    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
        console.log(sources);

        const filteredSources = sources.filter(source => source.name !== "CrystalCast - Scree Recorder");
        pickerDialog.webContents.send('get-sources', filteredSources)
    })
})

ipcMain.on('source-id-selected', (event, sourceId) => {
    if (pickerDialog && !pickerDialog.isDestroyed()) {
        pickerDialog.close()
    }
    mainWindow.webContents.send('source-id-selected', sourceId)
})


ipcMain.on('close-small', (event, sourceId) => {
    if (smallWindow && !smallWindow?.isDestroyed()) {
        smallWindow?.close();
    }
})

ipcMain.on('save', (event, data) => {
    if (smallWindow && !smallWindow?.isDestroyed()) {
        smallWindow?.close();
    }
    if(!data?.main){
        mainWindow.webContents.send('save')
    }
    mainWindow.show()
})
ipcMain.on('mute', (event, isMuted) => {
    mainWindow.webContents.send('mute', isMuted)
})
ipcMain.on('pauseState', (event, isPaused) => {
    mainWindow.webContents.send('pauseState', isPaused)
})
ipcMain.on('recording', (event, sourceId) => {
    if (pickerDialog && !pickerDialog?.isDestroyed()) {
        pickerDialog?.close()
    }
    // mainWindow.minimize()
    mainWindow.hide()
    // BrowserWindow?.getFocusedWindow()?.minimize()

    createSmallWindow()
})
ipcMain.on('record-tik-tok', (event, message) => {
    if(smallWindow){
        smallWindow.webContents.send('record-tik-tok', message)
    }
})