const { get, has } = require('lodash');

const assertJsonFile = (report, filename, json) => {
  return function assertJsonFile(field, expectedValue) {
    if (expectedValue === DELETED_FIELD) {
      const ok = !has(json, field);
      const resolution = {
        description: `Delete ${field} in ${filename}`,
        command: `npx write-json --delete "${filename}" "${field}"`,
      };
      report(`Unexpected property in ${filename}: ${field}`, ok, resolution);
    } else {
      const currentValue = get(json, field);
      const resolution = {
        description: `Change ${field} in ${filename} from "${currentValue}" to "${expectedValue}"`,
        command: `npx write-json "${filename}" "${field}" "${expectedValue}"`,
      };
      const ok = currentValue === expectedValue;
      report(`Unexpected value in ${filename}: ${field} should be "${expectedValue}"`, ok, resolution);
    }
  };
};

const DELETED_FIELD = {};
module.exports = { assertJsonFile, DELETED_FIELD };
