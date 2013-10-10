Lessons Learned: Cross-Browser Testing with Karma
=============

This repository contains the example code for the above-named [Lessons Learned episode](http://www.letscodejavascript.com/v3/episodes/lessons_learned/6) of James Shore's [Let's Code: Test-Driven JavaScript](http://www.letscodejavascript.com) screencast. Let's Code: Test-Driven JavaScript is a screencast series focused on rigorous, professional JavaScript development.

The source code in this repository demonstrates automated cross-browser testing using Karma, Mocha, and Expect.js. Files of note:

* `Jakefile.js` contains the automated build.
* `karma.conf.js` contains the Karma configuration.
* `src/` contains the (very simple) test and production code.

For more information about this example, [watch the screencast](http://www.letscodejavascript.com/v3/episodes/lessons_learned/6).

Latest major changes:
* 29 Sept 2013: Upgraded to Karma 0.10 (also updated all other npm dependencies to latest versions)


Building and Testing
--------------------

Before building for the first time:

1. Install [Node.js](http://nodejs.org/download/).
2. Download and unzip [the source code](https://github.com/jamesshore/automatopia/archive/master.zip) into a convenient directory.
3. All commands must run from the root of the source tree: `cd <directory>`.
4. To cause the build to fail unless certain browsers are tested, edit `REQUIRED_BROWSERS` at the top of `Jakefile.js`. Otherwise, comment those lines out.

To build (and test):

1. Run `./jake.sh karma` (Unix/Mac) or `jake karma` (Windows) to start the Karma server.
2. Start the browsers you want to test and point each one at `http://localhost:9876`.
3. Run `./jake.sh` (Unix/Mac) or `jake` (Windows) every time you want to build and test.


License
-------

MIT License. See `LICENSE.TXT`.