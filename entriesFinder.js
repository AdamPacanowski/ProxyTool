const childProcess = require('child_process');
const Ajv = require('ajv');
const fileGetter = require('./fileGetter');
const downloader = require('./downloader');

const config = require('./config.json');
const jsonSchema = require('./schema.json');


const entries = config;

const ajv = new Ajv({
  strictTypes: false
});

const validate = ajv.compile(jsonSchema);
const valid = validate(config);

if (!valid) {
  console.error(validate.errors);
  process.exit(1);
}

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
    try {
      childProcess.execSync(entryFound.commandBefore.command, {
        cwd: entryFound.commandBefore.cwd
      });
    } catch (e) {
      console.error('Error during command run.');
    }
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
