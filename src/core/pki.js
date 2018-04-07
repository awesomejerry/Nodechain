import forge from 'node-forge'

const pki = forge.pki
const rsa = pki.rsa
const sha256md = forge.md.sha256

export const generate = () => {
  const pair = rsa.generateKeyPair({ bits: 2048, e: 0x10001 })
  return {
    publicKey: pki.publicKeyToPem(pair.publicKey),
    privateKey: pki.privateKeyToPem(pair.privateKey)
  }
}

export const encrypt = ({ message, key }) => {
  const publicKey = pki.publicKeyFromPem(key)
  return publicKey.encrypt(message)
}

export const decrypt = ({ buffer, key }) => {
  const privateKey = pki.privateKeyFromPem(key)
  return privateKey.decrypt(buffer)
}

export const sign = ({ message, key }) => {
  const md = sha256md.create();
  md.update(message);
  const privateKey = pki.privateKeyFromPem(key)
  return privateKey.sign(md)
}

export const verify = ({ message, signature, key }) => {
  const md = sha256md.create();
  md.update(message);
  const publicKey = pki.publicKeyFromPem(key)
  return publicKey.verify(md.digest().bytes(), signature)
}
