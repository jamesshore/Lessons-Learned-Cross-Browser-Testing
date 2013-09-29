// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global desc, task, jake, fail, complete, directory, require, console, process */
(function () {
	"use strict";

	// NOTE: This script DOES work in Windows now.
	// For information, see this Testacular issue:
	// https://github.com/vojtajina/testacular/issues/91

	var SUPPORTED_BROWSERS = [
		"IE 8.0",
		"Chrome 23.0"
	];

	desc("Lint and test");
	task("default", ["lint", "test"]);

	desc("Start Karma server for testing");
	task("karma", function() {
		karma(["start"], "Could not start Karma server", complete);
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

	function sh(command, args, errorMessage, callback) {
		console.log("> " + command + " " + args.join(" "));

		// Not using jake.createExec as it adds extra line-feeds into output as of v0.3.7
		var child = require("child_process").spawn(command, args, { stdio: "pipe" });

		// redirect stdout
		var stdout = "";
		child.stdout.setEncoding("utf8");
		child.stdout.on("data", function(chunk) {
			stdout += chunk;
			process.stdout.write(chunk);
		});

		// redirect stderr
		var stderr = "";
		child.stderr.setEncoding("utf8");
		child.stderr.on("data", function(chunk) {
			stderr += chunk;
			process.stderr.write(chunk);
		});

		// handle process exit
		child.on("exit", function(exitCode) {
			if (exitCode !== 0) fail(errorMessage);
		});
		child.on("close", function() {      // 'close' event can happen after 'exit' event
			callback(stdout, stderr);
		});
	}

	desc("Lint everything");
	task("lint", [], function () {
		var lint = require("./build/lint/lint_runner.js");

		var files = new jake.FileList();
		files.include("src/**/*.js");
		files.include("Jakefile.js");
		var options = browserLintOptions();
		var passed = lint.validateFileList(files.toArray(), options, {});
		if (!passed) fail("Lint failed");
	});

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