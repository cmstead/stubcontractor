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

        
        it('should load a variable-assigned function expression', function () {
            const apiStub = stubcontractor.getApiEndpoints('testSource', ['assignedFunctionExpression']);

            this.verify(prettyJson(apiStub));
        });
        
        it('should load a variable-assigned function expression which is assigned after declaration', function () {
            const apiStub = stubcontractor.getApiEndpoints('testSource', ['lateAssignedFunctionExpression']);

            this.verify(prettyJson(apiStub));
        });
        
        it('should load a variable-assigned lambda expression', function () {
            const apiStub = stubcontractor.getApiEndpoints('testSource', ['arrowFunctionExpression']);

            this.verify(prettyJson(apiStub));
        });
        
        it('should load a method in a class', function () {
            const apiStub = stubcontractor.getApiEndpoints('testSource', ['classFunction']);

            this.verify(prettyJson(apiStub));
        });
        
        it('should load a method from an object', function () {
            const apiStub = stubcontractor.getApiEndpoints('testSource', ['objectMethod']);

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

    describe('buildFunctionFake', function () {

        let stubcontractor;

        beforeEach(function () {
            const config = {};

            stubcontractor = stubcontractorFactory(config);
        });
        
        it('should return a function', function () {
            function test () {}

            const functionFake = stubcontractor.buildFunctionFake(test);

            assert.equal(typeof functionFake, 'function');
        });

        it('should enforce required argument count', function () {
            function test (a, b, c) {}

            const functionFake = stubcontractor.buildFunctionFake(test);

            const message = 'Function test was called with 2 arguments but expected 3';
            assert.throws(() => functionFake(1, 2), message);
        })
        

    });
    

});
