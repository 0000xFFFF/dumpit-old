#!/bin/bash
source p3env/bin/activate

if [ -z "$VIRTUAL_ENV" ]; then
    echo "Not inside a virtual environment. Exiting..."
    exit 1
else
    echo "Inside a virtual environment. Proceeding..."
fi


mkdir -p uploads
ORIGINAL_USER="$(whoami)"

echo "Starting server..."
sudo ./server.py -u "$ORIGINAL_USER"
