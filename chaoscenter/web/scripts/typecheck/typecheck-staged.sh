

# this is needed because "When input files are specified on the command line, tsconfig.json files are ignored."
# so this is the only way to run tsc with filenames and tsconfig together :'(
# see "https://www.typescriptlang.org/docs/handbook/tsconfig-json.html"

files="";

# lint-staged will pass all files in $1 $2 $3 etc. iterate and concat.
for var in "$@"
do
    files="$files \"$var\","
done

# create temporary tsconfig which includes only passed files
str="{
  \"extends\": \"./tsconfig.json\",
  \"include\": [\"src/global.d.ts\", $files]
}"
echo $str > tsconfig.tmp

# run typecheck using temp config
tsc --pretty -p ./tsconfig.tmp

# capture exit code of tsc
code=$?

# delete temp config
rm ./tsconfig.tmp

exit $code
