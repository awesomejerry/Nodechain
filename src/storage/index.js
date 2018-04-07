import { sign, verify } from '../core/jwt'
import InMemory from './InMemory'

const defaultProps = {}

export default class Storage {
  constructor({ instance = new InMemory(), uuid = 'secret' } = defaultProps) {
    this._instance = instance
    this._uuid = uuid
  }
  save = (key, data) => {
    if (!this._instance || !this._instance.save) {
      throw new Error(
        "The instance of custom storage doesn't implement `save` method!"
      )
    }
    return this._instance.save(key, sign(data, this._uuid)).then(() => data)
  }
  load = key => {
    if (!this._instance || !this._instance.load) {
      throw new Error(
        "The instance of custom storage doesn't implement `load` method!"
      )
    }
    return this._instance.load(key).then(data => verify(data, this._uuid))
  }
}
