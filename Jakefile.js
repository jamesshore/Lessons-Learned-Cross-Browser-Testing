// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global desc, task, jake, fail, complete, directory, require, console, process */
(function () {
	"use strict";

	// NOTE: This script DOES work in Windows now.
	// For information, see this Testacular issue:
	// https://github.com/vojtajina/testacular/issues/91


	// To cause the build to fail unless certain browsers are tested, add them to this array:
	var SUPPORTED_BROWSERS = [
//		"Chrome 29.0.1547 (Mac OS X 10.8.5)"
	];

	var lint = require("./build/lint/lint_runner.js");

	desc("Lint and test");
	task("default", ["lint", "test"]);

	desc("Start Karma server for testing");
	task("karma", function() {
		sh("node node_modules/karma/bin/karma start", complete, function() {
			fail("Could not start Karma server");
		});
	}, {async: true});

	desc("Test client code");
	task("test", function() {
		var config = {};

		var output = "";
		var oldStdout = process.stdout.write;
		process.stdout.write = function(data) {
			output += data;
			oldStdout.apply(this, arguments);
		};

		require("karma/lib/runner").run(config, function(exitCode) {
			process.stdout.write = oldStdout;

			if (exitCode) fail("Client tests failed (to start server, run 'jake karma')");
			var browserMissing = false;
			SUPPORTED_BROWSERS.forEach(function(browser) {
				browserMissing = checkIfBrowserTested(browser, output) || browserMissing;
			});
			if (browserMissing && !process.env.loose) fail("Did not test all supported browsers (use 'loose=true' to suppress error)");
			if (output.indexOf("TOTAL: 0 SUCCESS") !== -1) fail("Client tests did not run!");

			complete();
		});
	}, {async: true});

	function checkIfBrowserTested(browser, output) {
		var missing = output.indexOf(browser + ": Executed") === -1;
		if (missing) console.log(browser + " was not tested!");
		return missing;
	}

	function karma(args, errorMessage, callback) {
		args.unshift("node_modules/karma/bin/karma");
		sh("node", args, errorMessage, callback);
	}

	function sh(oneCommand, successCallback, failureCallback) {
		var stdout = "";
		var child = jake.createExec(oneCommand);
		child.on("stdout", function(data) {
			process.stdout.write(data);
			stdout += data;
		});
		child.on("stderr", function(data) {
			process.stderr.write(data);
		});
		child.on("cmdEnd", function() {
			successCallback(stdout);
		});
		child.on("error", function() {
			failureCallback(stdout);
		});

		console.log("> " + oneCommand);
		child.run();
	}

	desc("Lint everything");
	task("lint", [], function () {
		var passed = lint.validateFileList(browserFilesToTest().toArray(), browserLintOptions(), {});
		if (!passed) fail("Lint failed");
	});

	function browserFilesToTest() {
		var files = new jake.FileList();
		files.include("src/**/*.js");
		files.include("Jakefile.js");
		return files;
	}

	function browserLintOptions() {
		return {
			bitwise:true,
			curly:false,
			eqeqeq:true,
			forin:true,
			immed:true,
			latedef:false,
			newcap:true,
			noarg:true,
			noempty:true,
			nonew:true,
			regexp:true,
			undef:true,
			strict:true,
			trailing:true,
			browser:true
		};
	}
}());