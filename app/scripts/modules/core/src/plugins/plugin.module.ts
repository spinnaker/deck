import { module } from 'angular';
import { UIRouter } from '@uirouter/core';
import { PluginRegistry } from 'core/plugins/plugin.registry';

export const PLUGINS_MODULE = 'netflix.spinnaker.plugins';
module(PLUGINS_MODULE, ['ui.router']).config([
  '$uiRouterProvider',
  async ($uiRouterProvider: UIRouter) => {
    const pluginRegistry = new PluginRegistry();

    // Tell the router to slow its roll
    $uiRouterProvider.urlService.deferIntercept();

    // Grab all plugins that are defined in plugin-manifest
    // The format for plugin-manifest would be:
    //    const PLUGINS = [{'name':'myPlugin', 'version':'1.2.3', 'devUrl':'/plugins/index.js'}]
    //    export { PLUGINS }
    try {
      const pluginManifestLocation = '/plugin-manifest.js';
      const pluginModule = await import(/* webpackIgnore: true */ pluginManifestLocation);

      if (!pluginModule || !pluginModule.PLUGINS) {
        throw new Error(`Error loading plugins.`);
      } else {
        // @ts-ignore
        pluginModule.PLUGINS.forEach(plugin => pluginRegistry.register(plugin));
      }
    } catch (error) {
      console.error('No plugins found.');
    }

    try {
      // Load and initialize them
      await pluginRegistry.loadPlugins();
    } finally {
      // When done, tell the router to initialize
      $uiRouterProvider.urlService.listen();
      $uiRouterProvider.urlService.sync();
    }
  },
]);
