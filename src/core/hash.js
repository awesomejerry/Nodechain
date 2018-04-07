import CryptoJS from 'crypto-js'

export default (input) => {
  const output = CryptoJS.SHA256(input)
  return output.toString()
}
