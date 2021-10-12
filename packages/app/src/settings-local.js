/*
  Provides a hook for mutating settings.js, primarily for users of Halyard.
  e.g.,
  window.spinnakerSettings.defaultInstancePort = 8080;
*/
function set(obj, path, val) {
  const segments = path.split('.');
  const lastSegment = segments.pop();
  var current = obj;
  segments.forEach((s) => {
    current[s] = current[s] || {};
    current = current[s];
  });
  current[lastSegment] = val;
}

set(window.spinnakerSettings, 'providers.aws.serverGroups.enableLaunchTemplates', true);
set(window.spinnakerSettings, 'providers.aws.serverGroups.enableIPv6', true);
set(window.spinnakerSettings, 'providers.aws.serverGroups.enableIMDSv2', true);
set(window.spinnakerSettings, 'providers.aws.serverGroups.enableCpuCredits', true);
