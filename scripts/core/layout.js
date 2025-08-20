(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
        global.Layout = module.exports.Layout;
    } else {
        root.Layout = factory().Layout;
    }
}(typeof self !== "undefined" ? self : this, function () {

    class Layout {
        constructor(name) { 
            this.name = name; this.buttons = [];        
        }
        setName(newName) { this.name = newName; }
        addButton(button) { this.buttons.push(button); }
        removeButton(index) { return (index >= 0 && index < this.buttons.length) ? this.buttons.splice(index, 1)[0] : null; }
        moveButton(fromIndex, toIndex) {
            if (fromIndex >= 0 && fromIndex < this.buttons.length && toIndex >= 0 && toIndex < this.buttons.length) {
                const [btn] = this.buttons.splice(fromIndex, 1);
                this.buttons.splice(toIndex, 0, btn);
            }
        }
        updateFolder(folder) { this.buttons.forEach(button => button.setFolder(folder)); }
        generateButtons(lang = "en") { return this.buttons.map(b => b.toString(lang)).join(""); }

        toString(lang = "en") {
            if (this.name === "root") {
                let defaults = '      <button type="textnote" icon="text_32x32" />\n      <button type="voicerec" icon="voice_32x32" />\n      <button type="picture" icon="camera_32x32" />\n'
                return `  <layout name="${this.name}">\n${defaults}${this.generateButtons(lang)}  </layout>\n`;
            }
            return `  <layout name="${this.name}">\n${this.generateButtons(lang)}  </layout>\n`;
        }
    }

    return { Layout };
}));
