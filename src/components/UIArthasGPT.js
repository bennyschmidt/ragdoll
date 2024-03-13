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
  CREATING_AGENT,
  GOODBYE,
  BYE,
  EXIT,
  languageModel,
  gptLogPrefix,
  waiting,
  placeholder,
  povPromptPrefix
} from '../utils/strings.js';

// Persona configs

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

let agent;

const UIArthasGPT = async greeting => {
  const ui = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Greeting

  if (greeting) {
    if (isVerbose) {
      log(CREATING_AGENT);
    }

    agent = await ArthasGPT(
      KNOWLEDGE_URI,
      greeting,
      isCacheEnabled
    );
  }

  // Prompt user

  const promptUser = async input => {
    const inputLowerCase = input.toLowerCase();

    if (inputLowerCase === BYE || inputLowerCase === EXIT) {
      log(GOODBYE);
      process.exit();
    }

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
        log(`${languageModel} responded with "${messageResponse}".`);
        log(waiting);
      }

      await delay(DELAY);
    }

    if (agent) {
      await agent.chat(messageResponse);
    } else {
      if (isVerbose) {
        log(CREATING_AGENT);
      }

      agent = await ArthasGPT(
        KNOWLEDGE_URI,
        messageResponse,
        true
      );
    }

    ui.question(placeholder, promptUser);
  };

  ui.question(placeholder, promptUser);
};

export {
  UIArthasGPT
};
