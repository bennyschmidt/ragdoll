import dotenv from 'dotenv';
import textract from 'textract';
import OpenAI from 'openai';
import terminalImage from 'terminal-image';

import {
  Document,
  VectorStoreIndex,
  OpenAIAgent
} from 'llamaindex';

// Storage utils

import {
  remember,
  recall,
  forget
} from '../utils/storage.js';

// Output utils

import {
  isVerbose,
  log,
  delay
} from '../utils/output.js';

// Human-readable strings

import {
  llmLogPrefix,
  gptVersion,
  gptLogPrefix,
  dalleLogPrefix,
  waiting,
  imagePromptPrefix,
  arthasPromptPrefix,
  arthasGreeting
} from '../utils/strings.js';

dotenv.config();

const {
  DALLE_VERSION,
  DELAY,
  KNOWLEDGE_URI,
  IMAGE_SIZE,
  IMAGE_QUALITY,
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
  DEFAULT_ANSWER
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

   /* * * * * * * * * * * * * * * * * * * *
    *                                     *
    * 1. Index knowledge                  *
    *                                     *
    * Create a document from fetched      *
    * text data and add an indexed        *
    * store for library access.           *
    *                                     *
    * * * * * * * * * * * * * * * * * * * */

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

    const queryEngine = index.asQueryEngine();

   /* * * * * * * * * * * * * * * * * * * *
    *                                     *
    * 2. Create query                     *
    *                                     *
    * Run and cache the user's query      *
    * to get the core of the prompt.      *
    *                                     *
    * * * * * * * * * * * * * * * * * * * */

    let queryResponse;

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

   /* * * * * * * * * * * * * * * * * * * *
    *                                     *
    * 3. Invoke chat agent                *
    *                                     *
    * Complete the prompt by decorating   *
    * it in the defined style and send to *
    * ChatGPT.                            *
    *                                     *
    * * * * * * * * * * * * * * * * * * * */

    const chatAgent = new OpenAIAgent({});

    const queryString = queryResponse.toString();

    // Create prompt to answer in the defined style

    let message = `${arthasPromptPrefix} ${queryString}`;

    let messageResponse;

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

      const { response: gptResponse } = await chatAgent.chat({
        message
      });

      messageResponse = gptResponse;

      remember(queryString, messageResponse);

      if (isVerbose) {
        log(`${gptVersion} responded with "${gptResponse}".`);
        log(waiting);
      }

      await delay(DELAY);
    }

   /* * * * * * * * * * * * * * * * * * * *
    *                                     *
    * 4. Invoke image agent               *
    *                                     *
    * With the ChatGPT response now in    *
    * first-person from the persona, send *
    * to DALL-E to get an image that      *
    * corresponds with the text.          *
    *                                     *
    * * * * * * * * * * * * * * * * * * * */

    const imageAgent = new OpenAI();

    // Create prompt to render an image in the defined style

    let imgResponse;

    const imgCache = recall(messageResponse);

    if (imgCache) {
      if (isVerbose) {
        log(LOADED_CACHED_DALLE_RESPONSE);
      }

      imgResponse = imgCache;
    } else {
      if (isVerbose) {
        log(`${dalleLogPrefix} ${message}`);
      }

      const dalleResponse = await imageAgent.images.generate({
        model: DALLE_VERSION,
        prompt: `${imagePromptPrefix} ${messageResponse}`,
        size: `${IMAGE_SIZE}x${IMAGE_SIZE}`,
        quality: IMAGE_QUALITY,
        n: 1
      });

      imgResponse = dalleResponse.data[0].url;

      remember(messageResponse, imgResponse);

      if (isVerbose) {
        log(`${dalleLogPrefix} responded with "${imgResponse}".`);
      }
    }

   /* * * * * * * * * * * * * * * * * * * *
    *                                     *
    * 5. Output                           *
    *                                     *
    * Return a "Persona Reply" of         *
    * { image, text } for display.        *
    *                                     *
    * * * * * * * * * * * * * * * * * * * */

    if (isVerbose) {
      log(PREPARING_DISPLAY);
    }

    const image = await fetch(imgResponse);

    const buffer = Buffer.from(await image.arrayBuffer());

    const displayImage = await terminalImage.buffer(buffer);

    if (isVerbose) {
      log(DONE);
    }

    return {
      image: displayImage,
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

    let answer = DEFAULT_ANSWER;

    const knowledgeCache = recall(knowledgeURI);

    if (isVerbose) {
      log(DONE);
    }

    if (knowledgeCache) {
      if (isVerbose) {
        log(LOADED_CACHED_KNOWLEDGE);
      }

      answer = await respond(false, knowledgeCache);
    } else {
      textract.fromUrl(knowledgeURI, async (error, text) => {
        answer = await respond(error, text);
      });
    }

    // Log the response

    console.log(answer.image);
    console.log(`%c${answer.text}`, 'color: blue');

    return answer;
  };

  return init();
};

export {
  ArthasGPT
};
