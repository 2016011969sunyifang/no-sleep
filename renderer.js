const { dialog } = require("electron");

const information = document.getElementById("info");
const func = async () => {
  const response = await window.versions.ping();
  information.innerText = response;
};

func();
var update_info = null; // 更新信息

window.elecAPI.onUpdate((_event, info) => {
  console.log(info, "info");
  dialog.showMessageBox({
    type: "info",
    buttons: [],
    title: "Alert",
    message: info,
  });
});
window.elecAPI.onDownloaded(() => {
  update_info = null;
  let res = confirm("新版本已下载，是否立即安装？");
  if (res) {
    window.elecAPI.toInstall();
  }
});
