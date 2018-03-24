(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.container.register(moduleFactory)
    }

})(function fileLoaderFactory(fs, path, signet) {
    'use strict';

    return function (config) {
        const cwd = config.cwd;
        const sourceDirectories = config.sourceDirectories;

        function statFile(filePath) {
            try {
                return fs.lstatSync(filePath).isFile();
            } catch (e) {
                return false;
            }
        }

        function loadSource(moduleName) {
            const existingFiles = sourceDirectories
                .map(dir => path.join(cwd, dir, moduleName + '.js'))
                .filter(statFile);

            try {
                return fs.readFileSync(existingFiles[0], { encoding: 'utf8' });
            } catch (e) {
                return null;
            }
        }

        return {
            loadSource: signet.enforce(
                'moduleName: string => fileSource: variant<string, null>',
                loadSource)
        };
    };
});
