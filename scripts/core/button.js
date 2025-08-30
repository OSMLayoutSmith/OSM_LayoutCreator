(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
        global.Button = module.exports.Button;
    } else {
        root.Button = factory().Button;
    }
}(typeof self !== "undefined" ? self : this, function () {

    class Button {
        constructor(folder = "", origin = "", type = "", labels = {}, icon = "", targetlayout = "#") {
            this.folder = folder;
            this.origin = origin;
            this.type = type;
            this.labels = labels;
            this.icon = icon;
            this.targetlayout = type === "page" ? targetlayout : "#";
        }
        setType(type) { this.type = type; }
        setOrigin(origin) { this.origin = origin; }
        setFolder(folder) { this.folder = folder; }
        addLabel(lang, label) { this.labels[lang] = label; }
        setIcon(icon) { this.icon = icon; }
        setTargetLayout(targetlayout) { if (this.type === "page") this.targetlayout = targetlayout; }

        toString(lang = "en") {
            const label = this.labels[lang] || ""; // label may be different for each language
            //default icons
            if (this.type === "voicerec" || this.type === "picture" || this.type === "textnote") {
                return `        <button type="${this.type}" icon="${this.icon!==""?this.icon:"#"}"/>\n`;
            }
            //page buttons
            if (this.type === "page") {
                return `        <button type="page" label="${label}" icon="${this.folder}_icons/${this.icon!==""?this.icon:"#"}" targetlayout="${this.targetlayout}"/>\n`;
            }
            //default buttons
            return `        <button type="${this.type}" label="${label}" icon="${this.folder}_icons/${this.icon!==""?this.icon:"#"}"/>\n`;
        }
    }

    return { Button };
}));
