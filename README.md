# Stubcontractor #

**The easiest way to keep unit tests and module contracts honest**

## The Case for Stubcontractor ##

Javascript is a dynamic language.  This means just about anything goes.  Unfortunately, this also means, when you have a well isolated module under test, you can easily fall into a deep dark pit I like to refer to as contract divergence.  This is a scary place where all of you unit tests pass, but your integration tests fail, so you have to use your crazy slow integration tests to uncover the one function which doesn't do the thing it used to, or worse, you have to find the single place where something calls your function with too many or to few arguments.

**OH NOES!**

Stubcontractor allows you, the intrepid JS programmer, to have full faith that your unit tests will break when a contract changes or something is called in a weird way. In the following documentation we will explore the API that makes creating API fakes fun and easy, while setting you up to quickly discover where your code might be misbehaving long before you start running those integration tests which take 30 minutes to finish.

**YAYS!**

## Installation ##

In your project directory type the following into a terminal to install:

```bash
npm i stubcontractor --save-dev
```

## Configuration ##

**Configuration for Node**

Stubcontractor requires a minimal configuration for node. A current working directory (cwd) is necessary so stubcontractor can seek files in the correct location. Source directories are simply a list of directory names under the cwd which contain modules which will be tested.

It's advisable to create this setup in a file which can be required into a test as needed.  Having this configuration payload at the top of each test file is likely to create a lot of test noise!

```javascript
'use strict';

const config = {
    cwd: __dirname + '/modules/base/path',
    sourceDirectories: [
        'databaseServices',
        'dataTransformations',
        'anotherModuleDirectory'
    ]
};

module.exports = require('stubcontractor')(config);
```

**Configuration for the Client**

There is none!  Since the client doesn't need to work within a filesystem, stubcontractor simply loads onto the window and allows the pre-loading of source code manually, or simply provide a live API and stubcontractor will generate a new fake which can be used to easily break dependencies while creating a test harness.


## Using Stubcontractor ##

The following examples will all assume we are faking the module defined below.  Assume this module lives in anotherModuleDirectory and is called arithmeticStuff.js.

```javascript
const arithmeticStuff = (function () {
    'use strict';

    function addStuff(a, b) {
        return a + b;
    }

    function subtractStuff(a, b) {
        return a - b;
    }

    function multiplyStuff(a, b) {
        return a * b;
    }

    const endpoints = {
        addStuff: addStuff,
        subtractStuff: subtractStuff,
        multiplyStuff: multiplyStuff
    };

    if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = endpoints;
    } else {
        return endpoints;
    }
})();
```

### Building Module and Function Fakes in Node ###

The ideal situation for any test doubles is that the code to be replaced never be executed at all. In Node this is actually possible. Stubcontractor will let you create the interface you want to interact with by simply declaring the filename which should be used.  Stubcontractor will build a fake of the API based on the currently written module in the filesystem.

In the following examples we will be using the Stubcontractor methods:

- stubcontractor.getApiEndpoints
- stubcontractor.getApiFunction

#### Setup ####

In our test file, we can load a fake API in the following way:

```javascript
const stubcontractor = require('../testUtilities/stubcontractorSetup');

describe('A Module which uses arithmetic stuff', function () {
    let arithemeticStuffFake;
    let multiplyStuffFake;
    let moduleUnderTest;

    beforeEach(function() {
        arithmeticStuffFake = stubcontractor.getApiEndpoints(
            // The name of the file/module you want to fake
            'arithmeticStuff',

            // The names of the endpoints you care about
            [
                'addStuff'
            ]);

        // fake functions returned by stubcontractor behave the same
        // way whether attached to an API object or not
        multiplyStuffFake = stubcontractor.getApiFunction(
            // the name of the file/module you want to fake
            'arithmeticStuff',

            // The name of the function you want to fake
            'multiplyStuff'
        );
        
        // I'm assuming this module is a factory which returns an API
        moduleUnderTest = require('../app/moduleUnderTest')(arithmeticStuffFake);
    });

    // test cases will go here.  Examples are below.
});
```

### Building Module and Function Fakes in the Client ###

If you are working in the client, it is typically pretty tough to load modules via source code into your test environment.  Even so, Stubcontractor provides a way to generate fakes from modules which are loaded into memory. 

In this example we will be using the Stubcontractor methods:

- stubcontractor.buildApiFake
- stubcontractor.buildFunctionFake

#### Setup ####

In our test file, we can load a fake API in the following way:

```javascript
describe('A Module which uses arithmetic stuff', function () {
    let arithemeticStuffFake;
    let multiplyStuffFake;
    let moduleUnderTest;

    beforeEach(function() {
        // Simply pass the module directly into buildApiFake, 
        // a faked module will be automatically produced
        arithmeticStuffFake = stubcontractor.buildApiFake(arithmeticStuff);

        // fake functions returned by stubcontractor behave the same
        // way whether attached to an API object or not
        multiplyStuffFake = stubcontractor.buildFunctionFake(arithmeticStuff.multiplyStuff);
        
        // I'm assuming this module is a factory which returns an API
        moduleUnderTest = moduleUnderTestFactory(arithmeticStuffFake);
    });

    // test cases will go here.  Examples are below.
});
```

## Using Fakes In Tests ##

Once we have a fake API loaded, we can use it for our tests.  By default the function does nothing except ensure your function is called with the correct number of arguments.  Things like spies and added behaviors can be inserted using the `.onCall` function provided by Stubcontractor, meanwhile, functions can be retrieved using `.getOnCallAction`.

In this example, we will use the following functions attached to returned fakes:

- fakeFunction.onCall
- fakeFunction.getOnCallAction

```javascript
const sinon = require('sinon');
const assert = require('chai').assert;
const stubcontractor = require('../testUtilities/stubcontractorSetup');

describe('Our tests!', function () {
    // For setup please see the examples above

    it('calls addStuff when I do the thing', function () {
        // have addStuff call a spy when the call is made
        arithmeticStuffFake.addStuff.onCall(sinon.spy());

        moduleUnderTest.doSomeStuff(17, 32);

        const callArgs = arithmeticStuffFake.addStuff
            .getOnCallAction() // gets spy back out again
            .getCall(0).args; // uses sinon spy API to get function arguments

        const result = JSON.stringify(callArgs);

        assert.equal(result, '[17,32]');
    });

    it('throws an error if the contract length is violated', function () {
        // The stubcontractor fakes capture the number of arguments required for
        // a function call and throw an error if they are called incorrectly
        const message = 'Function addStuff was called with 1 arguments but expected 2';
        assert.throws(() => arithmeticStuffFake.addStuff(1), message);
    });
});
```

## Outstanding Todos ##

- [ ] Verify Esprima and ESTraverse work in the client
- [ ] Add utility to generate cache file for loading source in the client
- [ ] Enhance client test double generation to ease the breaking of dependencies
- [ ] Update documentation to describe loading required dependencies in client

## Version History ##

**v0.5.0**

- Completed building buildApiFake

**v0.4.0**

- Finished readme
- Added getApiFunction

**v0.3.0**

Further enhancements and verification stubcontractor works in client

**v0.2.0**

Feature adds, updates

**v0.1.0**

First, experimental release