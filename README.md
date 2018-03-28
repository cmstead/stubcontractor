# Stubcontractor #

**The easiest way to keep unit tests and module contracts honest**

## The Case for Stubcontractor ##

Javascript is a dynamic language.  This means just about anything goes.  Unfortunately, this also means, when you have a well isolated module under test, you can easily fall into a deep dark pit I like to refer to as contract divergence.  This is a scary place where all of you unit tests pass, but your integration tests fail, so you have to use your crazy slow integration tests to uncover the one function which doesn't do the thing it used to, or worse, you have to find the single place where something calls your function with too many or to few arguments.

**OH NOES!**

Stubcontractor allows you, the intrepid JS programmer, to have full faith that your unit tests will break when a contract changes or something is called in a weird way. In the following documentation we will explore the API that makes creating API fakes fun and easy, while setting you up to quickly discover where your code might be misbehaving long before you start running those integration tests which take 30 minutes to finish.

**YAYS!**

## Installation ##

```bash
> npm i stubcontractor --save-dev
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


## I promise this is not the end of the docs, I just had to pack up and go home. ##