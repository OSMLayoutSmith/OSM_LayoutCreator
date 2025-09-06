// core-loader.js - Cargador del Core
// Este archivo carga todos los módulos del core en el orden correcto

// Función para cargar scripts de forma secuencial
async function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Cargar JSZip primero (requerido por zip-builder y zip-loader)
async function loadCore() {
    try {
        // JSZip ya está cargado en el HTML
        
        // Cargar módulos del core en orden de dependencia
        await loadScript('./core/metadata.js');
        await loadScript('./core/button.js');
        await loadScript('./core/layout.js');
        await loadScript('./core/xml-file.js');
        await loadScript('./core/zip-builder.js');
        await loadScript('./core/zip-loader.js');
        await loadScript('./core/folder-manager.js');
        
        // Disparar evento para indicar que el core está listo
        window.dispatchEvent(new CustomEvent('coreLoaded'));
        
    } catch (error) {
        console.error('Error loading core modules:', error);
        throw error;
    }
}

// Cargar el core automáticamente
loadCore();