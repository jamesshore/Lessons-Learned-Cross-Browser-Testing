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
	var karma = require("karma");

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
		var stdout = new CapturedStdout();

		karma.runner.run({}, function(exitCode) {
			stdout.restore();

			if (exitCode) fail("Client tests failed (to start server, run 'jake karma')");
			var browserMissing = checkRequiredBrowsers(SUPPORTED_BROWSERS, stdout);
			if (browserMissing && !process.env.loose) fail("Did not test all supported browsers (use 'loose=true' to suppress error)");
			if (stdout.capturedOutput.indexOf("TOTAL: 0 SUCCESS") !== -1) fail("No tests were run!");

			complete();
		});
	}, {async: true});

	function checkRequiredBrowsers(requiredBrowsers, stdout) {
		var browserMissing = false;
		requiredBrowsers.forEach(function(browser) {
			browserMissing = lookForBrowser(browser, stdout.capturedOutput) || browserMissing;
		});
		return browserMissing;
	}

	function lookForBrowser(browser, output) {
		var missing = output.indexOf(browser + ": Executed") === -1;
		if (missing) console.log(browser + " was not tested!");
		return missing;
	}

	function CapturedStdout() {
		var self = this;
		self.oldStdout = process.stdout.write;
		self.capturedOutput = "";

		process.stdout.write = function(data) {
			self.capturedOutput += data;
			self.oldStdout.apply(this, arguments);
		};
	}

	CapturedStdout.prototype.restore = function() {
		process.stdout.write = this.oldStdout;
	};

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