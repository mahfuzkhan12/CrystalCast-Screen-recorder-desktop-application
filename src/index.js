const { app, BrowserWindow, ipcMain, desktopCapturer, Menu } = require('electron');
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


    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
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
    pickerDialog.show()
    pickerDialog.loadFile(path.join(__dirname, 'renderer/picker.html'));
    // pickerDialog.webContents.openDevTools();

    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
        pickerDialog.webContents.send('get-sources', sources)
    })
})

ipcMain.on('source-id-selected', (event, sourceId) => {
    pickerDialog.hide()
    mainWindow.webContents.send('source-id-selected', sourceId)
})


ipcMain.on('close-small', (event, sourceId) => {
    if (smallWindow && !smallWindow.isDestroyed()) {
        smallWindow.close();
    }
})

ipcMain.on('save', (event, data) => {
    if (smallWindow && !smallWindow.isDestroyed()) {
        smallWindow.close();
    }
    if(!data.main){
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
    if (pickerDialog && !pickerDialog.isDestroyed()) {
        pickerDialog.close()
    }
    // mainWindow.minimize()
    mainWindow.hide()
    // BrowserWindow?.getFocusedWindow()?.minimize()


    // small window
    smallWindow = new BrowserWindow({
        width: 300,
        height: 48,
        transparent: true,
        alwaysOnTop: true,
        autoHideMenuBar: true,
        x: Math.floor((require('electron').screen.getPrimaryDisplay().size.width - 300) / 2),
        y: require('electron').screen.getPrimaryDisplay().size.height - 100,
        webPreferences: {
            preload: path.join(__dirname, 'smallWindow.js'),
        },
        
        frame: false,
        focusable: false, 
        closable: true,
        fullscreenable: false,
        maximizable: false,
        resizable: false,
    });
    // smallWindow.webContents.openDevTools();
    smallWindow.loadFile(path.join(__dirname, 'renderer/smallWindow.html'));

})
ipcMain.on('record-tik-tok', (event, message) => {
    if(smallWindow){
        smallWindow.webContents.send('record-tik-tok', message)
    }
})