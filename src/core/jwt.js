import jwt from 'jsonwebtoken'

export const sign = (token, secret) => {
  return jwt.sign(token, secret)
}

export const verify = (payload, secret) => {
  return jwt.verify(payload, secret)
}
