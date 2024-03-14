
const dotenv = require('dotenv');
const textract = require('textract');
const OpenAI = require('openai');

const {
  Document,
  VectorStoreIndex,
  OpenAIAgent
} = require('llamaindex');

// Storage utils

const {
  remember,
  recall,
  forget
} = require('../utils/storage.js');

// Output utils

const {
  IMAGE_SIZE,
  IMAGE_QUALITY,
  isVerbose,
  log,
  delay
} = require('../utils/output.js');

// Human-readable strings

const {
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
  DALLE_ERROR,
  llmLogPrefix,
  languageModel,
  gptLogPrefix,
  imageModel,
  dalleLogPrefix,
  waiting,
  imagePromptPrefix,
  arthasPromptPrefix,
  arthasGreeting
} = require('../utils/strings.js');

// Persona configs

const { KNOWLEDGE_URI } = require('../utils/persona.js');

dotenv.config();

const {
  IMAGE_MODEL,
  DELAY
} = process.env;

/* * * * * * * * * * * * * * * * * * * *
*                                     *
* ArthasGPT                           *
*                                     *
* Manages state of knowledge          *
* and responses.                      *
*                                     *
* knowledgeURI?: string               *
* query?: string                      *
* cache?: boolean                     *
*                                     *
* * * * * * * * * * * * * * * * * * * */

const ArthasGPT = async (
  knowledgeURI = KNOWLEDGE_URI,
  query = arthasGreeting,
  cache = true
) => {
  const { default: terminalImage } = await import('terminal-image');

  let queryResponse;

  // Clear cache

  if (cache === false) {
    isCacheEnabled = false;

    if (isVerbose) {
      log(CACHE_CLEARED);
    }

    forget();
  }

  /* * * * * * * * * * * * * * * * * * * *
  *                                     *
  * createIndex                         *
  *                                     *
  * Create a document from fetched      *
  * text data and add an indexed        *
  * store for library access.           *
  *                                     *
  * text: string                        *
  *                                     *
  * * * * * * * * * * * * * * * * * * * */

  let queryEngine;

  const createIndex = async text => {
    // Create index and query engine

    const document = new Document({ text });

    if (isVerbose) {
      log(CREATING_VECTOR_STORE);
    }

    const index = await VectorStoreIndex.fromDocuments([document]);

    if (isVerbose) {
      log(DONE);
      log(waiting);
    }

    await delay(DELAY);

    if (isVerbose) {
      log(CREATING_QUERY_ENGINE);
    }

    queryEngine = index.asQueryEngine();
  };

  /* * * * * * * * * * * * * * * * * * * *
  *                                     *
  * createQuery                         *
  *                                     *
  * Run and cache the user's query      *
  * to get the core of the prompt.      *
  *                                     *
  * * * * * * * * * * * * * * * * * * * */

  const createQuery = async () => {
    const queryCache = recall(query);

    if (queryCache) {
      if (isVerbose) {
        log(LOADED_CACHED_QUERY);
      }

      queryResponse = queryCache;
    } else {
      if (isVerbose) {
        log(`${llmLogPrefix} ${query}`);
      }

      queryResponse = await queryEngine.query({
        query
      });

      remember(query, queryResponse);
    }

    if (isVerbose) {
      log(DONE);
      log(waiting);
    }

    await delay(DELAY);
  };

  /* * * * * * * * * * * * * * * * * * * *
  *                                     *
  * invokeChatAgent                     *
  *                                     *
  * Complete the prompt by decorating   *
  * it in the defined style and send to *
  * ChatGPT.                            *
  *                                     *
  * * * * * * * * * * * * * * * * * * * */

  let message;
  let messageResponse;
  let queryString;

  const invokeChatAgent = async () => {
    const chatAgent = new OpenAIAgent({});

    queryString = queryResponse.toString();

    // Create prompt to answer in the defined style

    message = `${arthasPromptPrefix} ${queryString}`;

    const messageCache = recall(queryString);

    if (messageCache) {
      if (isVerbose) {
        log(LOADED_CACHED_GPT_RESPONSE);
      }

      messageResponse = messageCache;
    } else {
      if (isVerbose) {
        log(`${gptLogPrefix} ${message}`);
      }

      try {
        const { response: gptResponse } = await chatAgent.chat({
          message
        });

        messageResponse = gptResponse;

        remember(queryString, messageResponse);
      } catch (error) {
        log(`${languageModel} error: ${error?.message}`);
        messageResponse = error?.message;
      }

      if (isVerbose) {
        log(`${languageModel} responded with "${messageResponse}".`);
        log(waiting);
      }

      await delay(DELAY);
    }
  };

  /* * * * * * * * * * * * * * * * * * * *
  *                                     *
  * invokeImageAgent                    *
  *                                     *
  * With the ChatGPT response now in    *
  * first-person from the persona, send *
  * to DALL-E to get an image that      *
  * corresponds with the text.          *
  *                                     *
  * * * * * * * * * * * * * * * * * * * */

  // Create prompt to render an image in the defined style

  let imgResponse;

  const invokeImageAgent = async () => {
    const imageAgent = new OpenAI();

    const imgCache = recall(messageResponse);

    if (imgCache) {
      if (isVerbose) {
        log(LOADED_CACHED_DALLE_RESPONSE);
      }

      imgResponse = imgCache;
    } else {
      const dallePrompt = `${imagePromptPrefix} ${messageResponse}`;

      if (isVerbose) {
        log(`${dalleLogPrefix} ${dallePrompt}`);
      }

      try {
        const dalleResponse = await imageAgent.images.generate({
          model: IMAGE_MODEL,
          prompt: dallePrompt,
          size: `${IMAGE_SIZE}x${IMAGE_SIZE}`,
          quality: IMAGE_QUALITY,
          n: 1
        });

        imgResponse = dalleResponse.data[0].url;

        remember(messageResponse, imgResponse);
      } catch (error) {
        log(`${imageModel} error: ${error?.message}`);
        imgResponse = null;
      }

      if (isVerbose) {
        log(`${dalleLogPrefix} responded with "${imgResponse}".`);
      }
    }
  };

  /* * * * * * * * * * * * * * * * * * * *
  *                                     *
  * respond                             *
  *                                     *
  * Lifecycle method called when        *
  * the agent has stored new data       *
  * and should respond with text        *
  * and an image.                       *
  *                                     *
  * error?: any                         *
  * text: string                        *
  *                                     *
  * * * * * * * * * * * * * * * * * * * */

  const respond = async (error, text) => {
    if (isVerbose) {
      log(PREPARING_RESPONSE);
    }

    if (error) {
      log(error);

      return;
    }

    remember(knowledgeURI, text);

    // Create and render the response

    await createQuery();

    await invokeChatAgent();

    await invokeImageAgent();

    return render();
  };

  /* * * * * * * * * * * * * * * * * * * *
  *                                     *
  * chat                                *
  *                                     *
  * Pass additional queries to an       *
  * instantiated Arthas.                *
  *                                     *
  * input: string                       *
  *                                     *
  * * * * * * * * * * * * * * * * * * * */

  const chat = async input => {
    const knowledgeCache = recall(knowledgeURI);

    query = input;

    queryResponse = await queryEngine.query({
      query
    });

    return respond(null, knowledgeCache);
  };

  /* * * * * * * * * * * * * * * * * * * *
  *                                     *
  * render                              *
  *                                     *
  * Return a "Persona Reply" of         *
  * { image, text } for display.        *
  *                                     *
  * * * * * * * * * * * * * * * * * * * */

  const render = async () => {
    if (isVerbose) {
      log(PREPARING_DISPLAY);
    }

    if (!imgResponse) {
      if (isVerbose) {
        log(DALLE_ERROR);
      }

      return {
        text: messageResponse
      };
    }

    const image = await fetch(imgResponse);

    const buffer = Buffer.from(await image.arrayBuffer());

    const displayImage = await terminalImage.buffer(buffer);

    if (isVerbose) {
      log(DONE);
    }

    // Display the image

    if (displayImage) {
      console.log(displayImage);
    }

    // Display the text

    if (messageResponse) {
      console.log(`%c${messageResponse}`, 'color: dodgerblue');
    }

    return {
      image: displayImage,
      imageURL: imgResponse,
      text: messageResponse
    };
  };

/* * * * * * * * * * * * * * * * * * * *
  *                                     *
  * init                                *
  *                                     *
  * Initialize with knowledge and       *
  * a query, and provide an             *
  * initial response.                   *
  *                                     *
  * * * * * * * * * * * * * * * * * * * */

  const init = async () => {
    if (isVerbose) {
      log(STARTING);
    }

    let answer = {
      image: null,
      text: DEFAULT_ANSWER
    };

    const knowledgeCache = recall(knowledgeURI);

    if (isVerbose) {
      log(DONE);
    }

    if (knowledgeCache) {
      await createIndex(knowledgeCache);

      if (isVerbose) {
        log(LOADED_CACHED_KNOWLEDGE);
      }

      answer = await respond(null, knowledgeCache);
    } else {
      textract.fromUrl(knowledgeURI, async (error, text) => {
        await createIndex(text);

        answer = await respond(error, text);
      });
    }

    // Return the answer and a reusable `chat` method
    // to ask further questions

    return {
      ...answer,

      chat
    };
  };

  return init();
};

module.exports = {
  ArthasGPT
};
