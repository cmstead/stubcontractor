(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.stubcontractorContainer.register(moduleFactory);
    }

})(function registryFactory(parser) {
    'use strict';

    return function (fileLoader) {
        const registry = {};

        function register(moduleName, source) {
            registry[moduleName] = parser.parse(source);
        }

        function getModule(moduleName) {
            if (typeof registry[moduleName] === 'undefined') {
                const moduleSource = fileLoader.loadSource(moduleName);

                if (typeof moduleSource === 'string') {
                    register(moduleName, moduleSource);
                } else {
                    throw new Error(`Cannot load ${moduleName}, it does not exist in known file paths`);
                }
            }

            return registry[moduleName];
        }
        
        return {
            register: register,
            getModule: getModule
        };
    }
});