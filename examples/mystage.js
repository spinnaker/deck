console.log('Test');

const plugin = {
  initialize: Registry => {
    console.log('Hello, I got: ', Registry);
    Registry.pipeline.registerStage({
      name: 'Test',
    });
  },
};

window.spinnakerSettings.onPluginLoaded(plugin);
