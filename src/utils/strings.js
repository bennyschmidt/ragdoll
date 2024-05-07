const dotenv = require('dotenv');

dotenv.config();

const {
  RAG_ENGINE,
  TEXT_TEXT_MODEL,
  TEXT_IMAGE_MODEL,
  LLAMACPP_BATCH_SIZE,
  LLAMACPP_GPU_LAYERS,
  IMAGE_MODEL_PROVIDER,
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

const ragEngine = `RAG engine (${RAG_ENGINE})`;
const llmLogPrefix = `${ragEngine} query:`;
const textTextModel = `Text-to-text model (${TEXT_TEXT_MODEL})`;
const textModelLogPrefix = `${textTextModel} prompt:`;
const textImageModel = `Text-to-image model (${TEXT_IMAGE_MODEL})`;
const imageModelLogPrefix = `${textImageModel} prompt:`;
const waiting = `Waiting ${DELAY / 1000} seconds...`;
const imageModelError = `${IMAGE_MODEL_PROVIDER} failed to return an image. This could be due to a safety violation, rate limiting, or a network issue.`;

const DEFAULT_NAME = 'Arthas';
const DEFAULT_KNOWLEDGE_URI = 'https://wowpedia.fandom.com/wiki/Arthas_Menethil';
const DEFAULT_ART_STYLE = 'World of Warcraft concept art';
const DEFAULT_WRITING_STYLE = 'inspiring but grim, like from the dark ages';
const DEFAULT_WRITING_TONE = 'slightly annoyed';

// Extend the scope of knowledge by adding
// URLs. This can extend the time it takes
// to create the vector store

const DEFAULT_ADDITIONAL_KNOWLEDGE_URIS = [];

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
  TEXT_TEXT_MODEL,
  LLAMACPP_BATCH_SIZE: LLAMACPP_BATCH_SIZE << 0,
  LLAMACPP_GPU_LAYERS: LLAMACPP_GPU_LAYERS << 0,
  ragEngine,
  llmLogPrefix,
  textTextModel,
  textModelLogPrefix,
  textImageModel,
  imageModelLogPrefix,
  imageModelError,
  waiting
};
