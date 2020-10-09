#!/bin/bash

cd litmus-portal || exit

frontend="frontend"
declare -A backend_mod=( ["graphql-server"]="gql" ["authentication"]="auth" ["cluster-agents/subscriber"]="subscriber" ["tools/self-deployer"]="deployer")

PARAMETERS='"init":false'

for mod in "${!backend_mod[@]}"
do
  if [[ $(git diff "$1" "$2"  "$mod" | wc -l) != 0 || $3 = true ]];
  then
    PARAMETERS+=", \"${backend_mod[$mod]}\":true"
  fi
done

if [[ $PARAMETERS != '"init":false' ]];
then
  PARAMETERS+=", \"backend\":true"
fi

if [[ $(git diff "$1" "$2"  "$frontend" | wc -l) != 0 || $3 = true ]];
then
  PARAMETERS+=", \"${frontend}\":true"
fi

if [[ $PARAMETERS = '"init":false' ]];
then
  echo "No Module Changes"
  exit 0
fi

PARAMETERS+=", \"env\":true"


DATA="{ \"branch\": \"$CIRCLE_BRANCH\", \"parameters\": { $PARAMETERS } }"
echo "Triggering pipeline with data:"
echo -e "  $DATA"

URL="${CIRCLE_API}/v2/project/${REPOSITORY_TYPE}/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/pipeline"
HTTP_RESPONSE=$(curl -s -u "${CIRCLE_TOKEN}:" -o response.txt -w "%{http_code}" -X POST --header "Content-Type: application/json" -d "$DATA" "$URL")

if [ "$HTTP_RESPONSE" -ge "200" ] && [ "$HTTP_RESPONSE" -lt "300" ]; then
    echo "API call succeeded."
    echo "Response:"
    cat response.txt
else
    echo -e "\e[93mReceived status code: ${HTTP_RESPONSE}\e[0m"
    echo "Response:"
    cat response.txt
    exit 1
fi