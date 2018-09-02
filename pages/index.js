const LANGUAGES = {
  Українська: {
    alphabet: 'абвгґдеєжзиіїйклмнопрстуфхцчшщьюя',
    vowels: 'аеєиіїоуюя',
  },
  Русский: {
    alphabet: 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя',
    vowels: 'аеёиоуыэюя',
  },
  English: {
    alphabet: 'abcdefghijklmnopqrstuvwxyz',
    vowels: 'aeiou',
  },
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

function letterToNumber(alphabet, letter) {
  const letterIndex = alphabet.indexOf(letter)
  if (letterIndex < 0) {
    return 0
  }
  return (letterIndex % 9) + 1
}

function textToNumbers(alphabet, text) {
  const textNumber = text
    .split('')
    .map(letter => letterToNumber(alphabet, letter))
    .reduce((acc, value) => acc + value, 0)
  if (textNumber <= 0) {
    return []
  }
  return reduceToDigit(textNumber)
}

class LettersInfo extends React.Component {
  render() {
    const { word } = this.props
    if (word.length <= 0) {
      return null
    }
    const { alphabet, vowels } = LANGUAGES[this.props.language]
    const isVowel = letter => vowels.indexOf(letter) >= 0
    const isConsonant = letter => alphabet.indexOf(letter) >= 0 && !isVowel(letter)

    return (
      <table className="letters-table">
        <thead>
          <tr>
            {word.split('').map((letter, index) => (
              <th
                key={`${index}-${letter}`}
                className={`${isVowel(letter) ? 'vowel' : ''} ${
                  isConsonant(letter) ? 'consonant' : ''
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
                className={`${isVowel(letter) ? 'vowel' : ''} ${
                  isConsonant(letter) ? 'consonant' : ''
                }`}
              >
                {letterToNumber(alphabet, letter)}
              </td>
            ))}
            <td className="total vowel">
              {textToNumbers(
                alphabet,
                word
                  .split('')
                  .filter(isVowel)
                  .join('')
              ).join(' → ')}
            </td>
            <td className="total consonant">
              {textToNumbers(
                alphabet,
                word
                  .split('')
                  .filter(isConsonant)
                  .join('')
              ).join(' → ')}
            </td>
            <td className="total">{textToNumbers(alphabet, word).join(' → ')}</td>
          </tr>
        </tbody>
      </table>
    )
  }
}

class WordsInfo extends React.Component {
  render() {
    return (
      <>
        {this.props.text.split(' ').map(word => (
          <LettersInfo key={word} language={this.props.language} word={word} />
        ))}
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
    if ('serviceWorker' in navigator) {
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
