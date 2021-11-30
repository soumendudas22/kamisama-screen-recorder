const { app, BrowserWindow, Menu, MenuItem, shell } = require('electron');
const path = require('path');
const { electron } = require('process');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Custom Menu
const templateMenu = [
  {
    label: "View",
    submenu: [
      {
        role: "reload",
      },
      {
        type: "separator",
      },
      {
        role: "resetzoom",
      },
      {
        role: "zoomin",
      },
      {
        role: "zoomout",
      },
      {
        type: "separator",
      },
      {
        role: "togglefullscreen",
      },
      // Only for testing purpose
      // {
      //   role: 'toggledevtools'
      // },
    ],
  },
  {
    role: "window",
    submenu: [
      {
        role: "minimize",
      },
      {
        role: "close",
      },
    ],
  }, 
  {
    label: "Support Project",
    click: () => {
      shell.openExternal('https://www.buymeacoffee.com/soumendudas')
    }
  }
];

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      devTools: false //Also remember to close devTools on window.resize so that no hacker can penetrate.
    },
    minWidth: 850,
    minHeight: 700,
    fullscreen: true,
    darkTheme: true,
    icon: path.join(__dirname, 'assets/logo.png')
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.closeDevTools();

  mainWindow.show();
};

// Create Menu from template
const menu = Menu.buildFromTemplate(templateMenu);
Menu.setApplicationMenu(menu);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
