import { Registry } from '@spinnaker/core';

function loadPluginScript(href) {
  return new Promise((resolve, reject) => {
    var scriptTag = document.createElement('script');
    scriptTag.src = href;
    scriptTag.onload = () => resolve();
    scriptTag.onreadystatechange = () => resolve();
    scriptTag.onerror = () => reject();
    document.body.appendChild(scriptTag);
  });
}

export function initPlugins() {
  const plugins = window.spinnakerSettings.plugins;
  window.spinnakerSettings.onPluginLoaded = plugin => plugin.initialize(Registry);
  return Promise.all(plugins.map(p => loadPluginScript(p)));
}
