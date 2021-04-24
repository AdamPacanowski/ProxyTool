const fs = require('fs');

module.exports = (pathToFile) => {
  return fs.readFileSync(pathToFile).toString();
};
