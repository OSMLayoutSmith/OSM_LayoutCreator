require("./core-globals.js");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const { FolderManager } = require("../core/folder-manager.js");

(async () => {
    const fm = new FolderManager();

    // ===== 1️⃣ Crear layout nuevo =====
    const layoutName = "pruebaFinal";
    fm.createLayout(layoutName, "UserBot", "osmtracker-layouts", "master");

    // Idiomas no latinos
    const langsMap = {
        ru: "Русский",
        ja: "日本語",
        ar: "العربية",
        "zh-CN": "中文 (简体)"
    };
    const langs = Object.keys(langsMap);
    langs.forEach(lang => fm.addLanguage(layoutName, lang));

    // Etiquetas multiidioma
    const i18n = {
        ru: ["Один", "Два", "Три", "Четыре", "Пять"],
        ja: ["一", "二", "三", "四", "五"],
        ar: ["واحد", "اثنان", "ثلاثة", "أربعة", "خمسة"],
        "zh-CN": ["一", "二", "三", "四", "五"]
    };

    // Íconos ficticios
    const iconsBase64 = {};
    for (let i = 1; i <= 5; i++) {
        iconsBase64[`icon${i}.png`] = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB"; // base64 truncado
    }

    // Añadir botones
    for (let i = 0; i < 5; i++) {
        const labels = {};
        langs.forEach(lang => labels[lang] = i18n[lang][i]);
        const iconName = `icon${i + 1}.png`;
        fm.addButton(layoutName, "root", "tag", labels, iconName, "#", iconsBase64[iconName]);
    }

    // ===== 2️⃣ Mover botones aleatoriamente =====
    const xmlFile = fm.getLayout(layoutName).xmlFile;
    const rootLayout = xmlFile.layouts["root"];
    for (let i = 0; i < 3; i++) {
        const fromIndex = Math.floor(Math.random() * rootLayout.buttons.length);
        const toIndex = Math.floor(Math.random() * rootLayout.buttons.length);
        rootLayout.moveButton(fromIndex, toIndex);
    }
    const metadataObj = fm.getLayout(layoutName).metadata;
    langs.forEach(lang => {
        metadataObj.addOption(lang, langsMap[lang], `Descripción en ${langsMap[lang]}`);
    });

    // ===== 3️⃣ Exportar a ZIP =====
    const zipPath = `${layoutName}.zip`;
    await fm.exportToZip(layoutName, zipPath);
    console.log(`✅ ${zipPath} generado`);

    // ===== 4️⃣ Subir ZIP al endpoint =====
    const form = new FormData();
    form.append("zipfile", fs.createReadStream(zipPath));

    try {
        const uploadResp = await axios.post(
            "https://osmbackend-production.up.railway.app/api/upload-zip",
            form,
            { headers: form.getHeaders() }
        );
        console.log("📤 Respuesta de subida:", uploadResp.data);
    } catch (err) {
        console.error("❌ Error subiendo ZIP:", err.response?.data || err.message);
    }

    // ===== 5️⃣ Descargar Hydranten desde API =====
    try {
        const dlResp = await axios.post(
            "https://osmbackend-production.up.railway.app/api/download",
            {
                mode: "si",
                name: "Hydranten",
                repo: "osmtracker-android-layouts",
                owner: "Kevin-Salazar-itcr",
                branch: "prueba"
            },
            { responseType: "arraybuffer" }
        );

        await fm.importFromZipBuffer(Buffer.from(dlResp.data));
        console.log("✅ Hydranten.zip importado desde API");
    } catch (err) {
        console.error("❌ Error descargando Hydranten:", err.response?.data || err.message);
    }

    // ===== 6️⃣ Mostrar disposición final =====
    console.log("\n📂 Estructura en FolderManager:");
    console.log(fm.toString());
})();
