const fs = require('fs');

const styleguideColors = fs.readFileSync('./app/scripts/modules/core/src/styleguide/src/styles/colors.css', 'utf-8');

let colorMap = {};
styleguideColors.split('\n').forEach(line => {
  const colorVarRegex = /(--[A-Za-z0-9-]+)\:\s*(#[A-Za-z0-8]{6})/;
  const colorItems = line.match(colorVarRegex);
  if (colorItems && colorItems.length) {
    const colorVar = colorItems[1];
    const colorHex = colorItems[2];

    if (colorVar && colorHex) {
      colorMap[colorHex] = colorVar;
    }
  }
});
console.log('---------- Before starting postcss run --------------');
module.exports = {
    plugins: {
        'autoprefixer': {},
        'postcss-colorfix': {
          colors: colorMap
        }
    }
}
