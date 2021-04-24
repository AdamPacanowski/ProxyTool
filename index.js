const ProxyChain = require('proxy-chain');
const entriesFinder = require('./entriesFinder');

const PORT = 8000;

const server = new ProxyChain.Server({ 
  port: PORT, 
  prepareRequestFunction: ({ request, username, password, hostname, port, isHttp }) => {
    const url = ProxyChain.parseUrl(request.url);
    let result;

    try {
      result = entriesFinder(url);
    }
    catch (e) {
      console.error(e);
    }

    if (!result) {
      return undefined;
    }

    return {
      customResponseFunction: () => {
        return {
          statusCode: 200,
          body: result.body,
          headers: result.headers
        };
      }
    };
  }
});

server.listen(() => {
  console.log(`Proxy server is listening on port ${ PORT }`);
});