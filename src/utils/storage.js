const { LocalStorage } = require('node-localstorage');

const dotenv = require('dotenv');

dotenv.config();

const {
  CACHE,
  MAX_STORAGE_KEY_LENGTH,
  STORAGE_URI
} = process.env;

// Cache settings

const localStorage = new LocalStorage(STORAGE_URI);

let isCacheEnabled = CACHE === 'false' ? false : CACHE;

/* * * * * * * * * * * * * * * * * * * *
 *                                     *
 * remember                            *
 *                                     *
 * Simple wrapper to save correlating  *
 * queries, prompts, and GPT/DALL-E    *
 * responses to storage, if cache is   *
 * enabled.                            *
 *                                     *
 * key: string                         *
 * value: string                       *
 *                                     *
 * * * * * * * * * * * * * * * * * * * */

const remember = (key, value) => {
  if (isCacheEnabled) {
    localStorage.setItem(key.slice(0, MAX_STORAGE_KEY_LENGTH), value);
  }
};

/* * * * * * * * * * * * * * * * * * * *
 *                                     *
 * forget                              *
 *                                     *
 * Simple wrapper to clear storage.    *
 *                                     *
 * * * * * * * * * * * * * * * * * * * */

const forget = () => localStorage.clear();

/* * * * * * * * * * * * * * * * * * * *
 *                                     *
 * recall                              *
 *                                     *
 * Simple wrapper to read storage or   *
 * return `false`, if cache is         *
 * enabled.                            *
 *                                     *
 * key: string                         *
 *                                     *
 * * * * * * * * * * * * * * * * * * * */

const recall = key => (
  isCacheEnabled && localStorage.getItem(key.slice(0, MAX_STORAGE_KEY_LENGTH))
);

module.exports = {
  isCacheEnabled,
  remember,
  recall,
  forget
};
