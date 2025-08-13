(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory(
            global.XMLFile,
            global.Metadata
        );
        global.FolderManager = module.exports.FolderManager;
    } else {
        root.FolderManager = factory(
            root.XMLFile,
            root.Metadata
        ).FolderManager;
    }
}(typeof self !== "undefined" ? self : this, function (XMLFile, Metadata) {

    class FolderManager {
        constructor() {
            this.layouts = {};
            this.activeLayout = null;
        }

        createLayout(name) {
            if (this.layouts[name]) throw new Error(`Layout "${name}" already exists`);
            this.layouts[name] = {
                xmlFile: new XMLFile(),
                metadata: new Metadata(),
                readme: "",
                icons: {}
            };
            this.activeLayout = name;
        }

        addLayout(name, xmlFile, metadata, readme, icons) {
            this.layouts[name] = {
                xmlFile: xmlFile || new XMLFile(),
                metadata: metadata || new Metadata(),
                readme: readme || "",
                icons: icons || {}
            };
            if (!this.activeLayout) this.activeLayout = name;
        }

        deleteLayout(name) {
            if (!this.layouts[name]) return;
            delete this.layouts[name];
            if (this.activeLayout === name) {
                this.activeLayout = Object.keys(this.layouts)[0] || null;
            }
        }

        listLayouts() {
            return Object.keys(this.layouts);
        }

        setActiveLayout(name) {
            if (!this.layouts[name]) throw new Error(`Layout "${name}" not found`);
            this.activeLayout = name;
        }

        getActiveLayout() {
            if (!this.activeLayout) return null;
            return this.layouts[this.activeLayout];
        }

        getLayout(name) {
            return this.layouts[name] || null;
        }

        setReadme(name, content) {
            if (!this.layouts[name]) throw new Error(`Layout "${name}" not found`);
            this.layouts[name].readme = content;
        }

        setMetadata(name, metadata) {
            if (!this.layouts[name]) throw new Error(`Layout "${name}" not found`);
            this.layouts[name].metadata = metadata;
        }

        setIcons(name, icons) {
            if (!this.layouts[name]) throw new Error(`Layout "${name}" not found`);
            this.layouts[name].icons = icons;
        }

        setXMLFile(name, xmlFile) {
            if (!this.layouts[name]) throw new Error(`Layout "${name}" not found`);
            this.layouts[name].xmlFile = xmlFile;
        }

        toString() {
            let output = "";
            output += "layouts/\n";
            for (const layoutName of Object.keys(this.layouts)) {
                const layout = this.layouts[layoutName];
                output += `  ${layoutName}/\n`;
                output += `    ${layoutName}_icons/\n`;
                for (const iconName of Object.keys(layout.icons)) {
                    output += `      ${iconName}\n`;
                }
                for (const lang of layout.xmlFile.getLanguages()) {
                    output += `    ${lang}.xml\n`;
                }
                output += `    README.md\n`;
            }
            output += "metadata/\n";
            for (const layoutName of Object.keys(this.layouts)) {
                output += `  ${layoutName}.xml\n`;
            }
            return output;
        }
    }

    return { FolderManager };
}));
