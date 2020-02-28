#!/bin/bash
SCRIPTDIR="$(dirname "$0")";

GITHUB="https://github.com/spinnaker/deck"
GITHUB=$(echo "$GITHUB" | sed -e 's/\//\\\//g')

PACKAGEJSON=$1;
if [[ "$PACKAGEJSON" == "" || ! -e "$PACKAGEJSON" ]] ; then
  echo "Shows what commits have been made between two package bumps";
  echo "usage:   $0 <path-to-package-json> [startVersion] [endVersion] [--expand-links]";
  echo;
  echo "example: show changelog since the last published version (unpublished commits)";
  echo "$0 core/package.json";
  echo;
  echo "example: show changelog between a specific version and HEAD";
  echo "$0 core/package.json 0.0.356";
  echo;
  echo "example: show the changelog between two specific versions";
  echo "$0 core/package.json 0.0.355 0.0.356";
  exit 2;
fi

STARTVERSION=$2;
ENDVERSION=$3;
STARTSHA=HEAD
ENDSHA=HEAD

while (( $# )) ; do
    case $1 in
        --expand-links) EXPANDLINKS=true ;;
    esac
    shift
done

# Find the starting SHA
if [[ -z $STARTVERSION ]] ; then
  STARTSHA=$($SCRIPTDIR/show_package_bumps.js "$PACKAGEJSON" | head -n 1 | awk '{ print $1; }')
else
  STARTSHA=$($SCRIPTDIR/show_package_bumps.js "$PACKAGEJSON" | grep "${STARTVERSION}" | awk '{ print $1; }')
fi

# Find the ending SHA
if [[ ! -z $ENDVERSION ]] ; then
  ENDSHA=$($SCRIPTDIR/show_package_bumps.js "$PACKAGEJSON" | grep "${ENDVERSION}" | awk '{ print $1; }')
fi

if [[ -z "$STARTSHA" || -z "$ENDSHA" ]] ; then
  echo "fatal: Could not determine start and end shas.";
  exit 5
fi

if [[ "$EXPANDLINKS" == "true" ]] ; then
  git --no-pager log --pretty=oneline "${STARTSHA}..${ENDSHA}" "$(dirname "$PACKAGEJSON")" | \
    # Use full URL for commit link
    sed -e "s/^/$GITHUB\/commit\//" | \
    # Use full URL for pull link
    sed -e "s/(\#\([0-9][0-9]*\))$/($GITHUB\/pull\/\1)/g" | \
    # Move commit to the end
    sed -e "s/^\([^ ]*\) \(.*\)/\2 \1/g" ;
else
  git --no-pager log --pretty=oneline "${STARTSHA}..${ENDSHA}" "$(dirname "$PACKAGEJSON")";
fi
