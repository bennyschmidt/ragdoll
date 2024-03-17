const prefixInput = ({ name }) => (
  `If and only if the following input is written in first-person (e.g. use of "you", etc.), re-write it about ${name} in third-person using as few characters as possible (never exceed 500) - for example "who are you" should just be "Who is ${name}?", with no mention of the first-person input, however if it's already third-person and you are not the subject (e.g. no use of "you", "your", "${name}", etc.) then keep it unaltered:`
);

const prefixOutputText = ({ name, writingStyle, writingTone }) => (
  `Re-write the following message in the first-person, as if you are ${name}, in a style that is ${writingStyle}, using as few characters as possible (never exceed 500), in a tone that is ${writingTone}:`
);

const prefixOutputImage = ({ artStyle }) => (
  `Render the following in the style of ${artStyle}:`
);

module.exports = {
  prefixInput,
  prefixOutputText,
  prefixOutputImage
};
