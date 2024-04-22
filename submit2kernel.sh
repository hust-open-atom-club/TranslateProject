#!/bin/sh

if [ $# -ne 1 || ]; then
    echo "Please provide a patch as the 1st parameter!"
    exit 0
fi

git send-email \
    --to-cmd="$(pwd)/scripts/get_maintainer.pl --nogit --nogit-fallback --norolestats --nol" \
    --cc-cmd="$(pwd)/scripts/get_maintainer.pl --nogit --nogit-fallback --norolestats --nom" \
    --cc="hust-os-kernel-patches@googlegroups.com" \
    --confirm=always \
    "$1"
    

if [ $? = 0 ]; then
    echo "The patch has been sent successfully!"
else
    echo "The patch sending fails!"
fi