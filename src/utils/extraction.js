const textract = require('textract');

const extractFromURL = url => new Promise((resolve, reject) => {
  textract.fromUrl(url, (error, text) => {
    if (error) {
      reject({ error, text });
    } else {
      resolve({ error, text });
    }
  });
});

module.exports = {
  extractFromURL
};
