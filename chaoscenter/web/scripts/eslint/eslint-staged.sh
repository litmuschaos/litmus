
# lint-staged will pass all files in $1 $2 $3 etc. iterate and concat.
for var in "$@"
do
    files="$files $var" 
done

# run lint on staged files
eslint --ext .ts --ext .tsx --fix $files

# capture exit code of eslint
code=$?

exit $code
