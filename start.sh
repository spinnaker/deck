#!/bin/bash

if [[ -z "$npm_package_engines_node" ]]; then
  echo "You are probably running this script without NPM. Try running 'npm start' from the Deck directory root."
  exit
fi

NODE_VERSION=$(node -v)

function update_node() {
  echo "Updating your node version to $npm_package_engines_node..."
  nvm use $npm_package_engines_node
  if [[ $? != 0 ]]; then
    echo "Installing node $npm_package_engines_node..."
    nvm install $npm_package_engines_node
  fi

  if [[ ! -f $PWD/.nvmrc ]]; then
    echo "Writing node $npm_package_engines_node to your .nvmrc..."
    echo $npm_package_engines_node > $PWD/.nvmrc
  elif [[ $(cat $PWD/.nvmrc) != $npm_package_engines_node ]]; then
    echo "WARNING: Your .nvmrc specifies node $(cat $PWD/.nvmrc)."
  fi
}

if [[ $NODE_VERSION != $npm_package_engines_node ]]; then
  if [[ -f /etc/profile.d/nvm.sh ]]; then
    . /etc/profile.d/nvm.sh
    update_node
  elif [[ -f $HOME/.nvm/nvm.sh ]]; then
    . $HOME/.nvm/nvm.sh
    update_node
  else
    echo "WARNING: could not update to node $npm_package_engines_node, nvm not found..."
  fi
fi

npm run start-dev-server
