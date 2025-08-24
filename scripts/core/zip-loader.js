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

            // Caso 1: Navegador -> Blob o File
            if (typeof Blob !== "undefined" && filePathOrBuffer instanceof Blob) {
                data = await filePathOrBuffer.arrayBuffer();
            }
            // Caso 2: Navegador -> ArrayBuffer
            else if (filePathOrBuffer instanceof ArrayBuffer) {
                data = filePathOrBuffer;
            }
            // Caso 3: Node.js -> Buffer
            else if (typeof Buffer !== "undefined" && Buffer.isBuffer(filePathOrBuffer)) {
                data = filePathOrBuffer;
            }
            // Caso 4: Node.js -> Ruta de archivo
            else if (fs && fs.existsSync && typeof filePathOrBuffer === "string") {
                data = fs.readFileSync(filePathOrBuffer);
            }
            // entrada inválida
            else {
                throw new Error(
                    "Invalid input: must be a Buffer, file path (Node), Blob/File, or ArrayBuffer (browser)"
                );
            }

            // Cargar el ZIP con JSZip
            const zip = await JSZip.loadAsync(data);

            // Detectar nombre base del layout
            const metadataEntry = Object.keys(zip.files).find(name =>
                name.startsWith("metadata/") && name.endsWith(".xml")
            );
            if (!metadataEntry) throw new Error("metadata.xml not found in ZIP");

            const layoutName = metadataEntry.replace("metadata/", "").replace(".xml", "");

            // Parsear metadata.xml
            const metadataStr = await zip.file(metadataEntry).async("string");
            const metadataResult = this._parseMetadata(metadataStr, layoutName);
            const languages = metadataResult.languages;
            const metadataObj = metadataResult.metadata;

            // Crear XMLFile y registrar idiomas
            let xmlFile = new XMLFile();
            languages.forEach(lang => xmlFile.addLanguage(lang));

            // Cargar README.md si existe
            let readmeContent = "";
            const readmePath = `${layoutName}/README.md`;
            if (zip.file(readmePath)) {
                readmeContent = await zip.file(readmePath).async("string");
            }

            // Cargar íconos
            const icons = {};
            const iconFolderPrefixes = [
                `${layoutName}/${layoutName}_icons/`,
                `${layoutName}/${layoutName}_Icons/`
            ];

            for (const fileName of Object.keys(zip.files)) {
                for (const prefix of iconFolderPrefixes) {
                    if (fileName.startsWith(prefix) && !zip.files[fileName].dir) {
                        const shortName = fileName.replace(prefix, "");
                        icons[shortName] = await zip.file(fileName).async("base64");
                        break;
                    }
                }
            }

            // Procesar XML de cada idioma → retornando xmlFile
            for (const lang of languages) {
                const layoutXmlPath = `${layoutName}/${lang}.xml`;
                if (!zip.file(layoutXmlPath)) continue;

                const layoutStr = await zip.file(layoutXmlPath).async("string");
                xmlFile = await this._parseLayoutXml(layoutStr, xmlFile, lang, zip, layoutName);
            }

            return {
                name: layoutName,
                xmlFile,
                metadata: metadataObj,
                readme: readmeContent,
                icons
            };
        }

        _parseMetadata(xmlStr, layoutName) {
            // idiomas
            const languages = [];
            const optionMatches = xmlStr.matchAll(/<option[^>]*iso\s*=\s*"([^"]+)"[^>]*>/gi);
            for (const match of optionMatches) languages.push(match[1]);

            let metadata;
            try {
                metadata = new Metadata(layoutName);
            } catch (e) {
                console.error("Error creating Metadata object:", e);
                throw e;
            }

            // opciones completas
            const optionRegex = /<option[^>]*iso\s*=\s*"([^"]+)"[^>]*name\s*=\s*"([^"]+)"[^>]*>([^<]*)<\/option>/gi;
            let opt;
            while ((opt = optionRegex.exec(xmlStr)) !== null) {
                metadata.addOption(opt[1], opt[2], opt[3].trim());
            }

            // github
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

                // Botones
                const buttonRegex = /<button\b([^>]*)\/>/gi;
                let btnMatch;
                while ((btnMatch = buttonRegex.exec(match[2])) !== null) {
                    const attrs = btnMatch[1];

                    const type = this._extractAttribute(attrs, 'type') || "";
                    let label = this._extractAttribute(attrs, 'label') || "";
                    const iconPath = this._extractAttribute(attrs, 'icon') || "";
                    const targetLayout = this._extractAttribute(attrs, 'targetlayout') || "#";

                    const iconFile = iconPath.split("/").pop();

                    // Si no hay label
                    if (!label) {
                        if (layoutNameAttr === "root") {
                            // en root -> no agregar este botón
                            continue;
                        } else {
                            // en otros layouts -> usar el type como label
                            label = type;
                        }
                    }

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
            return xmlFile;
        }


        _extractAttribute(attrString, attrName) {
            const regex = new RegExp(`${attrName}\\s*=\\s*"([^"]*)"`, 'i');
            const match = regex.exec(attrString);
            return match ? match[1] : null;
        }

        async _loadIconBase64(zip, layoutName, iconFile) {
            if (!iconFile) return null;

            const iconPaths = [
                `${layoutName}/${layoutName}_icons/${iconFile}`,
                `${layoutName}/${layoutName}_Icons/${iconFile}`
            ];

            for (const iconZipPath of iconPaths) {
                if (zip.file(iconZipPath)) {
                    return await zip.file(iconZipPath).async("base64");
                }
            }

            return null;
        }
    }

    return { ZipLoader };
}));
