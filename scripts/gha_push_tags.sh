#!/usr/bin/env bash
# If the last commit was a package bump,
if [[ $(git log -1 --pretty=%B | head -n 1) == 'chore(package): bump packages' ]] ; then
  BUMPS=$(git log -1 --pretty=%B | grep "^ - " | sed -e 's/^ - //');
  for TAG in $BUMPS ; do
    git tag $TAG
    git push origin $TAG
  done
fi
