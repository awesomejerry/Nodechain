import Account from './account'
import hash from '../core/hash'

class Paragraph {
  id = null
  prevParagraph = ''
  temporal = {
    expectSentences: [],
    currentSentences: []
  }
  payload = null
  static calculateId = payload => {
    const {
      amount,
      initiator,
      participants,
      executeAt,
      duration,
      prevParagraph = ''
    } = payload

    return hash(
      `${prevParagraph}_${initiator}_${Paragraph.sortAddresses(
        participants
      ).join()}_${amount}_${executeAt}_${duration}`
    )
  }
  static sortAddresses = addresses => {
    return [...addresses].sort()
  }
  begin(payload) {
    const { amount, participants, executeAt, duration } = payload
    this.temporal.id = Paragraph.calculateId(payload)
    this.temporal.expectSentences = Paragraph.sortAddresses(participants)
    this.payload = payload
    return this.temporal.id
  }
  continue(participant) {
    this.temporal.currentSentences.push(participant)
  }
  end(prevParagraph) {
    const { expectSentences, currentSentences } = this.temporal
    if (
      expectSentences.length !== currentSentences.length ||
      (expectSentences.length !== 0 &&
        !expectSentences.every(element => currentSentences.includes(element)))
    ) {
      throw new Error('temporalParagraph error: paragraph not complete')
    }
    this.prevParagraph = prevParagraph
    this.id = Paragraph.calculateId({ ...this.payload, prevParagraph })
    return this.id
  }
  validate(prevParagraphs) {
    const account = new Account()

    // genesis block
    if (prevParagraphs.length === 0) {
      return true
    }
    prevParagraphs.sort((a, b) => a.timestamp - b.timestamp)
    prevParagraphs.forEach(({ id, payload, prevParagraph }) => {
      const { initiator, participants, amount } = payload
      const expectedId = Paragraph.calculateId({ ...payload, prevParagraph })
      if (expectedId !== id) {
        throw new Error('paragraph error: payload has been tampered')
      }
      // genesis block
      if (participants.length === 0) {
        account.update(initiator, amount)
      }
      participants.forEach(p => {
        account.update(p, -amount)
        account.update(initiator, amount)
      })
    })
    if (
      this.payload.participants.every(p => account.get(p) > this.payload.amount)
    ) {
      return true
    }
    return false
  }
}

export default Paragraph
