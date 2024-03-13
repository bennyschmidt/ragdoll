import dotenv from 'dotenv';

import {
  ARTHAS_NAME,
  ART_STYLE,
  WRITING_STYLE,
  WRITING_TONE
} from './persona.js';

dotenv.config();

const {
  LLM_FRAMEWORK,
  LANGUAGE_MODEL,
  IMAGE_MODEL,
  DELAY,
  GREETING
} = process.env;

const LOADED_CACHED_QUESTION = 'User question loaded from cache.';
const LOADED_CACHED_QUERY = 'LLM query loaded from cache.';
const LOADED_CACHED_GPT_RESPONSE = 'ChatGPT response loaded from cache.';
const LOADED_CACHED_DALLE_RESPONSE = 'DALL-E response loaded from cache.';
const LOADED_CACHED_KNOWLEDGE = 'Knowledge loaded from cache.';
const CACHE_CLEARED = 'Cache cleared.';
const PREPARING_RESPONSE = 'Preparing response...';
const PREPARING_DISPLAY = 'Preparing response for display...';
const CREATING_VECTOR_STORE = 'Creating vector store...';
const CREATING_QUERY_ENGINE = 'Creating query engine...';
const STARTING = 'Initializing...';
const DONE = 'Done.';
const DEFAULT_ANSWER = 'Unknown answer.';
const CREATING_AGENT = 'Creating Arthas agent...';
const GOODBYE = 'Farewell.';
const BYE = 'bye';
const EXIT = 'exit';
const DALLE_ERROR = 'DALL-E failed to return an image. This could be due to a safety violation, rate limiting, or a network issue.';

const llmFramework = `LLM (${LLM_FRAMEWORK})`;
const llmLogPrefix = `${llmFramework} query:`;
const languageModel = `ChatGPT (${LANGUAGE_MODEL})`;
const gptLogPrefix = `${languageModel} Prompt:`;
const imageModel = `DALL-E (${IMAGE_MODEL})`;
const dalleLogPrefix = `${imageModel} Prompt:`;
const waiting = `Waiting ${DELAY / 1000} seconds...`;
const placeholder = `What would you like to ask ${ARTHAS_NAME}? `;

const povPromptPrefix = `If and only if the following input is written in first-person (e.g. use of "you", etc.), re-write it about ${ARTHAS_NAME} in third-person using as few characters as possible (never exceed 500) - for example "who are you" should just be "Who is ${ARTHAS_NAME}?", with no mention of the first-person input, however if the subject is not "you" or "${ARTHAS_NAME}" then keep the subject as-is:`;

const imagePromptPrefix = `Render the following in the style of ${ART_STYLE}:`;

const arthasPromptPrefix = `Re-write the following message in the first-person, as if you are ${ARTHAS_NAME}, in a style that is ${WRITING_STYLE}, using as few characters as possible (never exceed 500), in a tone that is ${WRITING_TONE}, omitting any references to Earth or real-world society:`;

const arthasGreeting = GREETING === 'false' ? false : GREETING;

export {
  LOADED_CACHED_QUESTION,
  LOADED_CACHED_QUERY,
  LOADED_CACHED_GPT_RESPONSE,
  LOADED_CACHED_DALLE_RESPONSE,
  LOADED_CACHED_KNOWLEDGE,
  CACHE_CLEARED,
  PREPARING_RESPONSE,
  PREPARING_DISPLAY,
  CREATING_VECTOR_STORE,
  CREATING_QUERY_ENGINE,
  STARTING,
  DONE,
  DEFAULT_ANSWER,
  CREATING_AGENT,
  GOODBYE,
  BYE,
  EXIT,
  DALLE_ERROR,
  llmFramework,
  llmLogPrefix,
  languageModel,
  gptLogPrefix,
  imageModel,
  dalleLogPrefix,
  waiting,
  placeholder,
  povPromptPrefix,
  imagePromptPrefix,
  arthasPromptPrefix,
  arthasGreeting
};
