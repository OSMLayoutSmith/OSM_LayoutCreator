
# OSM Layout Creator

OSM Layout Creator is a web application that allows you to create, manage, and export custom layouts for OpenStreetMap (OSM) related projects. It features an intuitive interface built with HTML, CSS, and JavaScript.

## Main Features
- Create and edit custom layouts.
- Manage buttons and visual elements.
- Export and import layouts in ZIP/XML format.
- Support for multiple languages and configurations.

## Project Structure
```
index.html           # Main web application page
style.css            # Interface styles
scripts/             # JavaScript logic and utilities
	├─ button-manager.js
	├─ config.js
	├─ ...
	└─ core/           # Core modules
			├─ button.js
			├─ layout.js
			└─ ...
test/                # Tests and example files
```

## Requirements
You only need a modern web browser to run the application. For development, it is recommended to use a local server (e.g., Python, Node.js, or the Live Server extension for VS Code).


## Quick Start
1. Clone the repository or download the files.
2. You can use the web application directly from GitHub Pages:
	 - Visit: `https://OSMLayoutSmith.github.io/OSM_LayoutCreator/` (or your repository's GitHub Pages URL)
3. Alternatively, open `index.html` in your browser.
4. (Optional) Start a local server to avoid routing issues:
	 - With Python:
		 ```powershell
		 # In PowerShell, navigate to the project folder and run:
		 python -m http.server 8000
		 ```
	 - With Node.js:
		 ```powershell
		 npx http-server .
		 ```
	 - With VS Code: Install the "Live Server" extension and click "Go Live".

## License
This project is licensed under the MIT License.

## Author
OSMLayoutSmith
