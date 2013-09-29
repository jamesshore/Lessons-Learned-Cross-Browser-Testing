#!/bin/sh

[ ! -f node_modules/.bin/karma ] && npm rebuild
node_modules/.bin/karma $*
