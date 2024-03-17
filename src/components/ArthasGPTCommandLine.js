const dotenv = require('dotenv');
const readline = require('readline');
const { OpenAIAgent } = require('llamaindex');

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
  languageModel,
  gptLogPrefix,
  waiting,
  placeholder,
  povPromptPrefix
} = require('../utils/strings.js');

const { ArthasGPT } = require('./ArthasGPT.js');

dotenv.config();

const { DELAY } = process.env;

/* * * * * * * * * * * * * * * * * * * *
 *                                     *
 * ArthasGPTCommandLine                *
 *                                     *
 * Interface layer (based on readline) *
 * for ArthasGPT.                      *
 *                                     *
 * * * * * * * * * * * * * * * * * * * */

let agent;

const ArthasGPTCommandLine = async config => {
  const {
    greeting = false,
    name,
    query
  } = config;

  // Input placeholder (readline)

  const placeholder = `What would you like to ask ${name}? `;

  // Prefix input prompt

  const povPromptPrefix = `If and only if the following input is written in first-person (e.g. use of "you", etc.), re-write it about ${name} in third-person using as few characters as possible (never exceed 500) - for example "who are you" should just be "Who is ${name}?", with no mention of the first-person input, however if the subject is not "you" or "${name}" then keep the subject as-is:`;

  const ui = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Greeting

  if (greeting) {
    if (isVerbose) {
      log(CREATING_AGENT);
    }

    agent = await ArthasGPT({
      ...config,

      greeting,
      query: greeting ? null : query,
      cache: isCacheEnabled
    });
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

      agent = await ArthasGPT({
        ...config,

        greeting,
        query: messageResponse,
        cache: true
      });
    }

    ui.question(placeholder, promptUser);
  };

  ui.question(placeholder, promptUser);
};

module.exports = {
  ArthasGPTCommandLine
};
