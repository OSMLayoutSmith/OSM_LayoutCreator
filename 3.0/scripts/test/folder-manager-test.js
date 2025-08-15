require("./core-globals.js");
const { FolderManager } = require("../core/folder-manager.js");

const fm = new FolderManager();

fm.createLayout("MyLayout");
fm.setIcons("MyLayout", {
    "icon1.png": "BASE64DATA1",
    "icon2.png": "BASE64DATA2"
});
fm.getActiveLayout().xmlFile.addLanguage("en");
fm.getActiveLayout().xmlFile.addLanguage("es");

fm.createLayout("OtherLayout");
fm.setIcons("OtherLayout", { "iconA.png": "DATA" });
fm.getActiveLayout().xmlFile.addLanguage("en");
console.log(fm.getActiveLayout().xmlFile.toString());

console.log(fm.toString());
