// utils/typoFixer.js
const fs = require('fs');
const fuzzysort = require('fuzzysort');


const DICTIONARY = fs
  .readFileSync('../utils/dictionary.txt', 'utf8')
  .split('\n')
  .map(word => word.trim().toLowerCase());

// Manual fixes for feedback-related typos or slang
const MANUAL_FIXES = {
  btn: 'button',
  fedback: 'feedback',
  wrkng: 'working',
  isnt: "isn't",
  doesnt: "doesn't",
  submt: 'submit',
  navbr: 'navbar',
  aint: "ain't",
  cant: "can't",
  u:"you",
};

// Clean function
function cleanText(input) {
  return input.split(' ').map(word => {
    const lower = word.toLowerCase();

    // 1. Manual fix if it's in the map
    if (MANUAL_FIXES[lower]) return MANUAL_FIXES[lower];

    // 2. Word is already clean
    if (DICTIONARY.includes(lower)) return lower;

    // 3. Try fuzzy match with DICTIONARY
    const result = fuzzysort.go(lower, DICTIONARY, { threshold: -100 });
    return result.length > 0 ? result[0].target : word;
  }).join(' ');
}

module.exports = cleanText;
