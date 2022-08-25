const { app, BrowserWindow, ipcMain } = require("electron");

let appWindow;
let isAlwaysOnTop = false;

function createWindow() {
  appWindow = new BrowserWindow({
    width: 850,
    height: 600,
    minWidth: 850,
    minHeight: 600,
    // mac title menu
    titleBarStyle: "hiddenInset",
    transparent: true,
    autoHideMenuBar: false,
    frame: false,
    vibrancy: "sidebar",
    visualEffectState: "followWindow",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  if (process.argv.indexOf("--port") > -1) {
    const portIndex = process.argv.indexOf("--port") + 1;
    const port = process.argv[portIndex];
    appWindow.webContents.openDevTools({ mode: "bottom" });
    process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
    appWindow.loadURL(`http://localhost:${port}`);
  } else {
    appWindow.loadFile("./dist/index.html");
  }

  ipcMain.handle("window", async (event, arg) => {
    switch (arg) {
      case "minimize":
        appWindow.minimize();
        appWindow.webContents.send("window", "minimize");
        break;
      case "maximize":
        appWindow.maximize();
        appWindow.webContents.send("window", "maximize");
        break;
      case "unmaximize":
        appWindow.unmaximize();
        appWindow.webContents.send("window", "unmaximize");
        break;
      case "affix":
        isAlwaysOnTop = !isAlwaysOnTop;
        appWindow.setAlwaysOnTop(isAlwaysOnTop);
        appWindow.webContents.send("window", isAlwaysOnTop ? "affixed" : "unaffix");
        break;
      case "close":
        appWindow.close();
        break;
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });
});
