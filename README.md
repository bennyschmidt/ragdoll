# ArthasGPT

![311941658-6b93b041-f30f-4121-a951-a746a19c75fc](https://github.com/bennyschmidt/ArthasGPT/assets/45407493/05231ee1-9a40-436f-88a1-dd5b5ec73a1a)

-----

## Benefits

- **Scoped Knowledge**: Using a generic chatbot like ChatGPT for narrow use cases like customer support, a game NPC, or writing code can yield undesired responses, or provide information outside the intended scope of knowledge. You don't want your MMORPG shopkeeper talking about about Ford F-150s or Chick-Fil-A, do you? Arthas scrapes a URL you provide as a knowledge source (usually a Wiki style web page, but could be anything - it's very flexible), and uses [`llamaindex`](https://github.com/run-llama/LlamaIndexTS) to store and index that knowledge. It handles questions that fall outside of the scope of knowledge gracefully, so it will still feel like the user is interacting with a person even when it doesn't know the answer.

- **Distinct Personalities**: Answers to questions are always rephrased from the first-person perspective in the style of a persona that you define. Because you're asked to define things like prose, tone, and even art style, Arthas is able to generate the appropriate prompts for your persona, resulting in statements the target persona would perceivably say.

- **Extensible**: Arthas can be ran [as an API](https://github.com/bennyschmidt/Arthas.AI/tree/master/arthas-api), in [a React app](https://github.com/bennyschmidt/Arthas.AI/tree/master/arthas-react), as [a CLI](https://github.com/bennyschmidt/ArthasGPT/blob/master/src/index.js), or as a [a dependency](https://www.npmjs.com/package/arthasgpt) in your application. It uses [Ollama](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/ollama.ts) for text so you can choose from a [wide range of models](https://ollama.com/library), and defaults to [Stable Diffusion](https://github.com/AUTOMATIC1111/stable-diffusion-webui) (txt2img) for images.

-----

## Web app

You can interact with ArthasGPT via this [Node/React full stack application](https://github.com/bennyschmidt/Arthas.AI).

-----

## CLI examples

### Image quality & GUI

Note that in a default Terminal you will not see text colors and the image quality will be diminished. Using a Terminal like [iTerm2](https://iterm2.com) or [Kitty](https://sw.kovidgoyal.net/kitty) will allow you to view the full resolution (1024x1024 by default).

_In native Terminal with no addons:_

> Question: "what town are you from"
>
> Answer:
>
> ![312186339-4cc0aa1c-1592-425c-9ed3-59a5605d705b](https://github.com/bennyschmidt/ArthasGPT/assets/45407493/89a4858b-2b70-4ab1-bfca-92da2039d20b)

_With high-res image support:_

> Question: "what happened between you and sylvanas?"
>
> Answer:
>
> ![312185744-a3c7634b-94d5-4d12-9dd6-3d748670f2d3](https://github.com/bennyschmidt/ArthasGPT/assets/45407493/4f723771-e0c3-4825-a8ea-674a7dbbff4c)

_In verbose mode with caching:_

> Question: "why are you so mean"
>
> Answer:
>
> ![312192889-97a1dbc1-0669-4f43-8067-34cc99938449](https://github.com/bennyschmidt/ArthasGPT/assets/45407493/eb226377-f63b-40b0-b258-d00a12af46c8)

_In verbose mode when he doesn't know the answer based on the knowledge he has:_

> Question: what is your favorite memory

For this one, llamaindex could not find any relevant info, resulting in this prompt fragment:

> "Arthas's favorite memory is not explicitly mentioned in the context information provided."

Yet the prompt is still robust enough to provide a meaningful response in the style of Arthas:

> "In the realm of my existence, a cherished memory lies concealed, veiled by the shadows of time. Its essence, though unspoken, resonates within my being. A tale of valor and darkness, woven intricately in the tapestry of my soul."

And we still get a relevant image:

> ![312196072-f0304218-366f-43a9-8208-77543e486781](https://github.com/bennyschmidt/ArthasGPT/assets/45407493/6b348768-4f6a-4505-a360-d74e2c4f0154)

-----

## Usage

Set up the environment. No API keys needed!

### .env scaffold

```
LLM_FRAMEWORK=llamaindex
TEXT_MODEL=mistral
STABLE_DIFFUSION_URI=http://127.0.0.1:7860
IMAGE_MODEL=txt2img
DELAY=200
RENDER=true
VERBOSE=true
GREETING=false
CACHE=true
MAX_STORAGE_KEY_LENGTH=32
LOG_PREFIX=<ArthasGPT>
STORAGE_URI=./.tmp
```

-----

### Install Ollama

1. Download Ollama
   
  **Linux**: `curl -fsSL https://ollama.com/install.sh | sh`

  **Windows & Mac**: [ollama.com/download](https://ollama.com/download)

2. Run the CLI

  `ollama start`

3. Find a model you like [here](https://ollama.com/library) and run it in your Terminal:

  `ollama run mistral`

The Ollama (Mistral) API is now listening on `http://localhost:11434/`

-----

### Install Stable Diffusion

1. Have *Python 3* already installed

2. Navigate to the desired directory and

  `git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git`

3. Run the web UI

  **Linux & Mac**: Run `./webui.sh --api --lowvram`. 

  **Windows**: Run `./webui-user.bat --api --lowvram` from Windows Explorer as normal, non-administrator, user.

  Note: `--lowvram` is an optional flag, if running on a great machine (16GB+ vram) you can omit this.

The Stable Diffusion API is now listening on `http://localhost:7860/`

-----

### Run Arthas

`npm start`

-----

### Persona configuration

Pass this config object to `ArthasGPT` when you instantiate a new persona.

```
const agent = await ArthasGPT({
  cache,
  greeting,
  knowledgeURI,
  name,
  artStyle,
  writingStyle,
  writingTone,
  query
});

```

-----

## Custom personas

Want to go beyond Arthas? You can create a custom persona for just about anyone as long as there's an online knowledgebase to point to.

See [personas.md](./personas.md).

-----

## Environment config

`TEXT_MODEL`

Example: `mistral`.

`STABLE_DIFFUSION_URI`

Example: `http://127.0.0.1:7860`.

`DELAY`

Delay between requests (in ms), for rate limiting, artificial delays, etc.

`VERBOSE`

Set to `true` to show all logs. Enable `VERBOSE` to see the generated prompts in your console, for example, in this case the query was `"how many blood elves have you killed?"`:

```
<ArthasGPT> Text (mistral) Prompt: Re-write the following message in the first-person, as if you are Arthas, in a style that is inspiring but grim, from the year 1200 A.D., using as few characters as possible (never exceed 500), in a tone that is slightly resentful, omitting any references to Earth or real-world society: Arthas killed Sylvanas Windrunner, King Anasterian Sunstrider, and Dar'Khan Drathir, who were blood elves. So, Arthas has killed three blood elves.
<ArthasGPT> Text (mistral) responded with "I, Arthas, vanquished Sylvanas Windrunner, King Anasterian Sunstrider, and Dar'Khan Drathir, noble blood elves. Three lives claimed by my hand.".
<ArthasGPT> Waiting 2 seconds...
<ArthasGPT> Image (txt2img) Prompt: Render the following in the style of Blizzard's World of Warcraft concept art in high resolution like a finely-tuned video game model including each detail and anatomically correct features (if any): I, Arthas, vanquished Sylvanas Windrunner, King Anasterian Sunstrider, and Dar'Khan Drathir, noble blood elves. Three lives claimed by my hand.
```

`CACHE`

Set to `true` to cache inputs, llamaindex queries, LLM prompts, responses, & images.

The transformed input/prompt is what's cached, not the literal user input. For example, the questions "who are you", "explain who you are", and "who is arthas?" all transform to the same query ("Who is Arthas?"). The LLM responses are cached too, so you'll get the same answer when asking similar questions (but without having to request the LLM again).

`MAX_STORAGE_KEY_LENGTH`

How long storage keys can be. The keys are derived from queries/prompts, but there are key/value limits in `localStorage` and some prompts can be very long. An alternative to this config would be to make the developer provide a `key` (similar to React) each time `remember` is called, but that isn't supported right now.

`STORAGE_URI`

Path to a temp folder used for cache (default is `./.tmp`).

-----

## Middleware

To ensure integrity, optionally integrate lifecycle middleware at 2 stages:
  1. LLM query: Run the formatted prompt through another transformer (like GPT 4)
  2. Transformed response: Run the final image prompt through a different image model (like DALL-E 3)

_Instructions coming soon._
