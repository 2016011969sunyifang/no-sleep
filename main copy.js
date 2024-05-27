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
let win; // 提升 `win` 变量
let id = null; // 添加这一行

const createWindow = () => {
  win = new BrowserWindow({
    width: 400,
    height: 300,
    backgroundColor: "#00FFFFFF", // 设置背景颜色为透明
    transparent: true, // 设置为透明窗口
    frame: false, // 无边框窗口
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
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
      label: "开启夜猫模式",
      type: "radio",
      click: () => {
        if (id !== null) {
          powerSaveBlocker.stop(id);
        }
        id = powerSaveBlocker.start("prevent-display-sleep");
        console.log(
          "夜猫不睡觉模式已开启，powerSaveBlocker的状态：",
          powerSaveBlocker.isStarted(id)
        );
      },
    },
    {
      label: "开启懒猪模式",
      type: "radio",
      click: () => {
        if (id !== null) {
          powerSaveBlocker.stop(id);
          console.log(
            "懒猪模式已开启，powerSaveBlocker的状态：",
            powerSaveBlocker.isStarted(id)
          );
          id = null;
        }
      },
    },
    { type: "separator" },
    {
      label: "退出",
      click: () => {
        if (id !== null) {
          powerSaveBlocker.stop(id);
        }
        app.quit();
      },
    },
  ]);
  tray.setToolTip("This is my application.");
  tray.setContextMenu(contextMenu);
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

app.on("will-quit", () => {
  if (id !== null) {
    powerSaveBlocker.stop(id);
  }
});
