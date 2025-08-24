const input1 = document.getElementById("layoutName");
let layoutName = "default_layout";
input1.addEventListener("focus", (event) => {
    valorAnterior = event.target.value;
    layoutName = event.target.value === "" ? "default_layout" : event.target.value;
});
input1.addEventListener("input", (event) => {
    window.folderManager.renameLayout(layoutName, event.target.value);
    layoutName = event.target.value === "" ? "default_layout" : event.target.value;
    console.log(window.folderManager.toString());
});
