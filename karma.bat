@echo off
if not exist node_modules\.bin\karma.cmd call npm rebuild
node_modules\.bin\karma %*
