
const dotenv = require('dotenv');

const {
  Document,
  VectorStoreIndex,
  OllamaEmbedding,
  Ollama,
  PromptHelper,
  SimpleNodeParser,
  CallbackManager
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
  isRendered,
  isVerbose,
  log,
  delay
} = require('../utils/output.js');

const { extractFromURL } = require('../utils/extraction.js');

// Human-readable strings

const {
  LOADED_CACHED_QUERY,
  LOADED_CACHED_TEXT_RESPONSE,
  LOADED_CACHED_IMAGE_RESPONSE,
  LOADED_CACHED_KNOWLEDGE,
  CACHE_CLEARED,
  PREPARING_RESPONSE,
  PREPARING_DISPLAY,
  CREATING_VECTOR_STORE,
  CREATING_QUERY_ENGINE,
  STARTING,
  DONE,
  DEFAULT_NAME,
  DEFAULT_KNOWLEDGE_URI,
  DEFAULT_WRITING_STYLE,
  CONFIG_ERROR,
  CONFIG_ERROR_KNOWLEDGE_URI,
  CONFIG_ERROR_NAME,
  CONFIG_ERROR_WRITING_STYLE,
  CONFIG_ERROR_QUERY,
  TEXT_TEXT_MODEL,
  llmLogPrefix,
  textTextModel,
  textModelLogPrefix,
  imageModelError,
  waiting
} = require('../utils/strings.js');

const {
  prefixOutputText,
  prefixOutputImage
} = require('../utils/prefix.js');

// Persona configs

dotenv.config();

const {
  IMAGE_MODEL_URI,
  // IMAGE_CFG_SCALE,
  // IMAGE_DENOISING_STRENGTH,
  IMAGE_CFG_SCALE_TRUE,
  IMAGE_DENOISING_STRENGTH_TRUE,
  DELAY
} = process.env;

/* * * * * * * * * * * * * * * * * * * *
*                                     *
* Ragdoll                           *
*                                     *
* Manages state of knowledge          *
* and responses.                      *
*                                     *
* config: RagdollConfig             *
*                                     *
* * * * * * * * * * * * * * * * * * * */

const Ragdoll = async config => {
  if (!config) {
    log(CONFIG_ERROR);

    return;
  }

  let {
    cache = true,
    greeting = false,
    knowledgeURI = DEFAULT_KNOWLEDGE_URI,
    additionalKnowledgeURIs = [],
    name = DEFAULT_NAME,
    artStyle = '',
    writingStyle = DEFAULT_WRITING_STYLE,
    query,
    imageSrc = ''
  } = config;

  if (!knowledgeURI) {
    log(CONFIG_ERROR_KNOWLEDGE_URI);

    return;
  }

  if (!name) {
    log(CONFIG_ERROR_NAME);

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

  const ragdollPromptPrefix = prefixOutputText(config);

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

    const index = await VectorStoreIndex.fromDocuments(
      [document],
      {
        serviceContext: {
          llm: new Ollama({
            model: TEXT_TEXT_MODEL
          }),
          embedModel: new OllamaEmbedding({
            model: TEXT_TEXT_MODEL
          }),
          promptHelper: new PromptHelper(),
          nodeParser: new SimpleNodeParser(),
          callbackManager: new CallbackManager()
        }
      }
    );

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

      const { response } = await queryEngine.query({
        query
      });

      queryResponse = response;

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
   * the text model.                     *
   *                                     *
   * * * * * * * * * * * * * * * * * * * */

  let message;
  let messageResponse;
  let queryString;

  const invokeChatAgent = async () => {
    const chatAgent = new Ollama({
      model: TEXT_TEXT_MODEL
    });

    queryString = queryResponse.toString();

    // Create prompt to answer in the defined style

    message = `${ragdollPromptPrefix} ${queryString}`;

    const messageCache = recall(queryString);

    if (messageCache) {
      if (isVerbose) {
        log(LOADED_CACHED_TEXT_RESPONSE);
      }

      messageResponse = messageCache;
    } else {
      if (isVerbose) {
        log(`${textModelLogPrefix} ${message}`);
      }

      try {
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

        remember(queryString, messageResponse);
      } catch (error) {
        log(`${textTextModel} error: ${error?.message}`);
        messageResponse = error?.message;
      }

      if (isVerbose) {
        log(`${textTextModel} responded with "${messageResponse}".`);
        log(waiting);
      }

      await delay(DELAY);
    }
  };

  /* * * * * * * * * * * * * * * * * * * *
   *                                     *
   * invokeImageAgent                    *
   *                                     *
   * With the text response now in       *
   * first-person from the persona, send *
   * prompt the image model to get an    *
   * image that corresponds with the     *
   * text.                               *
   *                                     *
   * * * * * * * * * * * * * * * * * * * */

  // Create prompt to render an image in the defined style

  let imgResponse;

  const invokeImageAgent = async ({ src }) => {
    const endpoint = src ? 'img2img' : 'txt2img';
    const imgCache = recall(messageResponse);

    if (imgCache) {
      if (isVerbose) {
        log(LOADED_CACHED_IMAGE_RESPONSE);
      }

      imgResponse = imgCache;
    } else {
      const imageModelPrompt = `${imagePromptPrefix} ${messageResponse || query}`;

      if (isVerbose) {
        log(`${endpoint} ${imageModelPrompt}`);
      }

      try {
        const imageModelResponse = await fetch(`${IMAGE_MODEL_URI}/sdapi/v1/${endpoint}`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: imageModelPrompt,
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
            // cfgScale: IMAGE_CFG_SCALE,
            // denoisingStrength: IMAGE_DENOISING_STRENGTH,
            cfgScale: IMAGE_CFG_SCALE_TRUE,
            denoisingStrength: IMAGE_DENOISING_STRENGTH_TRUE,

            ...(src ? { initImages: [src] } : {})
          })
        });

        if (imageModelResponse?.ok) {
          const result = await imageModelResponse.json();

          if (result?.images) {
            const base64 = `data:image/png;base64,${result.images.shift()}`;

            imgResponse = base64;
          }
        }

        remember(messageResponse, imgResponse);
      } catch (error) {
        log(`${endpoint} error: ${error?.message}`);
        imgResponse = null;
      }

      if (isVerbose) {
        log(`${endpoint} responded with "${imgResponse}".`);
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

    if (imageSrc) {
      messageResponse = '';
    } else {
      await createQuery();

      await invokeChatAgent();
    }

    if (artStyle) {
      await invokeImageAgent({
        src: imageSrc
      });
    }

    return render();
  };

  /* * * * * * * * * * * * * * * * * * * *
   *                                     *
   * chat                                *
   *                                     *
   * Pass additional queries to an       *
   * instantiated Ragdoll.               *
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
      if (isVerbose && artStyle) {
        log(imageModelError);
      }

      if (messageResponse) {
        console.log(`%c${messageResponse}`, 'color: dodgerblue');
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
      pending: true
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
      log(`Extracting from ${knowledgeURI}...`);

      let { error, text } = await extractFromURL(knowledgeURI);

      if (!error) {
        log('Done.');

        const additionalKnowledgeSources = additionalKnowledgeURIs?.length;

        if (additionalKnowledgeSources) {
          log(`Additional knowledge provided. Extracting...`);

          for (const uri of additionalKnowledgeURIs) {
            log(`${uri} (${additionalKnowledgeURIs.indexOf(uri) + 1} / ${additionalKnowledgeSources})...`);

            const {
              error: textractError,
              text: textractText
            } = await extractFromURL(uri);

            if (textractError) {
              error = textractError;

              break;
            }

            text += `\n\n${textractText}`;
          }

          log('Done.');
        }

        await createIndex(text);
      }

      answer = await respond(error, text);
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
  Ragdoll
};
