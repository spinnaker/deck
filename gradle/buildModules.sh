#!/bin/bash -e

# Params to be passed in
MODULES_TO_BE_BUILT=("$@")  # optional, if no list of modules are provided, we'll go do all of them except SKIPPED_MODULES

cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)


# go find all the modules and add them
if [[ ${#MODULES_TO_BE_BUILT[0]} -eq 0 ]]; then
  SKIPPED_MODULES=("dcos")  # skip modules if no list of modules to build is provided

  for MODULE_PATH in app/scripts/modules/* ; do
    MODULE=$(basename ${MODULE_PATH})

    if [[ " ${SKIPPED_MODULES[@]} " =~ " ${MODULE} " ]]; then
      echo "Skipping module '${MODULE}' because it's not currently setup for module builds"
      continue
    fi

    if [[ ! -d ${MODULE_PATH} ]]; then
      continue
    fi

    MODULES_TO_BE_BUILT+=("${MODULE}")
  done
fi

echo "Modules found: ${MODULES_TO_BE_BUILT[@]}"

# make sure each module is buildable (which lints)
for MODULE in ${MODULES_TO_BE_BUILT[@]}; do
  echo "Building module '${MODULE}'..."
  cd ${PROJECT_ROOT}/app/scripts/modules/${MODULE}
  yarn lib
done
