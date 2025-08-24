require("./core-globals.js");
const fs = require("fs");
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

    // Etiquetas multiidioma para 5 botones
    const i18n = {
        ru: ["Один", "Два", "Три", "Четыре", "Пять"],
        ja: ["一", "二", "三", "四", "五"],
        ar: ["واحد", "اثنان", "ثلاثة", "أربعة", "خمسة"],
        "zh-CN": ["一", "二", "三", "四", "五"]
    };

    // Íconos ficticios base64 (truncados)
    const iconsBase64 = {};
    for (let i = 1; i <= 5; i++) {
        iconsBase64[`icon${i}.png`] = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB"; // ejemplo
    }

    // Añadir botones al layout root
    for (let i = 0; i < 5; i++) {
        const labels = {};
        langs.forEach(lang => labels[lang] = i18n[lang][i]);
        const iconName = `icon${i + 1}.png`;
        fm.addButton(layoutName, "root", "tag", labels, iconName, "#", iconsBase64[iconName]);
    }

    // ===== 2️⃣ Mover botones de forma aleatoria =====
    const xmlFile = fm.getLayout(layoutName).xmlFile;
    const rootLayout = xmlFile.layouts["root"];
    for (let i = 0; i < 3; i++) {
        const fromIndex = Math.floor(Math.random() * rootLayout.buttons.length);
        const toIndex = Math.floor(Math.random() * rootLayout.buttons.length);
        rootLayout.moveButton(fromIndex, toIndex);
    }

    // ===== 3️⃣ Exportar layout a ZIP =====
    //await fm.exportToZip(layoutName, `${layoutName}.zip`);
    //console.log(`✅ ${layoutName}.zip generado`);

    // ===== 4️⃣ Importar Hydranten.zip =====
    await fm.importFromZipFile("Hydranten.zip");
    console.log("✅ Hydranten.zip importado");

    // ===== 5️⃣ Mostrar disposición final =====
    console.log("\n📂 Estructura en FolderManager:");
    console.log(fm.toString());
    console.log("\n📝 XML del layout importado:")
    console.log(fm.getLayout("Hydranten").xmlFile.toString("de"));
    //metadata
    console.log("\n📝 Metadata del layout importado:")
    console.log(fm.getLayout("Hydranten").metadata.toString());
})();
