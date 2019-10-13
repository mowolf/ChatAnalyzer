![logo](https://github.com/lev-kusanagi/ChatAnalyzer/blob/master/img/logo/logotype1.png?raw=true)

A JavaScript application to analyze WhatsApp chat history locally in your browser.

## ☕️ Caffeine fund ☕️

If you found this tool useful or fun, please consider buying me a coffee 😀

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=5PTUQRRMS2X6E)

## Usage

* Clone the repository `git clone https://github.com/mowolf/ChatAnalyzer.git`
* Open `index.html` in the root folder.
* Follow instructions on the web page.

Alternatively you can use the official [hosted version](https://chatanalyzer.moritzwolf.com) of this code.

## What happens to my chat data?

**No chat data is transferred to any remote server, all analysis is performed locally on your device**

The application works completly offline once the page has loaded. You can turn off your internet before loading your data file if you are particularly concerned. You can also take a look at the source code and give it an audit.

## Reporting Issues

Please open a [new Github Issue](https://github.com/mowolf/ChatAnalyzer/issues/new) if you find any issues or have suggestions/improvements for the project.

Please also supply your data format (e.g. `[07.09.17, 6:44:16 PM] NAME: message`) and Language/Region setting of our phone if you are having a specific problem with data not loading correctly.

## Have a great idea for a new graph?

Head over to [planned features](https://github.com/mowolf/ChatAnalyzer/labels/enhancement) and add your idea if it's missing!

## Wanna help making this better?

Cheers! You are very welcome! Just submit a pull request. The goal of this tool is to automize the parsing as much as possible.

### Add your language identifier for audio/video/pictures

Please see the header of `main.js`. There you can add your identifiers.

### Markov Chain

To generate text that sounds like you check here: https://github.com/mowolf/markov_chain_js/tree/master

### How the data is parsed & how you can build on that

The chat data is parsed via regex and splitted into it's parts. There are two variables that hold the data.

*`structArray`:*
Formatted line data in the form of a struct with the keys: name date time message

- `name`: "Name Surname"
- `date`: "YYYY-MM-DD"
- `time`: "HH:MM:SS"
- `message`: text

each key represents an array, the index represents the line number
e.g. structArray.date[0] is the date of the first line

*`userStruct`:*

Array of structs with the keys:

- `name`: "Name Surname"
- `date`: "YYYY-MM-DD"
- `time`: "HH:MM:SS"
- `message`: text

For every person there is one struct, same format as above, the `index` represents messageNumber of `name`.
