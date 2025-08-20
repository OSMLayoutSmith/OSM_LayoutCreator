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


const input = document.getElementById("iconUploader");
const preview = document.getElementById("iconPreview");

input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = function () {
        if (img.width > 500 || img.height > 500) {
            alert("Image selected must be max 500x500 px.");
            input.value = ""; 
            preview.innerHTML = ""; 
            const addButton = document.getElementById("addButtonBtn");
            addButton.disabled = true;
        }
        URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
});