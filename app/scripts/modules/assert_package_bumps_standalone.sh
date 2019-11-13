#!/bin/bash
# Reports if package bumps are combined with other changes (not allowed). Package bumps must be standalone.
# cd `dirname $0`;

PKGJSONCHANGED="Version change detected in package.json"
ONLYVERSIONCHANGED="Version change must be the only line changed in package.json"
ONLYPKGJSONCHANGED="package.json (in apps/scripts/modules) must be the only files changed in a pull request with version bumps"

echo "Merging from target branch to get minimal diff."
git merge upstream/master

for PKGJSON in `ls app/scripts/modules/*/package.json` ; do
  MODULE=`basename $(dirname $PKGJSON)`
  echo "==================================================="
  echo "Checking $MODULE"
  echo "==================================================="
  HAS_PKG_BUMP=`git diff upstream/master -- $PKGJSON | grep '"version"' | wc -l`
  if [ $HAS_PKG_BUMP -ne 0 ] ; then
    echo " [ YES  ] $PKGJSONCHANGED"

    # Ensuring that the version change is the only change in package.json
    PKG_JSON_OTHER_CHANGES=`git diff --numstat upstream/master -- $PKGJSON | cut -f 1`
    if [ $PKG_JSON_OTHER_CHANGES -ne 1 ] ; then
      echo " [ FAIL ] $ONLYVERSIONCHANGED"
      echo ""
      echo "=========================================="
      echo "Failure details (git diff of package.json)"
      echo "=========================================="
      echo ""
      git diff upstream/master -- $PKGJSON
      echo ""
      echo "=========================================="
      exit 2
    else
      echo " [ PASS ] $ONLYVERSIONCHANGED"
    fi

    # checking that the only files changed are apps/scripts/modules/*/package.json
    OTHER_FILES_CHANGED=`git diff --name-only upstream/master | grep -v "apps/scripts/modules/*/package.json" | wc -l`
    if [ $OTHER_FILES_CHANGED -ne 0 ] ; then
      echo " [ FAIL ] $ONLYPKGJSONCHANGED"
      echo ""
      echo "==========================================="
      echo "Failure details (list of all files changed)"
      echo "==========================================="
      echo ""
      git diff --name-only upstream/master
      echo ""
      echo "==========================================="
      exit 1
    else
      echo " [ PASS ] $ONLYPKGJSONCHANGED"
    fi
  else
    echo " [  NO  ] $PKGJSONCHANGED"
    echo " [  N/A ] $ONLYVERSIONCHANGED"
    echo " [  N/A ] $ONLYPKGJSONCHANGED"
  fi
  echo ""
done

