const languageSelect = document.getElementById("language");
const iconUploader = document.getElementById("iconUploader");
const addButtonBtn = document.getElementById("addButtonBtn");

window.addEventListener('load', () => {
  fetch('/clean-uploads', {
    method: 'POST'
  })
  .then(res => res.json())
  .then(data => console.log(data.mensaje))
  .catch(err => console.error('Error cleaning uploads:', err));
});

document.addEventListener("DOMContentLoaded", () => {
  Object.keys(languages).forEach((code) => {
    let option = document.createElement("option");
    option.value = code;
    option.textContent = languages[code];
    //add translate="no"
    option.setAttribute("translate", "no");

    languageSelect.appendChild(option);
  });

  iconUploader.addEventListener("change", function () {
    const preview = document.getElementById("iconPreview");
    addButtonBtn.disabled = !this.files[0];
    preview.innerHTML = "";

    if (this.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        currentIconData = e.target.result.split(",")[1];
        const img = document.createElement("img");
        img.src = e.target.result;
        img.alt = "Icon preview";
        img.style.width = "250px";
        img.style.height = "250px";
        img.style.borderRadius = "8px";
        img.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
        preview.innerHTML = "";
        preview.appendChild(img);
      };
      reader.readAsDataURL(this.files[0]);
    }
  });

  document
    .getElementById("buttonModal")
    .addEventListener("click", function (e) {
      if (e.target === this) closeModal();
    });
  document
    .getElementById("configModal")
    .addEventListener("click", function (e) {
      if (e.target === this) closeModal();
    });

  window.addEventListener("beforeunload", function (event) {
    if (layoutData.buttons.length > 0) {
      event.preventDefault();
      event.returnValue = "Changes unsaved will be lost.";
    }
  });

  updateMockup();
  renderButtonList();
});