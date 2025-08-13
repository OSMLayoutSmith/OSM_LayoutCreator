(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory(
            require("jszip"),
            require("fs"),
            require("path"),
            global.XMLFile,
            global.Layout,
            global.Button,
            global.Metadata
        );
        global.ZipLoader = module.exports.ZipLoader;
    } else {
        root.ZipLoader = factory(
            JSZip,
            null,
            null,
            root.XMLFile,
            root.Layout,
            root.Button,
            root.Metadata
        ).ZipLoader;
    }
}(typeof self !== "undefined" ? self : this, function (JSZip, fs, path, XMLFile, Layout, Button, Metadata) {

    class ZipLoader {
        async loadFromFile(filePathOrBuffer) {
            let data;
            if (typeof Buffer !== "undefined" && Buffer.isBuffer(filePathOrBuffer)) {
                data = filePathOrBuffer;
            } else if (fs && fs.existsSync && typeof filePathOrBuffer === "string") {
                data = fs.readFileSync(filePathOrBuffer);
            } else {
                throw new Error("Invalid input: must be a Buffer or file path (Node), or Blob/ArrayBuffer (browser)");
            }

            const zip = await JSZip.loadAsync(data);

            // Detectar nombre base del layout
            const metadataEntry = Object.keys(zip.files).find(name =>
                name.startsWith("metadata/") && name.endsWith(".xml")
            );
            if (!metadataEntry) throw new Error("metadata.xml not found in ZIP");

            const layoutName = metadataEntry.replace("metadata/", "").replace(".xml", "");

            // Parsear metadata.xml
            const metadataStr = await zip.file(metadataEntry).async("string");
            const metadataObj = this._parseMetadata(metadataStr);
            const languages = metadataObj.languages;

            // Crear XMLFile y registrar idiomas
            const xmlFile = new XMLFile();
            languages.forEach(lang => xmlFile.addLanguage(lang));

            // Cargar README.md si existe
            let readmeContent = "";
            const readmePath = `${layoutName}/README.md`;
            if (zip.file(readmePath)) {
                readmeContent = await zip.file(readmePath).async("string");
            }

            // Cargar íconos
            const icons = {};
            const iconFolderPrefix = `${layoutName}/${layoutName}_icons/`;
            for (const fileName of Object.keys(zip.files)) {
                if (fileName.startsWith(iconFolderPrefix) && !zip.files[fileName].dir) {
                    const shortName = fileName.replace(iconFolderPrefix, "");
                    icons[shortName] = await zip.file(fileName).async("base64");
                }
            }

            // Procesar XML de cada idioma
            for (const lang of languages) {
                const layoutXmlPath = `${layoutName}/${lang}.xml`;
                if (!zip.file(layoutXmlPath)) continue;

                const layoutStr = await zip.file(layoutXmlPath).async("string");
                await this._parseLayoutXml(layoutStr, xmlFile, lang, zip, layoutName);
            }

            // Devolver estructura para FolderManager
            return {
                name: layoutName,
                xmlFile,
                metadata: metadataObj.metadata,
                readme: readmeContent,
                icons
            };
        }

        _parseMetadata(xmlStr) {
            const languages = [...xmlStr.matchAll(/<option[^>]*\s+iso="([^"]+)"/gi)]
                .map(m => m[1]);
            const metadata = new Metadata();

            // Extraer opciones completas
            const optionRegex = /<option[^>]*\s+iso="([^"]+)"\s+name="([^"]+)">([^<]*)<\/option>/gi;
            let opt;
            while ((opt = optionRegex.exec(xmlStr)) !== null) {
                metadata.addOption(opt[1], opt[2], opt[3].trim());
            }

            // Extraer info de github si existe
            const githubMatch = xmlStr.match(/<github\s+username="([^"]+)"\s+repo="([^"]+)"\s+branch="([^"]+)"\s*\/>/i);
            if (githubMatch) {
                metadata.username = githubMatch[1];
                metadata.repo = githubMatch[2];
                metadata.branch = githubMatch[3];
            }

            return { languages, metadata };
        }

        async _parseLayoutXml(xmlStr, xmlFile, lang, zip, layoutName) {
            const layoutRegex = /<layout\s+name="([^"]+)">([\s\S]*?)<\/layout>/gi;
            let match;
            while ((match = layoutRegex.exec(xmlStr)) !== null) {
                const layoutNameAttr = match[1];

                // Buscar si el layout ya existe, si no crearlo
                let layout = xmlFile.layouts[layoutNameAttr];
                if (!layout) {
                    layout = new Layout(layoutNameAttr);
                    xmlFile.addLayout(layout);
                }

                // Nuevo regex que no depende del orden de atributos
                const buttonRegex = /<button\b([^>]*)\/>/gi;
                let btnMatch;
                while ((btnMatch = buttonRegex.exec(match[2])) !== null) {
                    const attrs = btnMatch[1];

                    const type = /type="([^"]+)"/i.exec(attrs)?.[1] || "";
                    const label = /label="([^"]*)"/i.exec(attrs)?.[1] || "";
                    const iconPath = /icon="([^"]+)"/i.exec(attrs)?.[1] || "";
                    const targetLayout = /targetlayout="([^"]+)"/i.exec(attrs)?.[1] || "#";

                    const iconFile = iconPath.split("/").pop();

                    // Buscar si el botón ya existe en este layout
                    let button = layout.buttons.find(b => b.icon === iconFile && b.type === type);
                    if (!button) {
                        const btnData = await this._loadIconBase64(zip, layoutName, iconFile);
                        button = new Button(layoutName, layoutNameAttr, type, {}, iconFile, targetLayout);
                        button.data = btnData;
                        layout.addButton(button);
                    }
                    button.addLabel(lang, label);
                }
            }
        }

        async _loadIconBase64(zip, layoutName, iconFile) {
            const iconZipPath = `${layoutName}/${layoutName}_icons/${iconFile}`;
            if (zip.file(iconZipPath)) {
                return await zip.file(iconZipPath).async("base64");
            }
            return null;
        }
    }

    return { ZipLoader };
}));
