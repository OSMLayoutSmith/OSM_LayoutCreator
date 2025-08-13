(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
        global.XMLFile = module.exports.XMLFile;
    } else {
        root.XMLFile = factory().XMLFile;
    }
}(typeof self !== "undefined" ? self : this, function () {

    class XMLFile {
        constructor() { this.layouts = {}; this.languajes = []; }
        addLayout(layout) { this.layouts[layout.name] = layout; }
        removeLayout(name) { delete this.layouts[name]; }
        newButton(button) { this.layouts[button.origin]?.addButton(button); }
        moveButton(fromLayout, fromIndex, toLayout) {
            const fl = this.layouts[fromLayout], tl = this.layouts[toLayout];
            if (fl && tl) {
                const btn = fl.removeButton(fromIndex);
                if (btn) { btn.origin = toLayout; tl.addButton(btn); }
            }
        }
        addLanguage(lang) { if (!this.languajes.includes(lang)) { this.languajes.push(lang); } }
        removeLanguage(lang) { this.languajes = this.languajes.filter(l => l !== lang); }
        getLanguages() { return this.languajes; }
        toString(lang = "en") {
            if (!this.languajes.includes(lang)) { return "Nullable"; }
            return `<?xml version="1.0" encoding="UTF-8"?>\n<layouts>\n${Object.values(this.layouts).map(l => l.toString(lang)).join("")}</layouts>`;
        }
    }

    return { XMLFile };
}));
