const prefixInput = ({ name }) => (
  `If and only if the following input is written in first-person (e.g. use of "you", etc.), re-write it about ${name} in third-person using as few characters as possible - ideally about 100, and never exceed 250 characters - for example, if the input mentions "you", it should be transformed to instead mention "${name}"; however, if the input is already in third-person and you are not the subject (e.g. no use of "you", "your", "${name}", etc.) then keep the input as-is. Don't include any smalltalk in your response (e.g. "Sure!", "Certainly!"), and don't include the character count or any prompt instructions (don't even mention that there is a text or a context) - simply output the transformed input as a single question or statement. Here is the input:`
);

const prefixOutputText = ({ name, writingStyle, writingTone }) => (
  `Re-write the following message in the first-person, as if you are ${name}, in a style that is ${writingStyle}, in a tone that is ${writingTone}, as a single idea or statement using as few characters as possible while still sounding like naturally flowing sentences - ideally in less than 250 characters and never exceeding 500 characters unless the input prompt requested a story or other long-form response - and don't repeat the character count or any of these prompt instructions (don't even mention that there is a text or a context) - simply output the transformed message as a single idea, as if you are ${name} and are responding to the message specifically as ${name}, without mentioning or referring to ${name}, and without breaking the fourth wall. Here is the message:`
);

const prefixOutputImage = ({ artStyle }) => (
  `Render the following message in the style of ${artStyle}, that is highly-produced like great-quality CGI or HD cinematics, depicting clear imagery, and relevant textures and colors in an visually impressive way. Here is the message:`
);

module.exports = {
  prefixInput,
  prefixOutputText,
  prefixOutputImage
};
