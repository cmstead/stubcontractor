'use strict';

const fs = require('fs');

const assert = require('chai').assert;
const sinon = require('sinon');

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

            stubcontractor.register('api-fixture', testSource);
        });

        it('should load a single function', function () {
            const apiStub = stubcontractor.getApiEndpoints('api-fixture', ['noArguments']);

            this.verify(prettyJson(apiStub));
        });

        it('should load two functions', function () {
            const apiStub = stubcontractor.getApiEndpoints('api-fixture', ['noArguments', 'oneArgument']);

            this.verify(prettyJson(apiStub));
        });

        it('should load a variable-assigned function expression', function () {
            const apiStub = stubcontractor.getApiEndpoints('api-fixture', ['assignedFunctionExpression']);

            this.verify(prettyJson(apiStub));
        });

        it('should load a variable-assigned function expression which is assigned after declaration', function () {
            const apiStub = stubcontractor.getApiEndpoints('api-fixture', ['lateAssignedFunctionExpression']);

            this.verify(prettyJson(apiStub));
        });

        it('should load a variable-assigned lambda expression', function () {
            const apiStub = stubcontractor.getApiEndpoints('api-fixture', ['arrowFunctionExpression']);

            this.verify(prettyJson(apiStub));
        });

        it('should load a method in a class', function () {
            const apiStub = stubcontractor.getApiEndpoints('api-fixture', ['classFunction']);

            this.verify(prettyJson(apiStub));
        });

        it('should load a method from an object', function () {
            const apiStub = stubcontractor.getApiEndpoints('api-fixture', ['objectMethod']);

            this.verify(prettyJson(apiStub));
        });

        it('should not throw an error if function is called correct number of arguments', function () {
            const apiStub = stubcontractor.getApiEndpoints('api-fixture', ['noArguments']);

            assert.doesNotThrow(() => apiStub.noArguments());
        });

        it('should throw an error if function is called with too many arguments', function () {
            const apiStub = stubcontractor.getApiEndpoints('api-fixture', ['noArguments']);

            assert.throws(() => apiStub.noArguments('oh no!'));
        });

        it('should throw an error if function is called with too few arguments', function () {
            const apiStub = stubcontractor.getApiEndpoints('api-fixture', ['oneArgument']);

            assert.throws(() => apiStub.oneArgument());
        });

    });

    describe('getApiFunction', function () {
        
        let stubcontractor;
        let testSource;

        beforeEach(function () {
            const config = {};
            stubcontractor = stubcontractorFactory(config);

            testSource = fs.readFileSync(__dirname + '/fixtures/api-fixture.js', { encoding: 'utf8' });

            stubcontractor.register('api-fixture', testSource);
        });
        
        it('should return a fake function from a specified module', function () {
            const oneArgumentFake = stubcontractor.getApiFunction('api-fixture', 'oneArgument');

            assert.equal(typeof oneArgumentFake, 'function');
        });
        
        it('should throw an error when fake function receives too many arguments', function () {
            const oneArgumentFake = stubcontractor.getApiFunction('api-fixture', 'oneArgument');

            assert.throws(() => oneArgumentFake(1, 2, 3));
        });
        
        it('should throw an error when fake function receives too few arguments', function () {
            const oneArgumentFake = stubcontractor.getApiFunction('api-fixture', 'oneArgument');

            assert.throws(() => oneArgumentFake());
        });
        
    });
    

    describe('buildFunctionFake', function () {

        let stubcontractor;

        beforeEach(function () {
            const config = {};

            stubcontractor = stubcontractorFactory(config);
        });

        it('should return a function', function () {
            function test() { }

            const functionFake = stubcontractor.buildFunctionFake(test);

            assert.equal(typeof functionFake, 'function');
        });

        it('should enforce required argument count', function () {
            function test(a, b, c) { }

            const functionFake = stubcontractor.buildFunctionFake(test);

            const message = 'Function test was called with 2 arguments but expected 3';
            assert.throws(() => functionFake(1, 2), message);
        });


        it('should add a trivial signature to the fake function', function () {
            function test(a, b, c) { }

            const functionFake = stubcontractor.buildFunctionFake(test);

            const signature = 'arg1: *, arg2: *, arg3: * => result: *';
            assert.equal(functionFake.signature, signature);
        });

    });

    describe('buildApiFake', function () {
        let stubcontractor;

        beforeEach(function () {
            const config = {};

            stubcontractor = stubcontractorFactory(config);
        });

        
        it('should fake an API with one endpoint', function () {
            const apiFake = stubcontractor.buildApiFake({ test: () => {} });
            const result = {
                apiEndpoints: Object.keys(apiFake),
                testSignature: apiFake.test.signature
            };

            this.verify(prettyJson(result));
        });
        
    });

    describe('functionFake.onCall', function () {
        let stubcontractor;

        beforeEach(function () {
            const config = {};

            stubcontractor = stubcontractorFactory(config);
        });

        it('should provide a function the fake function should call when the fake is called', function () {
            function test(a, b, c) { }

            const functionFake = stubcontractor.buildFunctionFake(test);
            const onCallSpy = sinon.spy();

            functionFake.onCall(onCallSpy);

            functionFake(1, 2, 3);

            this.verify(prettyJson(onCallSpy.args));
        });


        it('should throw an error if trying to register a non-function', function () {
            function test(a, b, c) { }

            const functionFake = stubcontractor.buildFunctionFake(test);

            const message = 'Cannot register null as function to call from function test';
            assert.throws(() => functionFake.onCall(null), message);
        });

        
        it('should return function fake', function () {
            function test(a, b, c) {}

            const functionFake = stubcontractor.buildFunctionFake(test);

            assert.equal(functionFake.onCall(() => {}), functionFake);
        });
        

    });
    
    describe('functionFake.getOnCallAction', function () {
        
        let stubcontractor;

        beforeEach(function () {
            const config = {};

            stubcontractor = stubcontractorFactory(config);
        });
        
        it('returns action provided to onCall method', function () {
            const functionFake = stubcontractor.buildFunctionFake(function test() {});

            function myAction () {}

            functionFake.onCall(myAction);

            assert.equal(functionFake.getOnCallAction(), myAction);
        });

    });

    describe('file loading', function () {
        let stubcontractor;

        beforeEach(function () {
            const config = {
                cwd: __dirname + '/fixtures',
                sourceDirectories: [
                    './'
                ]
            };
            stubcontractor = stubcontractorFactory(config);
        });


        it('should load a file dynamically if not preregistered', function () {
            const apiFake = stubcontractor.getApiEndpoints('api-fixture', [
                'noArguments',
                'oneArgument',
                'assignedFunctionExpression',
                'lateAssignedFunctionExpression',
                'arrowFunctionExpression'
            ]);

            this.verify(prettyJson(apiFake));
        });

        
        it('should throw an error when a file cannot be loaded', function () {
            const badModuleLoader = () => stubcontractor.getApiEndpoints('api-fixture-bad', [
                'noArguments',
                'oneArgument',
                'assignedFunctionExpression',
                'lateAssignedFunctionExpression',
                'arrowFunctionExpression'
            ]);

            const message = 'Cannot load api-fixture-bad, it does not exist in known file paths';
            assert.throws(badModuleLoader, message);
        });
        

    });


});
