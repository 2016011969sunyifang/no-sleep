const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke("ping"),
  toInstall: () => ipcRenderer.invoke("install"),
  onUpdate: (callback) => ipcRenderer.on("update", callback),
  onDownloaded: (callback) => ipcRenderer.on("downloaded", callback),
  // 除函数之外，我们也可以暴露变量
});
