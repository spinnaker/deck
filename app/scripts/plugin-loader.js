import { Registry } from '@spinnaker/core';

// This method appends the plugin script location to the bottom of
// the page to load the plugin
function loadPluginScript(plugin) {
  return new Promise((resolve, reject) => {
    var scriptTag = document.createElement('script');
    scriptTag.src = plugin.location;
    scriptTag.onload = () => resolve();
    scriptTag.onreadystatechange = () => resolve();
    scriptTag.onerror = () => reject();
    document.body.appendChild(scriptTag);
  });
}

// This method grabs all plugins that are defined in Spinnaker settings
// and then loops through all of them. It then calls the function above to
// appends a script tag to the page from where the plugin location and then
// initializes the plugin by passing in the registry for plugins to register
// themselves as stages
export function initPlugins() {
  const plugins = window.spinnakerSettings.plugins;
  window.spinnakerSettings.onPluginLoaded = plugin => plugin.initialize(Registry);
  return Promise.all(plugins.map(p => loadPluginScript(p)));
}
