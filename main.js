const {
  app,
  Tray,
  Menu,
  BrowserWindow,
  ipcMain,
  ipcRenderer,
} = require("electron/main");
const { powerSaveBlocker } = require("electron");
const log = require("electron-log");
let tray = null;
const checkUpdate = require("./update.js");
const path = require("node:path");
let win;
// 提升 win 变量
const createWindow = () => {
  win = new BrowserWindow({
    width: 400,
    height: 300,
    backgroundColor: "#00FFFFFF",
    // 设置背景颜色为透明 transparent: true,
    // 设置为透明窗口 frame: false,
    // 无边框窗口
    webPreferences: { preload: path.join(__dirname, "preload.js") },
    show: false,
  });

  win.loadFile("index.html");
  checkUpdate(win, ipcMain);
};
app.whenReady().then(() => {
  createWindow();
  ipcMain.handle("ping", () => "pong");
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  const iconPath = path.join(__dirname, "./asset/no-sleep.png");
  //系统托盘配置
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "退出",
      click: () => {
        app.quit();
      },
    },
  ]);
  //
  tray.on("double-click", () => {
    // win.show();
    //
  });
  tray.setToolTip("no-sleep");
  tray.setContextMenu(contextMenu);

  //开机自启动
  app.setLoginItemSettings({
    openAtLogin: true,
    path: app.getPath("exe"),
  });

  //拖拽
  ipcMain.on("drag-start", (event, position) => {
    log.info("drag-start", position);
    win.setBounds({ x: position.x, y: position.y });
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
let id = null;

app.on("ready", () => {
  id = powerSaveBlocker.start("prevent-display-sleep");
  log.info("notSleep!", "记住id：", id);
  console.log(powerSaveBlocker.isStarted(id));
});

app.on("will-quit", () => {
  log.info("notSleep!", "我不睡");
  powerSaveBlocker.stop(id);
});
app.setLoginItemSettings({
  openAtLogin: true,
  path: app.getPath("exe"),
});
