#!/bin/bash
# Created by QGrain in 2024/07/15

# Usage:
# 1) check all of the markdown files under sources/syzkaller/:
#    $ ./check_for_syzkaller.sh
# 2) check one specified markdown file though the first param:
#    $ ./check_for_syzkaller.sh sources/syzkaller/syscall_descriptions_syntax.md

check_whitespace() {
    FILES=0
	FAILED=""
	RE="[[:space:]]$"
	LAST_EMPTY=""
    if [[ $1 ]]; then
        file_list="$1"
    else
        file_list=$(find . -name "*.md" | grep "syzkaller/")
    fi
	for F in $file_list; do
		((FILES+=1))
		L=0
		while IFS= read -r LINE; do
			((L+=1))
			if [[ $LINE =~ $RE ]]; then
				echo "$F:$L:1: Trailing whitespace at the end of the line. Please remove."
				echo "$LINE"
				FAILED="1"
			fi
			LAST_EMPTY=""
			if [ "$LINE" == "" ]; then
				LAST_EMPTY="1"
			fi
		done < "$F"
		if [ "$LAST_EMPTY" != "" ]; then
			echo "$F:$L:1: Trailing empty line at the end of the file. Please remove."
			FAILED="1"
		fi
	done
	if [ "$FAILED" != "" ]; then
		echo -e "❌ check_whitespace failed. Please fix the lines shown above."
		return 1
	else
		echo -e "✅ check_whitespace passed."
		return 0
	fi
}


check_language() {
	FILES=0
	FAILED=""
	shopt -s nocasematch
    if [[ $1 ]]; then
        file_list="$1"
    else
        file_list=$(find . -name "*.md" | grep "syzkaller/")
    fi
	for F in $file_list; do
		((FILES+=1))
		L=0
		while IFS= read -r LINE; do
			((L+=1))
			if [[ $LINE =~ (slave|blacklist|whitelist) ]]; then
				if [[ $LINE =~ bond_enslave ]]; then
					continue
				fi
				SUGGESTIONS="block/allow/ignore/skip"
				if [[ $LINE =~ (slave) ]]; then
					SUGGESTIONS="leader/follower/coordinator/worker/parent/helper"
				fi
				echo "$F:$L:1: Please use more respectful terminology, consider using ${SUGGESTIONS} instead." \
					"See https://tools.ietf.org/id/draft-knodel-terminology-01.html for more info."
				echo "$LINE"
				FAILED="1"
			fi
		done < "$F"
	done
	if [ "$FAILED" != "" ]; then
		echo -e "❌ check_language failed. There may be some offensive or illegal words in the lines shown above."
		return 1
	else
		echo -e "✅ check_language passed."
		return 0
	fi
}


script_dir=$(dirname $0)
ERROR=""


check_whitespace $1
if [[ $? != 0 ]]; then
    ERROR="1"
    echo -e "whitespace failed: $ERROR"
fi


check_language $1
if [[ $? != 0 ]]; then
    ERROR="1"
fi

if [[ $1 ]]; then
    file_list="$1"
else
    file_list=$(find . -name "*.md" | grep "syzkaller/")
fi
python3 $script_dir/check_links.py ~/fuzzers/syzkaller-fork/ $file_list
if [[ $? == 0 ]]; then
    echo -e "✅ check_links passed."
else
    echo -e "❌ check_links failed."
    ERROR="1"
fi

if [ "$ERROR" != "" ]; then
    echo -e "[Summary] some checks failed. It cannot be pushed to syzkaller upstream"
    exit 1
else
    echo -e "[Summary] all checks passed. It can be pushed to syzkaller upstream now."
    exit 0
fi