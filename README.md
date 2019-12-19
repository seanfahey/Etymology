# Etymology

Learn more about the origins of words with the Etymology skill for Alexa on Amazon Echo.

Currently looking up words via the Online Etymology Dictionary (http://www.etymonline.com/) but look for more sources to be added soon.

The list of available words is 18,488.

## Installation

TODO: Describe the installation process

TODO: setting up the skill

TODO: setting up lambda

## Usage

"Alexa, ask Word Source about the word plant"

"Alexa, ask Word Source about the word car"

"Alexa, ask Word Source about the origin of the word colony"

## Notes

Alexa skills support 60000 characters of custom slot types. Using a list of the top 10,000 most common words from Google it was pared down from ~75000 chars in vim with this commands:
remove duplicate words with -s at the end

`:g/[a-z]+s\n/d`

Ideas for trimming larger word lists:

remove -ing words

`:g/[a-z]+ing/d`

remove -ly words

`:g/[a-z]+ly/d`

## History

First version created after sitting in a chair reading a book, trying to get Alexa to tell me about the origin of a word. Looking things up on a normal computer is so distracting because I just start checking Reddit or reading the news.

## Credits

Sean Fahey

[Online Etymology Dictionary](http://www.etymonline.com/)

Node and the [Cheerio Package](https://www.npmjs.com/package/cheerio)

[20k word list](https://github.com/first20hours/google-10000-english) which is based off the [Google Books Ngram Corpus](https://storage.googleapis.com/books/ngrams/books/datasetsv2.html)

[Amazon Alexa](https://developer.amazon.com/public/solutions/alexa)

## License

TODO: Write license