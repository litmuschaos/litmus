#!/bin/bash
set -e 

working_dir="litmus-portal"

# Array of Image Names
image_names=("litmusportal-frontend:ci" "litmusportal-server:ci" "litmusportal-auth-server:ci")

# Array of DockerFile Paths
dockerfile_paths=("frontend" "graphql-server/build" "authentication")

# Array of directories, for which images have to be build if changed
directory_array=("frontend" "graphql-server" "authentication")

# Building the images on the basic of changes in paths
for i in "${!directory_array[@]}"
do
	current_dir=$(echo "$working_dir/${directory_array[$i]}")
	nofchanges=$(echo $changed_data | jq -r '[.[]."filename"] | join("\n")' | tr -d '"' | grep ^$current_dir | wc -l)
	if [ $nofchanges != 0 ]
	then 
	docker build $current_dir -t litmuschaos/${image_names[$i]} -f $working_dir/${dockerfile_paths[$i]}/Dockerfile
	kind load docker-image litmuschaos/${image_names[$i]} --name kind
	fi
done
