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

const createWindow = () => {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 900,
    titleBarStyle: 'hidden',
    // alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'app.js'),
    },
  });
  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
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


ipcMain.on('recording', (event, sourceId) => {
  pickerDialog.close()
  // mainWindow.minimize()
  BrowserWindow?.getFocusedWindow()?.minimize()
})