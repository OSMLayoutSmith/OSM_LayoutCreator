class Button {
    constructor(folder, origin, type, labels, icon, targetLayout) {
        this.labels = labels || {};
        this.origin = origin;
        this.folder = folder;
        this.type = type;
        this.icon = icon;
        this.targetLayout = type === "page" ? targetLayout : "#"
    }

    addLabel(lang, label){
        this.labels[lang] = label;
    }

    toString(lang) {
        if (this.type === "page") {
            return `      <button type="${this.type}" label="${this.labels[lang]}" icon="${this.folder}_icons/${this.icon}" targetLayout="${this.targetLayout}"/>\n`;
        }
        return `      <button type="${this.type}" label="${this.labels[lang]}" icon="${this.folder}_icons/${this.icon}"/>\n`;
    }
}

class Layout {
    constructor(name) {
        this.name = name;
        this.buttons = [];
    }

    addButton(button) {
        this.buttons.push(button);
    }

    generateButtons(lang = "en") {
        let result = ``;
        this.buttons.forEach((btn) => {
            result += btn.toString(lang);
        });
        return result;
    }

    toString(lang = "en") {
        return `  <layout name="${this.name}">\n${this.generateButtons(lang)}  </layout>\n`;
    }
}

class XMLFile{
    constructor(){
        this.layouts = {};
    }

    addLayout(layout){
        this.layouts[layout.name]=layout
    }

    newButton(button){
        this.layouts[button.origin].addButton(button);
    }

    generateLayouts(lang = "en"){
        let result = ``;
        for (let layout of Object.values(this.layouts)){
            result += layout.toString(lang);
        }
        return result;
    }

    toString(lang = "en"){
        return `<?xml version="1.0" encoding="UTF-8"?>\n<layouts>\n${this.generateLayouts(lang)}</layouts>`;
    }
}

//ambiente de pruebas, no es parte del módulo
// Helpers de i18n
const i18n = {
  en: { alpha:"alpha", beta:"beta", gamma:"gamma", delta:"delta", one:"one", two:"two", three:"three", four:"four" },
  es: { alpha:"alfa",  beta:"beta", gamma:"gamma", delta:"delta", one:"uno", two:"dos", three:"tres",  four:"cuatro" },
  ru: { alpha:"альфа", beta:"бета", gamma:"гамма", delta:"дельта", one:"один", two:"два", three:"три", four:"четыре" },
  zh: { alpha:"阿尔法", beta:"贝塔", gamma:"伽马", delta:"德尔塔", one:"一", two:"二", three:"三", four:"四" },
  ja: { alpha:"アルファ", beta:"ベータ", gamma:"ガンマ", delta:"デルタ", one:"一", two:"二", three:"三", four:"四" },
};
const langs = Object.keys(i18n);
const addAllLabels = (btn, key) => {
  for (const lang of langs) btn.addLabel(lang, i18n[lang][key]);
};

// --- Escenario de prueba corto ---
const xml = new XMLFile();

// 1) Layout raíz
const root = new Layout("root");
xml.addLayout(root);

// Definición concisa de botones del root (2 tags + 2 pages)
const rootButtons = [
  { parent:"root", type:"tag",  key:"alpha", icon:"icon.jpg", goto:""   },
  { parent:"root", type:"tag",  key:"beta",  icon:"icon.jpg", goto:""   },
  { parent:"root", type:"page", key:"gamma", icon:"icon.jpg", goto:"L2" },
  { parent:"root", type:"page", key:"delta", icon:"icon.jpg", goto:"L3" },
];

for (const cfg of rootButtons) {
  const b = new Button(cfg.parent, cfg.type, { en: i18n.en[cfg.key] }, cfg.icon, cfg.goto);
  addAllLabels(b, cfg.key);
  xml.newButton(b);
}

// 2) Sub-layouts mínimos para probar navegación
const L2 = new Layout("L2");
const L3 = new Layout("L3");
xml.addLayout(L2);
xml.addLayout(L3);

// Botones en L2
for (const key of ["one", "two"]) {
  const b = new Button("L2", "tag", { en: i18n.en[key] }, "icon.jpg", "");
  addAllLabels(b, key);
  xml.newButton(b);
}

// Botones en L3
for (const key of ["three", "four"]) {
  const b = new Button("L3", "tag", { en: i18n.en[key] }, "icon.jpg", "");
  addAllLabels(b, key);
  xml.newButton(b);
}
console.log("\nGenerated XML (en):\n");
console.log(xml.toString());

console.log("\nGenerated XML (es):\n");
console.log(xml.toString("es"));
console.log("\nGenerated XML (ru):\n");
console.log(xml.toString("ru"));
console.log("\nGenerated XML (zh):\n");
console.log(xml.toString("zh"));
console.log("\nGenerated XML (ja):\n");
console.log(xml.toString("ja"));
