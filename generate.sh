#!/bin/bash

# don't do this, just let it blow up
#git submodule init
#git submodule update

NPM=`which npm 2>/dev/null`
if [ -z "$NPM" ] || [ ! -x "$NPM" ]; then
	echo "Unable to locate npm.  Install node.js."
	exit 1
fi

if [ ! -x node_modules/uglify-js/bin/uglifyjs ]; then
	$NPM install uglify-js || exit 1
fi
if [ ! -x node_modules/clean-css/bin/cleancss ]; then
	$NPM install clean-css || exit 1
fi

STATICFILES=`ls *.html *.xml`
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
		node_modules/uglify-js/bin/uglifyjs -o "$OUTPUTFILE" "$FILE" || exit 1
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
		node_modules/clean-css/bin/cleancss -o "$OUTPUTFILE" "$FILE" || exit 1
		echo "done."
	fi
done

echo "- copying images"
grep -E 'images/.*\.png' app.css | sed -e 's,^.*url[(],,' -e 's,.png[)].*$,.png,' | while read FILE; do
	OUTPUTFILE="runtime/${FILE}"
	OUTPUTDIR=`dirname "$OUTPUTFILE"`
	mkdir -p "$OUTPUTDIR"
	echo -e "  * $FILE: \c"
	if [ "$OUTPUTFILE" -nt "$FILE" ]; then
		echo "skipped."
	else
		cp "$FILE" "$OUTPUTFILE" || exit 1
		echo "done."
	fi
done

echo "- copying static files"
for FILE in $STATICFILES; do
	OUTPUTFILE="runtime/${FILE}"
	OUTPUTDIR=`dirname "$OUTPUTFILE"`
	mkdir -p "$OUTPUTDIR"
	echo -e "  * $FILE: \c"
	if [ "$OUTPUTFILE" -nt "$FILE" ]; then
		echo "skipped."
	else
		cp "$FILE" "$OUTPUTFILE" || exit 1
		echo "done."
	fi
done
