const prefixInput = ({ name }) => (
  `If and only if the following input is written in first-person (e.g. use of "you", etc.), re-write it about ${name} in third-person using as few characters as possible (never exceed 500) - for example, if the input mentions "you", it should be transformed to instead mention "${name}". Don't include any smalltalk in your response (e.g. "Sure!", "Certainly!") or anything related to this prompt instruction, simply output the transformed input as a single question or statement. However if it's already in third-person and you are not the subject (e.g. no use of "you", "your", "${name}", etc.) then keep the input as-is. Here is the input:`
);

const prefixOutputText = ({ name, writingStyle, writingTone }) => (
  `Re-write the following message in the first-person, as if you are ${name}, in a style that is ${writingStyle}, using as few characters as possible (never exceed 500), in a tone that is ${writingTone}, in a single statement. The message is:`
);

const prefixOutputImage = ({ artStyle }) => (
  `Render the following in the style of ${artStyle}:`
);

module.exports = {
  prefixInput,
  prefixOutputText,
  prefixOutputImage
};
