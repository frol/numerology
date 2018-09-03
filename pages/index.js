function sum(arr) {
  return arr.reduce((acc, value) => acc + value, 0)
}

function last(arr) {
  if (arr.length < 1) {
    return null
  }
  return arr[arr.length - 1]
}

function reduceToDigit(value) {
  if (value < 10) {
    return [value]
  }
  const oldValue = value
  let newValue = 0
  while (value > 0) {
    newValue += value % 10
    value = ~~(value / 10)
  }
  return [oldValue].concat(reduceToDigit(newValue))
}

function displayAsChain(arr) {
  return arr.join(' → ')
}

class Language {
  constructor({ alphabet, vowels }) {
    this.alphabet = alphabet
    this.vowels = vowels
  }

  isVowel = letter => this.vowels.indexOf(letter.toLowerCase()) >= 0
  isConsonant = letter => this.alphabet.indexOf(letter.toLowerCase()) >= 0 && !this.isVowel(letter)

  letterToNumber = letter => {
    const letterIndex = this.alphabet.indexOf(letter.toLowerCase())
    if (letterIndex < 0) {
      return 0
    }
    return (letterIndex % 9) + 1
  }

  textToNumbers = text => {
    const textNumber = sum(text.split('').map(letter => this.letterToNumber(letter)))
    if (textNumber <= 0) {
      return []
    }
    return reduceToDigit(textNumber)
  }
}

const LANGUAGES = {
  Українська: new Language({
    alphabet: 'абвгґдеєжзиіїйклмнопрстуфхцчшщьюя',
    vowels: 'аеєиіїоуюя',
  }),
  Русский: new Language({
    alphabet: 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя',
    vowels: 'аеёиоуыэюя',
  }),
  English: new Language({
    alphabet: 'abcdefghijklmnopqrstuvwxyz',
    vowels: 'aeiou',
  }),
}

class LettersInfo extends React.Component {
  render() {
    const { word } = this.props
    if (word.length <= 0) {
      return null
    }
    const language = LANGUAGES[this.props.language]

    return (
      <table className="letters-table">
        <thead>
          <tr>
            {word.split('').map((letter, index) => (
              <th
                key={`${index}-${letter}`}
                className={`${language.isVowel(letter) ? 'vowel' : ''} ${
                  language.isConsonant(letter) ? 'consonant' : ''
                }`}
              >
                {letter}
              </th>
            ))}
            <th className="total vowel">{`Гласные`}</th>
            <th className="total consonant">{`Согласные`}</th>
            <th className="total">{`Итог`}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {word.split('').map((letter, index) => (
              <td
                key={`${index}-${letter}`}
                className={`${language.isVowel(letter) ? 'vowel' : ''} ${
                  language.isConsonant(letter) ? 'consonant' : ''
                }`}
              >
                {language.letterToNumber(letter)}
              </td>
            ))}
            <td className="total vowel">
              {displayAsChain(
                language.textToNumbers(
                  word
                    .split('')
                    .filter(language.isVowel)
                    .join('')
                )
              )}
            </td>
            <td className="total consonant">
              {displayAsChain(
                language.textToNumbers(
                  word
                    .split('')
                    .filter(language.isConsonant)
                    .join('')
                )
              )}
            </td>
            <td className="total">{displayAsChain(language.textToNumbers(word))}</td>
          </tr>
        </tbody>
      </table>
    )
  }
}

class TotalsInfo extends React.Component {
  render() {
    const language = LANGUAGES[this.props.language]
    const { words } = this.props

    return (
      <table>
        <thead>
          <tr>
            <th className="vowel">Гласные</th>
            <th className="consonant">Согласные</th>
            <th>Итог</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              {displayAsChain(
                reduceToDigit(
                  sum(
                    words.map(word =>
                      last(
                        language.textToNumbers(
                          word
                            .split('')
                            .filter(language.isVowel)
                            .join('')
                        )
                      )
                    )
                  )
                )
              )}
            </td>
            <td>
              {displayAsChain(
                reduceToDigit(
                  sum(
                    words.map(word =>
                      last(
                        language.textToNumbers(
                          word
                            .split('')
                            .filter(language.isConsonant)
                            .join('')
                        )
                      )
                    )
                  )
                )
              )}
            </td>
            <td>
              {displayAsChain(
                reduceToDigit(sum(words.map(word => last(language.textToNumbers(word)))))
              )}
            </td>
          </tr>
        </tbody>
      </table>
    )
  }
}

class WordsInfo extends React.Component {
  render() {
    const words = this.props.text.split(' ')
    return (
      <>
        {words.map(word => (
          <LettersInfo key={word} language={this.props.language} word={word} />
        ))}
        <TotalsInfo language={this.props.language} words={words} />
      </>
    )
  }
}

export default class extends React.Component {
  state = {
    language: Object.keys(LANGUAGES)[0],
    text: 'имя',
  }

  componentWillMount() {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker
          .register('/sw.js')
          .then(function(registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope)
          })
          .catch(function(err) {
            console.log('ServiceWorker registration failed: ', err)
          })
      })
    }
  }

  render() {
    return (
      <>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>{`
          .letters-table {
            margin: 3em 0;
          }

          .vowel {
            color: #57AA57;
          }

          .consonant {
            color: #927171;
          }

          .letters-table th, .letters-table td {
            padding: 0 0.3em;
          }

          .letters-table .total {
            padding: 0 1em;
            background-color: #EEE;
            font-weight: bold;
          }

          .letters-table .total.vowel {
            border-left: 1px dotted black;
          }
        `}</style>
        <select onChange={this.handleLanguageChange} value={this.state.language}>
          {Object.keys(LANGUAGES).map(language => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </select>
        <input type="text" onChange={this.handleTextChange} value={this.state.text} />
        <WordsInfo language={this.state.language} text={this.state.text} />
      </>
    )
  }

  handleLanguageChange = event => {
    this.setState({ language: event.target.value })
  }

  handleTextChange = event => {
    this.setState({ text: event.target.value })
  }
}
