const dotenv = require('dotenv');

dotenv.config();

const {
  VERBOSE,
  RENDER,
  LOG_PREFIX
} = process.env;

// Note that DALL-E 2 has specific size requirements.
// Learn more at https://openai.com/dall-e-2

const IMAGE_SIZE = 1024;
const IMAGE_QUALITY = 'standard';

const isVerbose = VERBOSE === 'false' ? false : VERBOSE;
const isRendered = RENDER === 'true';

/* * * * * * * * * * * * * * * * * * * *
 *                                     *
 * log                                 *
 *                                     *
 * Simple wrapper for `console.log` to *
 * prefix/timestamp statements.        *
 *                                     *
 * text: string                        *
 *                                     *
 * * * * * * * * * * * * * * * * * * * */

const log = text => console.log(`${LOG_PREFIX} ${text}`);

/* * * * * * * * * * * * * * * * * * * *
 *                                     *
 * delay                               *
 *                                     *
 * Simple Promise wrapper to delay the *
 * execution (rate limits, artificial  *
 * pauses, etc.)                       *
 *                                     *
 * ms: number                          *
 *                                     *
 * * * * * * * * * * * * * * * * * * * */

const delay = ms => new Promise(res => setTimeout(res, ms));

module.exports = {
  IMAGE_SIZE,
  IMAGE_QUALITY,
  isRendered,
  isVerbose,
  log,
  delay
};
