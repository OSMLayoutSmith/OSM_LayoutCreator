require("./core-globals.js");
const fs = require("fs");

// i18n
const i18n = {
    en: { alpha:"alpha", beta:"beta", gamma:"gamma", delta:"delta", one:"one", two:"two", three:"three", four:"four" },
    es: { alpha:"alfa", beta:"beta", gamma:"gamma", delta:"delta", one:"uno", two:"dos", three:"tres", four:"cuatro" },
    ru: { alpha:"альфа", beta:"бета", gamma:"гамма", delta:"дельта", one:"один", two:"два", three:"три", four:"четыре" },
    zh: { alpha:"阿尔法", beta:"贝塔", gamma:"伽马", delta:"德尔塔", one:"一", two:"二", three:"三", four:"四" },
    ja: { alpha:"アルファ", beta:"ベータ", gamma:"ガンマ", delta:"デルタ", one:"一", two:"二", three:"三", four:"四" }
};
const langsMap = { en: "English", es: "Español", ru: "Русский", zh: "中文", ja: "日本語" };
const langs = Object.keys(i18n);
const addAllLabels = (btn, key) => langs.forEach(lang => btn.addLabel(lang, i18n[lang][key]));

// Crear XML base
const xml = new XMLFile();
const root = new Layout("root");
const L2 = new Layout("L2");
const L3 = new Layout("L3");
xml.addLayout(root);
xml.addLayout(L2);
xml.addLayout(L3);

// Registrar idiomas en XMLFile
langs.forEach(lang => xml.addLanguage(lang));

// Botones root
[
    { folder:"myLayout", parent:"root", type:"tag", key:"alpha", icon:"icon1.png" },
    { folder:"myLayout", parent:"root", type:"tag", key:"beta", icon:"icon2.png" },
    { folder:"myLayout", parent:"root", type:"page", key:"gamma", icon:"icon3.png", goto:"L2" },
    { folder:"myLayout", parent:"root", type:"page", key:"delta", icon:"icon4.png", goto:"L3" }
].forEach(cfg => {
    const b = new Button(cfg.folder, cfg.parent, cfg.type, { en: i18n.en[cfg.key] }, cfg.icon, cfg.goto);
    addAllLabels(b, cfg.key);
    xml.newButton(b);
});

// Botones L2 y L3
["one", "two"].forEach(key => {
    const b = new Button("myLayout", "L2", "tag", { en: i18n.en[key] }, "icon5.png");
    addAllLabels(b, key);
    xml.newButton(b);
});
["three", "four"].forEach(key => {
    const b = new Button("myLayout", "L3", "tag", { en: i18n.en[key] }, "icon6.png");
    addAllLabels(b, key);
    xml.newButton(b);
});

// Validaciones CRUD
console.log("Antes de mover:\n", xml.toString("en"));
xml.moveButton("root", 0, "L2");
console.log("Después de mover:\n", xml.toString("en"));
xml.layouts["L2"].moveButton(0, 1);
console.log("L2 reordenado:\n", xml.toString("en"));
xml.layouts["L3"].removeButton(0);
console.log("L3 tras borrado:\n", xml.toString("en"));

// Metadata multi-idioma
const metadata = new Metadata("myLayout", "OSMBot", "osmtracker-android-layouts", "master");
langs.forEach(lang => {
    metadata.addOption(lang, langsMap[lang] || lang, `Description in ${langsMap[lang] || lang}`);
});

// Iconos
const icons = {
    "icon1.png": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
    "icon2.png": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
    "icon3.png": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
    "icon4.png": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
    "icon5.png": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
    "icon6.png": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB"
};

// Generar ZIP multi-idioma
const zipBuilder = new ZipBuilder(xml, metadata, icons);
zipBuilder.generate("myLayout", "description generica para el readme").then(buffer => {
    fs.writeFileSync("myLayout.zip", buffer);
    console.log("ZIP generado: myLayout.zip");
});
