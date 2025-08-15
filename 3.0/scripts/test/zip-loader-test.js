require("./core-globals.js"); // Esto carga Button, Layout, XMLFile, etc.
const { ZipLoader } = require("../core/zip-loader.js");

(async () => {
    const loader = new ZipLoader();
    const xmlFile = await loader.loadFromFile(
        "C:\\Users\\ksala\\OneDrive\\Desktop\\OSM_LayoutCreator\\2.0\\scripts\\test\\myLayout.zip"
    );
    console.log(xmlFile.toString("ja")); // Imprime el XML reconstruido
})();
