require("./core-globals.js");
const fs = require("fs");
const { FolderManager } = require("../core/folder-manager.js");
const { ZipBuilder } = require("../core/zip-builder.js");
const { ZipLoader } = require("../core/zip-loader.js");

// ===== 1️⃣ Crear layout nuevo con 4 idiomas =====
const langsMap = { en: "English", es: "Español", fr: "Français", de: "Deutsch" };
const langs = Object.keys(langsMap);

// Traducciones ficticias
const i18n = {
    en: { one: "One", two: "Two" },
    es: { one: "Uno", two: "Dos" },
    fr: { one: "Un", two: "Deux" },
    de: { one: "Eins", two: "Zwei" }
};

const xml = new XMLFile();
const rootLayout = new Layout("root");
xml.addLayout(rootLayout);

// Registrar idiomas
langs.forEach(lang => xml.addLanguage(lang));

// Función para agregar labels a un botón
const addAllLabels = (btn, key) => langs.forEach(lang => btn.addLabel(lang, i18n[lang][key]));

// Botones
["one", "two"].forEach((key, idx) => {
    const btn = new Button("layoutTest", "root", "tag", { en: i18n.en[key] }, `icon${idx + 1}.png`);
    addAllLabels(btn, key);
    xml.newButton(btn);
});

// Metadata multiidioma
const metadata = new Metadata("layoutTest", "UserBot", "osmtracker-layouts", "master");
langs.forEach(lang => {
    metadata.addOption(lang, langsMap[lang], `Description in ${langsMap[lang]}`);
});

// Íconos ficticios
const icons = {
    "icon1.png": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
    "icon2.png": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB"
};

// Generar ZIP
(async () => {
    const builder = new ZipBuilder({ xmlFile: xml, metadata, readme: "# layoutTest\n\nDescripción", icons });
    const buffer = await builder.generate("layoutTest");
    fs.writeFileSync("layoutTest.zip", buffer);
    console.log("✅ layoutTest.zip generado");

    // ===== 2️⃣ Cargar layout existente Hydranten.zip =====
    const loader = new ZipLoader();
    const fm = new FolderManager();

    // Cargar el que acabamos de crear
    const layout1 = await loader.loadFromFile("layoutTest.zip");
    console.log("✅ layoutTest layout cargado");
    console.log(`Nombre del layout: ${layout1.name}`);
    console.log(`Número de idiomas: ${layout1.xmlFile.getLanguages().length}`);
    console.log(`Metadata: ${layout1.metadata.toString()}`);
    console.log(`README: ${layout1.readme}`);
    console.log(`Número de íconos: ${Object.keys(layout1.icons).length}`);
    fm.addLayout(layout1.name, layout1.xmlFile, layout1.metadata, layout1.readme, layout1.icons);

    // Cargar Hydranten.zip
    const layout2 = await loader.loadFromFile("Hydranten.zip");
    console.log("✅ Hydranten layout cargado");
    console.log(`Nombre del layout: ${layout2.name}`);
    console.log(`Número de idiomas: ${layout2.xmlFile.getLanguages().length}`);
    console.log(`Metadata: ${layout2.metadata.toString()}`);
    console.log(`README: ${layout2.readme}`);
    console.log(`Número de íconos: ${Object.keys(layout2.icons).length}`);
    // Agregar a FolderManager
    fm.addLayout(layout2.name, layout2.xmlFile, layout2.metadata, layout2.readme, layout2.icons);

    // ===== 3️⃣ Mostrar en consola las disposiciones =====
    console.log("\n📂 Estructura en FolderManager:");
    console.log(fm.toString());

    // ===== 4️⃣ Opcional: exportar Hydranten de nuevo =====
    const builderHydranten = new ZipBuilder(fm.getLayout("Hydranten"));
    const bufferHydranten = await builderHydranten.generate("Hydranten");
    fs.writeFileSync("Hydranten_exported.zip", bufferHydranten);
    console.log("✅ Hydranten_exported.zip generado");
})();
