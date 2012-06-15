#!/bin/bash

git submodule init
git submodule update

mkdir -p ~/.node_libraries
ln -s UglifyJS/uglify-js.js ~/.node_libraries/uglify-js.js
ln -s optimist/index.js ~/.node_libraries/optimist.js
ln -s clean-css/lib/clean.js ~/.node_libraries/clean.js

JSFILES=`ls *.js jquerymobile-router/js/jquery.mobile.router.js`
CSSFILES=`ls *.css themes/*.css`

echo "- minifying javascript"
for FILE in $JSFILES; do
	OUTPUTFILE="runtime/${FILE}"
	OUTPUTDIR=`dirname "$OUTPUTFILE"`
	mkdir -p "$OUTPUTDIR"
	echo -e "  * $FILE: \c"
	if [ "$OUTPUTFILE" -nt "$FILE" ]; then
		echo "skipped."
	else
		UglifyJS/bin/uglifyjs -o "$OUTPUTFILE" "$FILE" || exit 1
		echo "done."
	fi
done

echo "- minifying css"
for FILE in $CSSFILES; do
	OUTPUTFILE="runtime/${FILE}"
	OUTPUTDIR=`dirname "$OUTPUTFILE"`
	mkdir -p "$OUTPUTDIR"
	echo -e "  * $FILE: \c"
	if [ "$OUTPUTFILE" -nt "$FILE" ]; then
		echo "skipped."
	else
		clean-css/bin/cleancss -o "$OUTPUTFILE" "$FILE" || exit 1
		echo "done."
	fi
done
