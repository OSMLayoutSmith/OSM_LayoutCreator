(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
        global.Metadata = module.exports.Metadata;
    } else {
        root.Metadata = factory().Metadata;
    }
}(typeof self !== "undefined" ? self : this, function () {

    class Metadata {
        constructor(layoutName, username, repo, branch) {
            this.layoutName = layoutName;
            this.username = username;
            this.repo = repo;
            this.branch = branch;
            this.options = [];
        }

        addOption(code, lang, description) {
            this.options.push([code, lang, description]);
        }

        removeOption(code) {
            this.options = this.options.filter(item => item[0] !== code);
        }

        createOptions() {
            return this.options.map(item => `   <option iso="${item[0]}" name="${item[1]}">${item[2]}</option>`).join('\n');
        }
            
        toString() {
            return `<?xml version="1.0" encoding="UTF-8"?>\n<metadata layout="${this.layoutName}">\n${this.createOptions()}\n   <github username="${this.username}" repo="${this.repo}" branch="${this.branch}" />\n</metadata>`;
        }
    }

    return { Metadata };
}));
