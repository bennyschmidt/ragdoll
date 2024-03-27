// Run the CLI

const {
  DEFAULT_NAME,
  DEFAULT_KNOWLEDGE_URI,
  DEFAULT_ART_STYLE,
  DEFAULT_WRITING_TONE,
  DEFAULT_WRITING_STYLE
} = require('./utils/strings');

const { ArthasGPTCommandLine } = require('./components/ArthasGPTCommandLine');

ArthasGPTCommandLine({
  cache: true,
  greeting: false,
  knowledgeURI: DEFAULT_KNOWLEDGE_URI,
  name: DEFAULT_NAME,
  // artStyle: DEFAULT_ART_STYLE,
  artStyle: null,
  writingStyle: DEFAULT_WRITING_STYLE,
  writingTone: DEFAULT_WRITING_TONE,
  query: null
});
