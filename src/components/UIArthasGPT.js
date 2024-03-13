import dotenv from 'dotenv';
import readline from 'readline';
import { OpenAIAgent } from 'llamaindex';

// Storage utils

import {
  isCacheEnabled,
  remember,
  recall
} from '../utils/storage.js';

// Output utils

import {
  isVerbose,
  log,
  delay
} from '../utils/output.js';

// Human-readable strings

import {
  LOADED_CACHED_QUESTION,
  gptVersion,
  gptLogPrefix,
  waiting,
  placeholder,
  povPromptPrefix
} from '../utils/strings.js';

import { KNOWLEDGE_URI } from '../utils/persona.js';

import { ArthasGPT } from './ArthasGPT.js';

dotenv.config();

const { DELAY } = process.env;

/* * * * * * * * * * * * * * * * * * * *
 *                                     *
 * UIArthasGPT                         *
 *                                     *
 * Interface layer (based on readline) *
 * for ArthasGPT.                      *
 *                                     *
 * * * * * * * * * * * * * * * * * * * */

const UIArthasGPT = async (greeting = false) => {
  const ui = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Greeting

  if (greeting) {
    await ArthasGPT(
      KNOWLEDGE_URI,
      greeting,
      isCacheEnabled
    );
  }

  // Prompt user

  ui.question(placeholder, async input => {
    const chatAgent = new OpenAIAgent({});

    // Create prompt transforming the user input into the third-person

    let message = `${povPromptPrefix} ${input}`;
    let messageResponse;

    const messageCache = recall(input);

    if (messageCache) {
      if (isVerbose) {
        log(LOADED_CACHED_QUESTION);
      }

      messageResponse = messageCache;
    } else {
      if (isVerbose) {
        log(`${gptLogPrefix} ${message}`);
      }

      const { response: gptResponse } = await chatAgent.chat({
        message
      });

      messageResponse = gptResponse;

      remember(input, messageResponse);

      if (isVerbose) {
        log(`${gptVersion} responded with "${messageResponse}".`);
        log(waiting);
      }

      await delay(DELAY);
    }

    await ArthasGPT(
      KNOWLEDGE_URI,
      messageResponse,
      true
    );

    ui.close();
    UIArthasGPT();
  });
};

export {
  UIArthasGPT
};
