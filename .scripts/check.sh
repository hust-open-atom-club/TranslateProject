#!/bin/bash

# Get valid files in git diff (markdown files in sources/)
get_diff_article_files() {
  FILES=$(cat $DIFF_JSON | yq e '.files[].path' - )
  ARTICLES=''
  for FILE in $FILES; do
    if [[ "$FILE" == sources/*.md ]]; then
      ARTICLES="$ARTICLES $FILE"
    fi
  done
  if [ -z "$ARTICLES" ]; then
    echo "No valid articles found in the PR. Skip checks."
    exit 0
  fi
}

# Check if proofread_date is in the front matter
check_proofread() {
  PROOFREAD_ARTICLE=$1
  PROOFREAD_DATE=$(yq -f extract '.proofread_date' $PROOFREAD_ARTICLE)
  if [ "$PROOFREAD_DATE" == "null" ]; then
    ERROR=$ERROR"Missing metadata in proofread_date; "
  fi
}

# Check if proofreader is in the front matter for proofreading/proofread stage,
# and check if proofreader is the same as the PR opener in proofreading/proofread stage
check_proofreading() {
  PROOFREADING_ARTICLE=$1
  PROOFREADER=$(yq -f extract '.proofreader' $PROOFREADING_ARTICLE)
  if [ "$PROOFREADER" == "null" ]; then
    ERROR=$ERROR"Missing metadata in proofreader; "
  else
    if [ "$STATUS" == "proofreading" ] || [ "$STATUS" == "proofread" ]; then
      if [ "$PROOFREADER" != "$ACTOR_ID" ]; then
        ERROR=$ERROR"Proofreader is not the same as the PR opener; "
      fi
    fi
  fi
}

# Check if translated_date is in the front matter
check_translated() {
  TRANSLATED_ARTICLE=$1
  TRANSLATED_DATE=$(yq -f extract '.translated_date' $TRANSLATED_ARTICLE)
  if [ "$TRANSLATED_DATE" == "null" ]; then
    ERROR=$ERROR"Missing metadata in translated_date; "
  fi
}

# Check if translator is in the front matter for translating/translated stage,
# and check if translator is the same as the PR opener in translating/translated stage
check_translating() {
  TRANSLATING_ARTICLE=$1
  TRANSLATOR=$(yq -f extract '.translator' $TRANSLATING_ARTICLE)
  if [ "$TRANSLATOR" == "null" ]; then
    ERROR=$ERROR"Missing metadata in translator; "
  else
    if [ "$STATUS" == "translating" ] || [ "$STATUS" == "translated" ]; then
      if [ "$TRANSLATOR" != "$ACTOR_ID" ]; then
        ERROR=$ERROR"Translator is not the same as the PR opener; "
      fi
    fi
  fi
}

# Check if collected_date, collector, title, and author are in the front matter,
# and check if collector is the same as the PR opener in collected stage
check_collected() {
  COLLECTED_ARTICLE=$1
  TITLE=$(yq -f extract '.title' $COLLECTED_ARTICLE)
  AUTHOR=$(yq -f extract '.author' $COLLECTED_ARTICLE)
  COLLECTOR=$(yq -f extract '.collector' $COLLECTED_ARTICLE)
  COLLECTED_DATE=$(yq -f extract '.collected_date' $COLLECTED_ARTICLE)
  LINK=$(yq -f extract '.link' $COLLECTED_ARTICLE)
  if [ "$TITLE" == "null" ] || [ "$AUTHOR" == "null" ] || [ "$COLLECTOR" == "null" ] || [ "$COLLECTED_DATE" == "null" ] || [ "$LINK" == "null" ]; then
    ERROR=$ERROR"Missing metadata in title/author/collector/collected_date/link; "
  else
    if [ "$STATUS" == "collected" ]; then
      if [ "$COLLECTOR" != "$ACTOR_ID" ]; then
        ERROR=$ERROR"Collector is not the same as the PR opener; "
      fi
    fi
  fi
}

CHECK_PASSED=1 # To check if all the articles pass
get_diff_article_files
for ARTICLE in $ARTICLES; do
  echo "Checking article: $ARTICLE"
  ERROR=""
  STATUS=$(yq -f extract '.status' $ARTICLE)
  case $STATUS in
    "published")
      # No specific check for published articles
      ;& # Fallthrough to ensure low stage checks will run on articles in higher stages
    "proofread")
      check_proofread $ARTICLE
      ;&
    "proofreading")
      check_proofreading $ARTICLE
      ;&
    "translated")
      check_translated $ARTICLE
      ;&
    "translating")
      check_translating $ARTICLE
      ;&
    "collected")
      check_collected $ARTICLE
      ;;
    *)
      ERROR="Invalid status: $STATUS"
      ;;
  esac
  # Printlog for each article
  if [ -z "$ERROR" ]; then
    echo "  ✨ All checks passed for $STATUS $ARTICLE"
  else
    echo "  😭 Some checks failed for $STATUS $ARTICLE: $ERROR"
    CHECK_PASSED=0
  fi
done
# Print overall result
if [ $CHECK_PASSED -eq 0 ]; then
  echo "❌ Some checks failed. Please fix the article(s) before merging the PR."
  exit 1
else
  echo "✅ All checks passed. You can merge the PR now."
  exit 0
fi

