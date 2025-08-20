const input = document.getElementById("layoutName");
// Se dispara en cada tecla presionada o cambio inmediato
let layoutName = "default_layout";
input.addEventListener("focus", (event) => {
    valorAnterior = event.target.value;
    layoutName = event.target.value === "" ? "default_layout" : event.target.value;
});
input.addEventListener("input", (event) => {
    window.folderManager.renameLayout(layoutName, event.target.value);
    layoutName = event.target.value === "" ? "default_layout" : event.target.value;
    console.log(window.folderManager.toString());
});