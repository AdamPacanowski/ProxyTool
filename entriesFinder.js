const childProcess = require('child_process');
const fileGetter = require('./fileGetter');
const downloader = require('./downloader');
const config = require('./config.json');

const entries = config;

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

  if (entryFound.commandBefore) {
    childProcess.execSync(entryFound.commandBefore.command, {
      cwd: entryFound.commandBefore.cwd
    });
  }

  const result = {
    body: undefined,
    headers: undefined
  };

  if (entryFound.headers) {
    result.headers = entryFound.headers;
  }

  let fetching;

  if (entryFound.urlToDownload) {
    fetching = new Promise(resolve => {
      downloader(entryFound.urlToDownload).then(body => {
        result.body = body;

        resolve(result);
      });
    });
  } else {
    if (entryFound.pathToFile) {
      result.body = fileGetter(entryFound.pathToFile);    
    }
  
    if (entryFound.body) {
      result.body = entryFound.body;
    }

    fetching = Promise.resolve(result);
  }

  return fetching;
};
