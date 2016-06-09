# Etymology

Learn more about the origins of words with the Etymology skill for Alexa on Amazon Echo.

Currently looking up words via the Online Etymology Dictionary (http://www.etymonline.com/) but look for more sources to be added soon.

The list of words is currently limited to 7,959. Look for the number of words to be increased soon.

## Installation

TODO: Describe the installation process
TODO: setting up the skill
TODO: setting up lambda

## Usage

"Alexa, ask Etymology about the word 'plant'."

## Notes

Alexa skills support 60000 characters of custom slot types. Using a list of the top 10,000 most common words from Google it was pared down from ~75000 chars in vim with this commands:
# remove duplicate words with -s at the end
:g/[a-z]+s\n/d

Ideas for trimming larger word lists:

# remove -ing words
:g/[a-z]+ing/d
# remove -ly words
:g/[a-z]+ly/d

## History

First version created after sitting in a chair reading a book, trying to get Alexa to tell me about the origin of a word. Looking things up on a normal computer is so distracting because I just start checking Reddit or reading the news.

## Credits

Sean Fahey
Online Etymology Dictionary (http://www.etymonline.com/)
Node and the Cheerio Package
20k word list from https://github.com/first20hours/google-10000-english which is based off the Google Books Ngram Corpus

## License

TODO: Write license