import CryptoJS from 'crypto-js'

export const encrypt = (payload, secret) => {
  var cipherText = CryptoJS.AES.encrypt(JSON.stringify(payload), secret)
  return cipherText.toString()
}

export const decrypt = (token, secret) => {
  const bytes = CryptoJS.AES.decrypt(token, secret)
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
}
