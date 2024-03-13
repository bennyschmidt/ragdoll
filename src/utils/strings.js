import dotenv from 'dotenv';

dotenv.config();

const {
  LLM_VERSION,
  GPT_VERSION,
  DALLE_VERSION,
  DELAY,
  GREETING,
  ARTHAS_NAME,
  ART_STYLE,
  WRITING_STYLE,
  WRITING_TONE
} = process.env;

const llmVersion = `LLM (${LLM_VERSION})`;
const llmLogPrefix = `${llmVersion} query:`;
const gptVersion = `ChatGPT (${GPT_VERSION})`;
const gptLogPrefix = `${gptVersion} Prompt:`;
const dalleVersion = `DALL-E (${DALLE_VERSION})`;
const dalleLogPrefix = `${dalleVersion} Prompt:`;
const waiting = `Waiting ${DELAY / 1000} seconds...`;
const placeholder = `What would you like to ask ${ARTHAS_NAME}? `;
const povPromptPrefix = `If the following input is first-person (e.g. use of "you", etc.), re-write it about ${ARTHAS_NAME} in third-person using as few characters as possible (never exceed 500) - for example "who are you" should just be "Who is ${ARTHAS_NAME}?":`;
const imagePromptPrefix = `Render the following in the style of ${ART_STYLE}:`;
const arthasPromptPrefix = `Re-write the following message in the first-person, as if you are ${ARTHAS_NAME}, in a style that is ${WRITING_STYLE}, using as few characters as possible (never exceed 500), in a prose that is ${WRITING_TONE}:`;
const arthasGreeting = GREETING === 'false' ? false : GREETING;

export {
  llmVersion,
  llmLogPrefix,
  gptVersion,
  gptLogPrefix,
  dalleVersion,
  dalleLogPrefix,
  waiting,
  placeholder,
  povPromptPrefix,
  imagePromptPrefix,
  arthasPromptPrefix,
  arthasGreeting
};
