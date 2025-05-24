#!/bin/bash

# Function to run sudo commands with a single password prompt
run_sudo() {
    sudo -S $@ <<< "$SUDO_PASSWORD"
}

# Function to display usage information
usage() {
    echo "Usage: $0 [options] <docker-image-tag>"
    echo "Options:"
    echo "  -a, --all          Run all build processes"
    echo "  -d, --dependencies Install dependencies"
    echo "  -s, --service      Build movies-service"
    echo "  -u, --ui           Build movies-ui"
    echo "  -t, --tag          Tag Docker images"
    exit 1
}

# Parse command-line options
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -a|--all) RUN_ALL=true ;;
        -d|--dependencies) RUN_DEPENDENCIES=true ;;
        -s|--service) RUN_SERVICE=true ;;
        -u|--ui) RUN_UI=true ;;
        -t|--tag) RUN_TAG=true ;;
        *) DOCKER_IMAGE_TAG=$1 ;;
    esac
    shift
done

# Check if the tag argument is provided
if [ -z "$DOCKER_IMAGE_TAG" ]; then
    echo "Error: Docker image tag not provided."
    usage
fi

# Prompt for sudo password
echo "Enter sudo password:"
read -s SUDO_PASSWORD
echo

# Run the specified processes
if [ -z "$RUN_ALL" ] && [ -z "$RUN_DEPENDENCIES" ] && [ -z "$RUN_SERVICE" ] && [ -z "$RUN_UI" ] && [ -z "$RUN_TAG" ]; then
    echo "Error: No build processes specified."
    usage
fi

if [ -n "$RUN_DEPENDENCIES" ] || [ -n "$RUN_ALL" ]; then
    # Install dependencies
    npm ci
fi

if [ -n "$RUN_SERVICE" ] || [ -n "$RUN_ALL" ]; then
    # Build the movies-service
    npx nx run movies-service:build
fi

if [ -n "$RUN_UI" ] || [ -n "$RUN_ALL" ]; then
    # Build the movies-ui
    npx nx run movies-ui:build
fi

if [ -n "$RUN_TAG" ] || [ -n "$RUN_ALL" ]; then
    # Build and tag the movies-service Docker image
    run_sudo docker build -t jaxx/movies-service:$DOCKER_IMAGE_TAG . -f movies-service.Dockerfile

    # Build and tag the movies-ui Docker image
    run_sudo docker build -t jaxx/movies-ui:$DOCKER_IMAGE_TAG . -f movies-ui.Dockerfile
fi

echo "Docker images built and tagged with: $DOCKER_IMAGE_TAG"
