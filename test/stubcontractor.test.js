'use strict';

const fs = require('fs');

const assert = require('chai').assert;

const prettyJson = require('./test-utils/prettyJson');
require('./test-utils/approvals-config')();

const stubcontractorFactory = require('../index.js');

describe('stubcontractor', function () {
    
    describe('getApiEndpoints', function () {

        let stubcontractor;
        let testSource;

        beforeEach(function () {
            const config = {};
            stubcontractor = stubcontractorFactory(config);

            testSource = fs.readFileSync(__dirname + '/fixtures/api-fixture.js', { encoding: 'utf8' });

            stubcontractor.register('testSource', testSource);
        });
        
        it('should load a single function', function () {
            const apiStub = stubcontractor.getApiEndpoints('testSource', ['noArguments']);

            this.verify(prettyJson(apiStub));
        });
        
        it('should load two functions', function () {
            const apiStub = stubcontractor.getApiEndpoints('testSource', ['noArguments', 'oneArgument']);

            this.verify(prettyJson(apiStub));
        });
        
        it('should not throw an error if function is called correct number of arguments', function () {
            const apiStub = stubcontractor.getApiEndpoints('testSource', ['noArguments']);

            assert.doesNotThrow(() => apiStub.noArguments());
        });
        
        it('should throw an error if function is called with too many arguments', function () {
            const apiStub = stubcontractor.getApiEndpoints('testSource', ['noArguments']);

            assert.throws(() => apiStub.noArguments('oh no!'));
        });
        
        it('should throw an error if function is called with too few arguments', function () {
            const apiStub = stubcontractor.getApiEndpoints('testSource', ['oneArgument']);

            assert.throws(() => apiStub.oneArgument());
        });
        
    });
    

});
