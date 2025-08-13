(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
        global.Button = module.exports.Button;
    } else {
        root.Button = factory().Button;
    }
}(typeof self !== "undefined" ? self : this, function () {

    class Button {
        constructor(folder, origin, type, labels = {}, icon, targetLayout = "#") {
            this.folder = folder;
            this.origin = origin;
            this.type = type;
            this.labels = labels;
            this.icon = icon;
            this.targetLayout = type === "page" ? targetLayout : "#";
        }

        addLabel(lang, label) { this.labels[lang] = label; }
        setIcon(icon) { this.icon = icon; }
        setTargetLayout(targetLayout) { if (this.type === "page") this.targetLayout = targetLayout; }

        toString(lang = "en") {
            const label = this.labels[lang] || "";
            if (this.type === "page") {
                return `      <button type="page" label="${label}" icon="${this.folder}_icons/${this.icon}" targetLayout="${this.targetLayout}"/>\n`;
            }
            return `      <button type="${this.type}" label="${label}" icon="${this.folder}_icons/${this.icon}"/>\n`;
        }
    }

    return { Button };
}));
