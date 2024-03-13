import dotenv from 'dotenv';

dotenv.config();

const {
  VERBOSE,
  LOG_PREFIX
} = process.env;

let isVerbose = VERBOSE === 'false' ? false : VERBOSE;

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

export {
  isVerbose,
  log,
  delay
};
