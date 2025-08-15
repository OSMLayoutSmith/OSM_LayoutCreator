const axios = require("axios");
require("./core-globals.js");
const { FolderManager } = require("../core/folder-manager.js");

(async () => {
    const fm = new FolderManager();

    // 1️⃣ Llamada al endpoint
    const response = await axios.post(
        "https://osmbackend-production.up.railway.app/api/download",
        {
            mode: "si",
            name: "Hydranten",
            repo: "osmtracker-android-layouts",
            owner: "Kevin-Salazar-itcr",
            branch: "prueba"
        },
        { responseType: "arraybuffer" } // muy importante para ZIP
    );

    // 2️⃣ Cargar ZIP desde el buffer
    const buffer = Buffer.from(response.data);
    await fm.importFromZipBuffer(buffer);

    // 3️⃣ Mostrar lo que se cargó
    console.log(fm.toString());
})();
