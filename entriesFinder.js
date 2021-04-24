const fileGetter = require('./fileGetter');

const entries = {
  'pacanowski.me': [{
    pathRegex: '\.js',
    pathToFile: 'C:\\Software\\ProxyTool\\index.js',
    headers: {
      'Content-Type': 'application/javascript'
    }
  }, {
    pathRegex: '\.css',
    body: null
  }]
};

module.exports = (url) => {
  const hostEntries = entries[url.host];

  if (!hostEntries) {
    console.error(`Entry for ${ url.host } not found.`);

    return null;
  }

  const entryFound = hostEntries.reduce((currentResult, entry) => {
    if (currentResult) {
      return currentResult;
    }

    const re = new RegExp(entry.pathRegex);
    const reMatch = url.pathname.match(re);
    
    if (reMatch) {
      return entry;
    }

    return currentResult;
  }, null);

  console.log(url.href, entryFound);

  if (!entryFound) {
    return null;
  }

  const result = {
    body: undefined,
    headers: undefined
  };

  if (entryFound.headers) {
    result.headers = entryFound.headers;
  }

  if (entryFound.pathToFile) {
    result.body = fileGetter(entryFound.pathToFile);    
  }

  if (entryFound.body) {
    result.body = entryFound.body;
  }

  return result;
};
