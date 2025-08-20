(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory(require("jszip"));
        global.ZipBuilder = module.exports.ZipBuilder;
    } else {
        root.ZipBuilder = factory(JSZip).ZipBuilder;
    }
}(typeof self !== "undefined" ? self : this, function (JSZip) {

    class ZipBuilder {
        constructor(activeLayoutObj) {
            if (!activeLayoutObj) throw new Error("No layout data provided");
            this.xmlFile = activeLayoutObj.xmlFile;
            this.metadata = activeLayoutObj.metadata;
            this.readme = activeLayoutObj.readme || "";
            this.icons = activeLayoutObj.icons || {};
        }

        async generate(layoutName) {
            const zip = new JSZip();
            const layoutFolder = zip.folder(layoutName);
            const iconsFolder = layoutFolder.folder(`${layoutName}_icons`);

            // Archivos XML por idioma
            const languages = this.xmlFile.getLanguages();
            if (languages.length === 0) {
                throw new Error("No languages found in XMLFile");
            }
            for (const langCode of languages) {
                const xmlContent = this.xmlFile.toString(langCode);
                if (xmlContent && xmlContent !== "Nullable") {
                    layoutFolder.file(`${langCode}.xml`, xmlContent);
                }
            }

            // Metadata
            zip.folder("metadata").file(`${layoutName}.xml`, this.metadata.toString());

            // README
            layoutFolder.file("README.md", this.readme);

            // Iconos
            for (const [fileName, base64] of Object.entries(this.icons)) {
                iconsFolder.file(fileName, base64, { base64: true });
            }

            return zip.generateAsync({ type: "blob" });
        }
    }

    return { ZipBuilder };
}));
