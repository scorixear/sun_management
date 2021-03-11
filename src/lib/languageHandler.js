import fs from 'fs';
import config from '../config';

const dic = {
  lang: JSON.parse(
    fs.readFileSync(`./src/assets/language/${config.language}.json`).toString()
  )
};

/**
 * Changes the language to the given language unicode
 * @param {String} lang - The language to change to
 * @return {Boolean} - False if file did not exist
 */
function changeLanguage(lang) {
  // Look for the given language in 'src/assets/language'
  if (!fs.existsSync(`./src/assets/language/${lang}.json`)) {
    console.error(`Could not find language file for '${lang}'`);
    return false;
  }

  // If the file exists, continue
  dic.lang = JSON.parse(
    fs.readFileSync(`./src/assets/language/${lang}.json`).toString()
  );

  console.log(`Changing lang from '${config.language}' to '${lang}'`);
  config.language = lang;

  fs.writeFileSync('./src/config.json', JSON.stringify(config, null, 2));
  // languageTag = lang <<< Has no use, commenting for now
  return true;
}

/**
 * Replaces preset args with values in a string
 * @param {String} input
 * @param {Array<String>} args
 * @return {String} the filled string
 */
function replaceArgs(input, args) {
  for (let i = 0; i < args.length; i++) {
    input = input.split('$' + i).join(args[i]);
  }
  return input;
}

export { dic, changeLanguage, replaceArgs };
