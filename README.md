# ArthasGPT

![311941658-6b93b041-f30f-4121-a951-a746a19c75fc](https://github.com/bennyschmidt/ArthasGPT/assets/45407493/05231ee1-9a40-436f-88a1-dd5b5ec73a1a)

## Web app

You can interact with ArthasGPT via this [Node/React full stack application](https://github.com/bennyschmidt/Arthas.AI).

-----

#### Image quality & GUI

Note that in a default Terminal you will not see text colors and the image quality will be diminished. Using a Terminal like [iTerm2](https://iterm2.com) or [Kitty](https://sw.kovidgoyal.net/kitty) will allow you to view the full resolution (1024x1024 by default).

-----

## Examples

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
>
> Answer:
>
> https://github.com/bennyschmidt/ArthasGPT/assets/45407493/16ac6fe8-686e-4d57-b949-2f0dad05dbe4

Note that LLM query could not find any relevant info, resulting in this prompt fragment:

> "Arthas's favorite memory is not explicitly mentioned in the context information provided."

Yet the GPT-3.5 prompt is still robust enough to provide a meaningful response in the style of Arthas:

> "In the realm of my existence, a cherished memory lies concealed, veiled by the shadows of time. Its essence, though unspoken, resonates within my being. A tale of valor and darkness, woven intricately in the tapestry of my soul."

And we still get a relevant image:

> ![312196072-f0304218-366f-43a9-8208-77543e486781](https://github.com/bennyschmidt/ArthasGPT/assets/45407493/6b348768-4f6a-4505-a360-d74e2c4f0154)

-----

## Custom personas

Want to go beyond Arthas? You can create a custom persona for just about anyone as long as there's an online knowledgebase to point to.

See [personas.md](./personas.md).

-----

## Usage

Set up the environment.

#### .env scaffold

```
OPENAI_API_KEY=
LLM_FRAMEWORK=llamaindex
LANGUAGE_MODEL=GPT-3.5
IMAGE_MODEL=dall-e-2
DELAY=2000
VERBOSE=false
GREETING=false
CACHE=true
MAX_STORAGE_KEY_LENGTH=32
LOG_PREFIX=<ArthasGPT>
STORAGE_URI=./.tmp
```

#### Important environment variables

`OPENAI_API_KEY`

Your OpenAI API key.

`LANGUAGE_MODEL`

Example: `GPT-3.5`.

`IMAGE_MODEL`

Example: `dall-e-2`.

`DELAY`

Delay between requests (in ms), for rate limiting, artificial delays, etc.

`VERBOSE`

Set to `true` to show all logs. Enable `VERBOSE` to see the generated prompts in your console, for example, in this case the query was `"how many blood elves have you killed?"`:

```
<ArthasGPT> ChatGPT (GPT-3.5) Prompt: Re-write the following message in the first-person, as if you are Arthas, in a style that is inspiring but grim, from the year 1200 A.D., using as few characters as possible (never exceed 500), in a tone that is slightly resentful, omitting any references to Earth or real-world society: Arthas killed Sylvanas Windrunner, King Anasterian Sunstrider, and Dar'Khan Drathir, who were blood elves. So, Arthas has killed three blood elves.
<ArthasGPT> ChatGPT (GPT-3.5) responded with "I, Arthas, vanquished Sylvanas Windrunner, King Anasterian Sunstrider, and Dar'Khan Drathir, noble blood elves. Three lives claimed by my hand.".
<ArthasGPT> Waiting 2 seconds...
<ArthasGPT> DALL-E (dall-e-2) Prompt: Render the following in the style of Blizzard's World of Warcraft concept art in high resolution like a finely-tuned video game model including each detail and anatomically correct features (if any): I, Arthas, vanquished Sylvanas Windrunner, King Anasterian Sunstrider, and Dar'Khan Drathir, noble blood elves. Three lives claimed by my hand.
```

`GREETING`

Set either a root query (example: `"who are you?"`) to have the persona initiate the conversation with an introduction, or `false` to skip the greeting.

`CACHE`

Set to `true` to cache LLM inputs & queries, and GPT/DALL-E prompts, responses, & images.

Caching is highly recommended because OpenAI is expensive and heavily rate limited. Right now, each question costs about 4 cents in OpenAI. Keep in mind the underlying LLM framework [llamaindex](https://github.com/run-llama/LlamaIndexTS) might perform several OpenAI calls even though in this application only 1 is being made, especially with embeddings and considering every question requires at least 2 GPT-3.5 calls and 1 DALL-E call.

![312222034-eaad93a1-f28d-454a-9fa5-33ceac658806](https://github.com/bennyschmidt/ArthasGPT/assets/45407493/ca6bedaf-2d30-4fa6-b5e1-0484a0cffbdc)

Here is my usage after running the above examples, note how much more expensive images and embeddings are than GPT by itself.

The transformed input/prompt is what's cached, not the literal user input. For example, the questions "who are you", "explain who you are", and "who is arthas?" all transform to the same query ("Who is Arthas?"). The GPT and DALL-E responses are cached too, so you'll get the same answer when asking similar questions (but without having to hit OpenAI again).

`MAX_STORAGE_KEY_LENGTH`

How long storage keys can be. The keys are derived from queries/prompts, but there are key/value limits in `localStorage` and some prompts can be very long. An alternative to this config would be to make the developer provide a `key` (similar to React) each time `remember` is called, but that isn't supported right now.

`STORAGE_URI`

Path to a temp folder used for cache (default is `./.tmp`).

#### Persona configuration

```
ARTHAS_NAME=Arthas
KNOWLEDGE_URI=https://wowpedia.fandom.com/wiki/Arthas_Menethil
ART_STYLE=Blizzard's World of Warcraft concept art
WRITING_STYLE=inspiring but grim, from the year 1200 A.D.
WRITING_TONE=slightly annoyed

```

Changing these values will result in a [new persona](#custom-personas). See [`/src/utils/persona.js`](./src/utils/persona.js).

#### Run

`npm start`

## Middleware

To ensure integrity, optionally integrate lifecycle middleware at 2 stages:
  1. LLM query: Run the formatted prompt through another transformer (instead of ChatGPT)
  2. Transformed response: Run the final image prompt through a different image model (instead of DALL-E)

_Instructions coming soon._

See this [Leonardo.Ai demo](./personas.md#bonus-integrating-with-leonardo-sdk-to-get-amazing-images).
