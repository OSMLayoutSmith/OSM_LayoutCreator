(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory(
            global.XMLFile,
            global.Layout,
            global.Button,
            global.Metadata,
            global.ZipBuilder,
            global.ZipLoader
        );
        global.FolderManager = module.exports.FolderManager;
    } else {
        root.FolderManager = factory(
            root.XMLFile,
            root.Layout,
            root.Button,
            root.Metadata,
            root.ZipBuilder,
            root.ZipLoader
        ).FolderManager;
    }
}(typeof self !== "undefined" ? self : this, function (XMLFile, Layout, Button, Metadata, ZipBuilder, ZipLoader) {

    class FolderManager {
        constructor() {
            this.layouts = {};
            this.activeLayout = null;
        }

        createLayout(name, author = "Unknown", repo = "", branch = "master") {
            if (this.layouts[name]) throw new Error(`Layout "${name}" already exists`);
            const xmlFile = new XMLFile();
            const rootLayout = new Layout("root");
            xmlFile.addLayout(rootLayout);
            const metadata = new Metadata(name, author, repo, branch);
            this.layouts[name] = { xmlFile, metadata, readme: "", icons: {} };
            this.activeLayout = name;
            return name;
        }

        changeReadme(name="", content) {
            if(name === "") {
                if (!this.activeLayout) throw new Error("No active layout set");
                name = this.activeLayout;
            }
            if (!this.layouts[name]) throw new Error(`Layout "${name}" not found`);
            this.layouts[name].readme = content;
        }

        renameLayout(oldName, newName) {
            if (!this.layouts[oldName]) {
                throw new Error(`Layout "${oldName}" not found`);
            }
            if (this.layouts[newName]) {
                throw new Error(`Layout "${newName}" already exists`);
            }

            this.layouts[newName] = this.layouts[oldName];
            delete this.layouts[oldName];

            this.layouts[newName].xmlFile.updateFolder(newName);

            if (this.layouts[newName].metadata) {
                this.layouts[newName].metadata.setLayoutName(newName);
            }

            if (this.activeLayout === oldName) {
                this.activeLayout = newName;
            }

            return newName;
        }

        async importFromZipFile(filePath) {
            const loader = new ZipLoader();
            const layout = await loader.loadFromFile(filePath);
            this.layouts[layout.name] = layout;
            if (!this.activeLayout) this.activeLayout = layout.name;
            return layout.name;
        }

        async importFromZipBuffer(buffer) {
            const loader = new ZipLoader();
            const layout = await loader.loadFromFile(buffer);
            this.layouts[layout.name] = layout;
            if (!this.activeLayout) this.activeLayout = layout.name;
            return layout.name;
        }

        addLanguage(layoutName, lang) {
            this.getLayout(layoutName).xmlFile.addLanguage(lang);
        }

        addButton(layoutName, originLayout, type, labels, icon, targetLayout = "#", iconBase64 = null) {
            const layoutObj = this.getLayout(layoutName);
            const btn = new Button(layoutName, originLayout, type, labels, icon, targetLayout);
            if (iconBase64) btn.data = iconBase64;
            layoutObj.xmlFile.newButton(btn);
            layoutObj.icons[icon] = iconBase64 || "";
        }

        addLayoutPage(layoutName, pageName) {
            const xmlFile = this.getLayout(layoutName).xmlFile;
            const layout = new Layout(pageName);
            xmlFile.addLayout(layout);
            return layout;
        }

        setReadme(name, content) { this.getLayout(name).readme = content; }
        setMetadata(name, metadata) { this.getLayout(name).metadata = metadata; }
        setIcons(name, icons) { this.getLayout(name).icons = icons; }
        setXMLFile(name, xmlFile) { this.getLayout(name).xmlFile = xmlFile; }

        /** ===== Export ===== **/
        async exportToZip(name, outputFilePath = null) {
            const layout = this.getLayout(name);
            const builder = new ZipBuilder(layout);

            const isNode = (typeof window === "undefined");

            const buffer = await builder.generate(name, isNode ? "nodebuffer" : "blob");

            if (isNode && outputFilePath) {
                require("fs").writeFileSync(outputFilePath, buffer);
            }
            return buffer;
        }

        getLayout(name) {
            if (!this.layouts[name]) throw new Error(`Layout "${name}" not found`);
            return this.layouts[name];
        }

        setActiveLayout(name) {
            if (!this.layouts[name]) throw new Error(`Layout "${name}" not found`);
            this.activeLayout = name;
        }

        getActiveLayout() { return this.layouts[this.activeLayout] || null; }
        listLayouts() { return Object.keys(this.layouts); }
        deleteLayout(name) {
            delete this.layouts[name];
            if (this.activeLayout === name) {
                this.activeLayout = Object.keys(this.layouts)[0] || null;
            }
        }

        toString() {
            let output = "layouts/\n";
            for (const name of Object.keys(this.layouts)) {
                const l = this.layouts[name];
                output += `  ${name}/\n`;
                output += `    ${name}_icons/\n`;
                for (const icon of Object.keys(l.icons)) output += `      ${icon}\n`;
                for (const lang of l.xmlFile.getLanguages()) output += `    ${lang}.xml\n`;
                output += "    README.md\n";
            }
            output += "metadata/\n";
            for (const name of Object.keys(this.layouts)) {
                output += `  ${name}.xml\n`;
            }
            return output;
        }
    }

    return { FolderManager };
}));
