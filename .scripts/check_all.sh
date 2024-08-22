#!/bin/bash
set -e

REPORT_MD="output/report.md"

# Get valid files in git diff (markdown files in sources/)
get_diff_article_files() {
  # Get the list of files in ./sources
  ARTICLES=$(find . -type f -name "*.md" | grep ^./sources)
  if [ -z "$ARTICLES" ]; then
    echo "No valid articles found in the repo. Skip checks."
    exit 0
  fi
}

init_cache() {
  mkdir -p .cache/users
  mkdir -p output
  echo "# Check Report" > "$REPORT_MD"
}

# Check if an id is a valid GitHub user using the GitHub API
check_github_user() {
  USER_ID=$1
  # Check if the user has already been searched
  if [ ! -f ".cache/users/$USER_ID" ]; then
    GITHUB_API="https://api.github.com/users/$USER_ID"
    RESPONSE_CODE=$(curl -s -o /dev/null -w "%{http_code}" $GITHUB_API)
    
    # Cache the result
    if [ $RESPONSE_CODE -eq 404 ]; then
      sleep 1
      echo 1 > ".cache/users/$USER_ID"
    elif [ $RESPONSE_CODE -eq 200 ]; then
      sleep 1
      echo 0 > ".cache/users/$USER_ID"
    fi
  fi
  cat ".cache/users/$USER_ID"
}

# Update error report
update_report() {
  MSG=$1
  ERROR="$ERROR$MSG"
  echo -e "\n\t- <font color=red>$MSG</font>" >> $REPORT_MD
}

# Check if published_date is in the front matter
check_published() {
  PUBLISHED_ARTICLE=$1
  PUBLISHER=$(yq -f extract '.publisher' "$PUBLISHED_ARTICLE")
  PUBLISHED_DATE=$(yq -f extract '.published_date' "$PUBLISHED_ARTICLE")
  if [ "$PUBLISHER" == "null" ] || [ "$PUBLISHED_DATE" == "null" ]; then
    update_report "Missing metadata in publisher/published_date; "
  else
    # No stage check needed for the final stage
    if [ $(check_github_user $PUBLISHER) -eq 1 ]; then
      update_report "Publisher is not a valid GitHub user; "
    fi
  fi
}

# Check if proofread_date is in the front matter
check_proofread() {
  PROOFREAD_ARTICLE=$1
  PROOFREAD_DATE=$(yq -f extract '.proofread_date' "$PROOFREAD_ARTICLE")
  if [ "$PROOFREAD_DATE" == "null" ]; then
    update_report "Missing metadata in proofread_date; "
  else
    # Check if proofread_date is earlier than published_date
    PUBLISHED_DATE=$(yq -f extract '.published_date' "$PROOFREAD_ARTICLE")
    if [ ! $PUBLISHED_DATE == "null" ] && [ $PUBLISHED_DATE -lt $PROOFREAD_DATE ]; then
      update_report "Published date is earlier than proofread date; "
    fi
  fi
}

# Check if proofreader is in the front matter for proofreading/proofread stage,
# and check if proofreader is a valid GitHub user in proofreading/proofread stage
check_proofreading() {
  PROOFREADING_ARTICLE=$1
  PROOFREADER=$(yq -f extract '.proofreader' "$PROOFREADING_ARTICLE")
  if [ "$PROOFREADER" == "null" ]; then
    update_report "Missing metadata in proofreader; "
  else
    if [ $(check_github_user $PROOFREADER) -eq 1 ]; then
      update_report "Proofreader is not a valid GitHub user; "
    fi
  fi
}

# Check if translated_date is in the front matter
check_translated() {
  TRANSLATED_ARTICLE=$1
  TRANSLATED_DATE=$(yq -f extract '.translated_date' "$TRANSLATED_ARTICLE")
  if [ "$TRANSLATED_DATE" == "null" ]; then
    update_report "Missing metadata in translated_date; "
  else
    # Check if translated_date is earlier than proofread_date
    PROOFREAD_DATE=$(yq -f extract '.proofread_date' "$TRANSLATED_ARTICLE")
    if [ ! $PROOFREAD_DATE == "null" ] && [ $PROOFREAD_DATE -lt $TRANSLATED_DATE ]; then
      update_report "Proofread date is earlier than translated date; "
    fi
  fi
}

# Check if translator is in the front matter for translating/translated stage,
# and check if translator is a valid GitHub user in translating/translated stage
check_translating() {
  TRANSLATING_ARTICLE=$1
  TRANSLATOR=$(yq -f extract '.translator' "$TRANSLATING_ARTICLE")
  if [ "$TRANSLATOR" == "null" ]; then
    update_report "Missing metadata in translator; "
  else
    if [ $(check_github_user $TRANSLATOR) -eq 1 ]; then
      update_report "Translator is not a valid GitHub user; "
    fi
  fi
}

# Check if collected_date, collector, title, and author are in the front matter,
# and check if collector is a valid GitHub user in collected stage
check_collected() {
  COLLECTED_ARTICLE=$1
  TITLE=$(yq -f extract '.title' "$COLLECTED_ARTICLE")
  AUTHOR=$(yq -f extract '.author' "$COLLECTED_ARTICLE")
  COLLECTOR=$(yq -f extract '.collector' "$COLLECTED_ARTICLE")
  COLLECTED_DATE=$(yq -f extract '.collected_date' "$COLLECTED_ARTICLE")
  LINK=$(yq -f extract '.link' "$COLLECTED_ARTICLE")
  if [ "$TITLE" == "null" ] || [ "$AUTHOR" == "null" ] || [ "$COLLECTOR" == "null" ] || [ "$COLLECTED_DATE" == "null" ] || [ "$LINK" == "null" ]; then
    update_report "Missing metadata in title/author/collector/collected_date/link; "
  else
    # Check if collected_date is earlier than translated_date
    TRANSLATED_DATE=$(yq -f extract '.translated_date' "$COLLECTED_ARTICLE")
    if [ ! $TRANSLATED_DATE == "null" ] && [ $TRANSLATED_DATE -lt $COLLECTED_DATE ]; then
      update_report "Translated date is earlier than collected date; "
    fi
    if [ $(check_github_user $COLLECTOR) -eq 1 ]; then
      update_report "Collector is not a valid GitHub user; "
    fi
  fi
}

CHECK_PASSED=1 # To check if all the articles pass
get_diff_article_files
init_cache
while IFS= read -r ARTICLE; do
  echo "Checking article: $ARTICLE"
  ERROR=""
  STATUS=$(yq -f extract '.status' "$ARTICLE")
  # Write the article name and status to the report
  echo -e "\n## $ARTICLE\n- Status: $STATUS\n- Error: " >> $REPORT_MD
  case $STATUS in
    "published")
      check_published "$ARTICLE"
      ;& # Fallthrough to ensure low stage checks will run on articles in higher stages
    "proofread")
      check_proofread "$ARTICLE"
      ;&
    "proofreading")
      check_proofreading "$ARTICLE"
      ;&
    "translated")
      check_translated "$ARTICLE"
      ;&
    "translating")
      check_translating "$ARTICLE"
      ;&
    "collected")
      check_collected "$ARTICLE"
      ;;
    *)
      ERROR="Invalid status: $STATUS"
      ;;
  esac
  # Print log for each article
  if [ -z "$ERROR" ]; then
    echo "  ✨ All checks passed for $STATUS $ARTICLE"
    echo "no error" >> $REPORT_MD
  else
    echo "  😭 Some checks failed for $STATUS $ARTICLE: $ERROR"
    echo -e "\n- <font color=red>Need to be fixed</font>" >> $REPORT_MD
    CHECK_PASSED=0
  fi
done <<< "$ARTICLES"
# Print overall result
if [ $CHECK_PASSED -eq 0 ]; then
  echo "❌ Some checks failed. Please find report in artifacts and fix the article(s)."
else
  echo "✅ All checks passed. The repo is safe."
fi

exit 0

