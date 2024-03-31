const dotenv = require('dotenv');

dotenv.config();

const {
  LLM_FRAMEWORK,
  TEXT_MODEL,
  IMAGE_MODEL,
  DELAY
} = process.env;

const LOADED_CACHED_QUESTION = 'User question loaded from cache.';
const LOADED_CACHED_QUERY = 'LLM query loaded from cache.';
const LOADED_CACHED_TEXT_RESPONSE = 'Text response loaded from cache.';
const LOADED_CACHED_IMAGE_RESPONSE = 'Image response loaded from cache.';
const LOADED_CACHED_KNOWLEDGE = 'Knowledge loaded from cache.';
const CACHE_CLEARED = 'Cache cleared.';
const PREPARING_RESPONSE = 'Preparing response...';
const PREPARING_DISPLAY = 'Preparing response for display...';
const CREATING_VECTOR_STORE = 'Creating vector store...';
const CREATING_QUERY_ENGINE = 'Creating query engine...';
const STARTING = 'Initializing...';
const DONE = 'Done.';
const DEFAULT_ANSWER = 'Unknown answer.';
const CREATING_AGENT = 'Creating Ragdoll agent...';
const GOODBYE = 'Farewell.';
const BYE = 'bye';
const EXIT = 'exit';

const llmFramework = `LLM (${LLM_FRAMEWORK})`;
const llmLogPrefix = `${llmFramework} query:`;
const textModel = `Text model (${TEXT_MODEL})`;
const textModelLogPrefix = `${textModel} prompt:`;
const imageModel = `Image model (${IMAGE_MODEL})`;
const imageModelLogPrefix = `${imageModel} prompt:`;
const waiting = `Waiting ${DELAY / 1000} seconds...`;
const imageModelError = `${imageModel} failed to return an image. This could be due to a safety violation, rate limiting, or a network issue.`;

const DEFAULT_NAME = 'Arthas';
const DEFAULT_KNOWLEDGE_URI = 'https://wowpedia.fandom.com/wiki/Arthas_Menethil';
const DEFAULT_ART_STYLE = `Blizzard's World of Warcraft concept art in high resolution like a fine-tuned video game model including each detail and anatomically correct features (if any)`;
const DEFAULT_WRITING_STYLE = 'inspiring but grim, like from the dark ages, excluding asterisk-based interjections like "*sigh*"';
const DEFAULT_WRITING_TONE = 'slightly annoyed';

// Extend the scope of knowledge.
// This can affect the time it takes to
// create the vector store

const DEFAULT_ADDITIONAL_KNOWLEDGE_URIS = [
  // 'https://wowwiki-archive.fandom.com/wiki/Arthas:_Rise_of_the_Lich_King',
  // 'https://cableplugger.wordpress.com/wp-content/uploads/2010/11/world-of-warcraft-2009-arthas-rise-of-the-lich-king-christie-golden.pdf',
  // 'https://www.reddit.com/r/wow/comments/7guydb/lore_post_the_tragedy_of_arthas_menethil/'
];

const INVALID = 'Missing/invalid';
const CONFIG_ERROR = `${INVALID} configuration.`;
const CONFIG_ERROR_KNOWLEDGE_URI = `${INVALID} knowledge URI.`;
const CONFIG_ERROR_NAME = `${INVALID} name.`;
const CONFIG_ERROR_ART_STYLE = `${INVALID} art style.`;
const CONFIG_ERROR_WRITING_STYLE = `${INVALID} writing style.`;
const CONFIG_ERROR_QUERY = `${INVALID} query.`;

module.exports = {
  LOADED_CACHED_QUESTION,
  LOADED_CACHED_QUERY,
  LOADED_CACHED_TEXT_RESPONSE,
  LOADED_CACHED_IMAGE_RESPONSE,
  LOADED_CACHED_KNOWLEDGE,
  CACHE_CLEARED,
  PREPARING_RESPONSE,
  PREPARING_DISPLAY,
  CREATING_VECTOR_STORE,
  CREATING_QUERY_ENGINE,
  DEFAULT_ANSWER,
  DEFAULT_NAME,
  DEFAULT_KNOWLEDGE_URI,
  DEFAULT_ART_STYLE,
  DEFAULT_WRITING_TONE,
  DEFAULT_WRITING_STYLE,
  DEFAULT_ADDITIONAL_KNOWLEDGE_URIS,
  STARTING,
  DONE,
  DEFAULT_ANSWER,
  CREATING_AGENT,
  GOODBYE,
  BYE,
  EXIT,
  CONFIG_ERROR,
  CONFIG_ERROR_KNOWLEDGE_URI,
  CONFIG_ERROR_NAME,
  CONFIG_ERROR_ART_STYLE,
  CONFIG_ERROR_WRITING_STYLE,
  CONFIG_ERROR_QUERY,
  TEXT_MODEL,
  llmFramework,
  llmLogPrefix,
  textModel,
  textModelLogPrefix,
  imageModel,
  imageModelLogPrefix,
  imageModelError,
  waiting
};
