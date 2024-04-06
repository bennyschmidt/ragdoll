const dotenv = require('dotenv');
const readline = require('readline');
const { Ollama } = require('llamaindex');

// Storage utils

const {
  isCacheEnabled,
  remember,
  recall
} = require('../utils/storage.js');

// Output utils

const {
  isVerbose,
  log,
  delay
} = require('../utils/output.js');

// Human-readable strings

const {
  LOADED_CACHED_QUESTION,
  CREATING_AGENT,
  GOODBYE,
  BYE,
  EXIT,
  TEXT_TEXT_MODEL,
  textTextModel,
  textModelLogPrefix,
  waiting
} = require('../utils/strings.js');

const { prefixInput } = require('../utils/prefix.js');

const { Ragdoll } = require('./Ragdoll.js');

dotenv.config();

const { DELAY } = process.env;

/* * * * * * * * * * * * * * * * * * * *
 *                                     *
 * RagdollCommandLine                *
 *                                     *
 * Interface layer (based on readline) *
 * for Ragdoll.                      *
 *                                     *
 * * * * * * * * * * * * * * * * * * * */

let agent;

const RagdollCommandLine = async config => {
  const {
    greeting = false,
    name,
    query
  } = config;

  // Input placeholder (readline)

  const placeholder = `What would you like to ask ${name}? `;

  // Prefix input prompt

  const povPromptPrefix = prefixInput(config);

  const ui = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Greeting

  if (greeting) {
    if (isVerbose) {
      log(CREATING_AGENT);
    }

    agent = await Ragdoll({
      ...config,

      greeting,
      query: greeting ? null : query,
      cache: isCacheEnabled
    });
  }

  // Prompt user

  const promptUser = async input => {
    if (!input || input.length < 3) {
      ui.question(placeholder, promptUser);

      return;
    }

    const inputLowerCase = input.toLowerCase();

    if (inputLowerCase === BYE || inputLowerCase === EXIT) {
      log(GOODBYE);
      process.exit();
    }

    const chatAgent = new Ollama({
      model: TEXT_TEXT_MODEL
    });

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
        log(`${textModelLogPrefix} ${message}`);
      }

      const { message: textModelResponse } = await chatAgent.chat({
        model: TEXT_TEXT_MODEL,
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      });

      messageResponse = textModelResponse?.content;

      remember(input, messageResponse);

      if (isVerbose) {
        log(`${textTextModel} responded with "${messageResponse}".`);
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

      agent = await Ragdoll({
        ...config,

        greeting,
        query: messageResponse,
        cache: false
      });
    }

    ui.question(placeholder, promptUser);
  };

  ui.question(placeholder, promptUser);
};

module.exports = {
  RagdollCommandLine
};
