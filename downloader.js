const axios = require('axios');

module.exports = (url) => {
  return new Promise((resolve) => {
    axios({
      url: url,
      method: 'GET',
      resposeType: 'stream'
    }).then((response) => {
      resolve(response.data); 
    });
  });
}