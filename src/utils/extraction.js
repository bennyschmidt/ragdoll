const textract = require('textract');

const extractFromURL = url => new Promise((resolve, reject) => {
  textract.fromUrl(url, (error, text) => {
    if (err !== null) {
      reject(error);
    } else {
      resolve(text);
    }
  });
});

module.exports = {
  extractFromURL
};
