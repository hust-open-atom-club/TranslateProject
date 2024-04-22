#!/bin/sh

# do basic validate for metadata
validate() {
    metadata="$1"
    status=$(echo "$metadata" | yq '.status')
    collected_date=$(echo "$metadata" | yq '.collected_date')
    translated_date=$(echo "$metadata" | yq '.translated_date')
    translator=$(echo "$metadata" | yq '.translator')
    if [ "$status" != "translated" ];then
        echo "\033[31mThe status should be \"translated\" before commit!\033[0m"
        exit 1
    fi
    if [ "$translator" = "null" ];then
        echo "\033[31mFill metadata \"translator\" before commit!\033[0m"
        exit 1
    fi
    if [ "$translated_date" = "null" ]; then
        echo "\033[31mFill metadata \"translated_date\" before commit!\033[0m"
        exit 1
    fi
    if [ "$(("$translated_date" - "$collected_date"))" -lt 0 ];then
        echo "\033[31mThe \"translated_date\" should be later than \"collected_date\"!\033[0m"
        exit 1
    fi
}

command -v gh > /dev/null 2>&1

if [ $? != 0 ]; then
    echo "Please install gh first!"
    echo "See https://github.com/cli/cli#installation for details"
    exit 0
fi

command -v yq > /dev/null 2>&1

if [ $? != 0 ]; then
    echo "Please install yq first!"
    echo "See https://github.com/mikefarah/yq?tab=readme-ov-file#install for details"
    exit 0
fi

if [ $# -ne 1 ]; then
    echo "Please provide a markdown file as the 1st parameter!"
    exit 0
fi

metadata=$(sed -n '/^---$/,/^---$/p' "$1" | sed '/^---$/d')

validate "$metadata"

title="docs: finish translating $(echo "$metadata" | yq '.title')"

gh pr create --repo hust-open-atom-club/TranslateProject --title "$title" --body ""

if [ $? = 0 ]; then
    echo "The PR has been created successfully!"
else
    echo "The PR creation fails!"
fi
