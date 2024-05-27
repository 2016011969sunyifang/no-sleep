const { autoUpdater } = require("electron-updater");

var mainWin = null;
const log = require("electron-log");
const checkUpdate = (win, ipcMain) => {
  autoUpdater.autoDownload = true; // 自动下载
  autoUpdater.autoInstallOnAppQuit = true; // 应用退出后自动安装
  mainWin = win;
  log.info("c!", "开始检查");
  // 检测是否有更新包并通知
  autoUpdater
    .checkForUpdatesAndNotify()
    .catch((err) => {
      log.info("error!", err);
    })
    .then((res) => {
      log.info("res", res);
    });
  // 监听渲染进程的 install 事件，触发退出应用并安装
  ipcMain.handle("install", () => autoUpdater.quitAndInstall());
};
autoUpdater.on("error", (info) => {
  log.info("error!", info);
});
autoUpdater.on("update-available", (info) => {
  log.info("需要更新!");
});
autoUpdater.on("update-not-available", (info) => {
  log.info("无需更新!");
});
autoUpdater.on("download-progress", (prog) => {
  log.info("downing!");
  mainWin.webContents.send("update", {
    speed: Math.ceil(prog.bytesPerSecond / 1000), // 网速
    percent: Math.ceil(prog.percent), // 百分比
  });
});
autoUpdater.on("update-downloaded", (info) => {
  log.info("update");
  mainWin.webContents.send("downloaded");
  // 下载完成后强制用户安装，不推荐
  // autoUpdater.quitAndInstall();
});
module.exports = checkUpdate;
