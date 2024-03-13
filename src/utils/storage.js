import { LocalStorage } from 'node-localstorage';

import dotenv from 'dotenv';

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

const remember = async (key, value) => {
  if (isCacheEnabled) {
    await localStorage.setItem(key.slice(0, MAX_STORAGE_KEY_LENGTH), value);
  }
};

/* * * * * * * * * * * * * * * * * * * *
 *                                     *
 * forget                              *
 *                                     *
 * Simple wrapper to clear storage.    *
 *                                     *
 * * * * * * * * * * * * * * * * * * * */

const forget = async () => localStorage.clear();

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

export {
  isCacheEnabled,
  remember,
  recall,
  forget
};
