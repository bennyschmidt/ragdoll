
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
  isRendered,
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
  DEFAULT_NAME,
  DEFAULT_KNOWLEDGE_URI,
  DEFAULT_ART_STYLE,
  DEFAULT_WRITING_TONE,
  DEFAULT_WRITING_STYLE,
  DALLE_ERROR,
  CONFIG_ERROR,
  CONFIG_ERROR_KNOWLEDGE_URI,
  CONFIG_ERROR_NAME,
  CONFIG_ERROR_ART_STYLE,
  CONFIG_ERROR_WRITING_STYLE,
  CONFIG_ERROR_QUERY,
  llmLogPrefix,
  languageModel,
  gptLogPrefix,
  imageModel,
  dalleLogPrefix,
  waiting
} = require('../utils/strings.js');

const {
  prefixOutputText,
  prefixOutputImage
} = require('../utils/prefix.js');

// Persona configs

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
* config: ArthasGPTConfig             *
*                                     *
* * * * * * * * * * * * * * * * * * * */

const ArthasGPT = async config => {
  if (!config) {
    log(CONFIG_ERROR);

    return;
  }

  let {
    cache = true,
    greeting = false,
    knowledgeURI = DEFAULT_KNOWLEDGE_URI,
    name = DEFAULT_NAME,
    artStyle = DEFAULT_ART_STYLE,
    writingStyle = DEFAULT_WRITING_STYLE,
    writingTone = DEFAULT_WRITING_TONE,
    query
  } = config;

  if (!knowledgeURI) {
    log(CONFIG_ERROR_KNOWLEDGE_URI);

    return;
  }

  if (!name) {
    log(CONFIG_ERROR_NAME);

    return;
  }

  if (!artStyle) {
    log(CONFIG_ERROR_ART_STYLE);

    return;
  }

  if (!writingStyle) {
    log(CONFIG_ERROR_WRITING_STYLE);

    return;
  }

  if (!query && greeting) {
    query = greeting;
  }

  if (!query) {
    log(CONFIG_ERROR_QUERY);

    return;
  }

  // Prefix output prompt (text)

  const arthasPromptPrefix = prefixOutputText(config);

  // Prefix output prompt (image)

  const imagePromptPrefix = prefixOutputImage(config);

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

    if (!isRendered) {
      return {
        imageURL: imgResponse,
        text: messageResponse
      };
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
