const { getBaseConfig } = require('../base.webpack.config');
const baseConfig = getBaseConfig('spot');

module.exports = {
  ...baseConfig,
  externals: [...baseConfig.externals, '@spinnaker/core'],
};
