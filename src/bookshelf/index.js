import Book from './book'
import Account from './account'
import Chapter from './chapter'
import Paragraph from './paragraph'
import Network from '../network'
import hashFunction from '../core/hash'

const defaultProps = {}

const DAY = 86400000

export default class Bookshelf {
  books = [new Book()]
  chapters = {}
  paragraphs = {}
  temporalParagraphs = []
  keys = null
  constructor({ keys, ...props } = defaultProps) {
    this.network = new Network({
      ...props,
      keys,
      onBroadcast: this.onBroadcast
    })
    this.keys = keys
  }
  beginParagraph = async payload => {
    const paragraph = new Paragraph()
    const paragraphId = paragraph.begin(payload)
    this.temporalParagraphs.push(paragraph)
    return paragraphId
  }
  continueParagraph = async ({ participant, paragraphId }) => {
    // TODO: validate participant = source (by public key?)
    const temporalParagraph = await this.retrieveTemporalParagraph(paragraphId)

    // find related chapters for future validation
    const { payload } = temporalParagraph
    const stakeholders = [payload.initiator, ...payload.participants]
    const chapterIds = combination(stakeholders)
      .filter(com => com.length > 1 && com.indexOf(participant) !== -1)
      .map(com => hashFunction(com.join()))
    const chapter = await this.retrieveChapter(hashFunction(participant))
    chapterIds.filter(id => chapter.relatedChapters.indexOf(id) === -1) // find those un-tracked
      .forEach(chapterId => chapter.relatedChapters.push(chapterId))

    temporalParagraph.continue(participant)
  }
  endParagraph = async ({ paragraphId: temporalId }) => {
    // TODO: triggered by smart contract or initiator
    const temporalParagraph = await this.retrieveTemporalParagraph(temporalId)
    const prevParagraph = await this.validateParagraph(temporalParagraph)
    const paragraphId = temporalParagraph.end(prevParagraph)
    const {
      initiator,
      participants,
      executeAt,
      duration
    } = temporalParagraph.payload
    const stakeholders = [initiator, ...participants]
    stakeholders.sort()
    const chapterId = hashFunction(stakeholders.join())
    const book = await this.retrieveBook()
    const chapter = await this.retrieveChapter(chapterId)
    book.chapters = [...book.chapters, chapterId]
    chapter.addParagraph(paragraphId)
    this.paragraphs[paragraphId] = {
      id: paragraphId,
      prevParagraph,
      payload: temporalParagraph.payload,
      timestamp: Date.now()
    }
    this.removeTemporalParagraph()
    return paragraphId
  }
  validateParagraph = async paragraph => {
    const { payload } = paragraph
    const stakeholders = [payload.initiator, ...payload.participants]
    const chapterIds = combination(stakeholders).map(com =>
      hashFunction(com.join())
    )
    const chapters = await chapterIds.map(this.retrieveChapter)

    const relatedChapters = await chapters
      .reduce((acc, cur) => acc.concat(cur.relatedChapters), [])
      .filter(chapter => chapterIds.indexOf(chapter.id) === -1)
      .map(this.retrieveChapter)

    const paragraphs = chapters.concat(relatedChapters).reduce(
      (acc, cur) => [...acc, ...cur.paragraphs],
      []
    )
    const prevParagraphs = await paragraphs.map(this.retrieveParagraph)
    if (!paragraph.validate(prevParagraphs)) {
      throw new Error('paragraph error: validate failed')
    }

    return paragraphs[paragraphs.length - 1] || ''
  }
  retrieveBook = () => {
    return this.books[0]
  }
  retrieveChapter = chapterId => {
    const chapter = this.chapters[chapterId]
    if (!chapter) {
      const chapter = new Chapter(chapterId)
      this.chapters[chapterId] = chapter
    }
    return this.chapters[chapterId]
  }
  retrieveParagraph = paragraphId => {
    return this.paragraphs[paragraphId]
  }
  retrieveTemporalParagraph = paragraphId => {
    return this.temporalParagraphs.find(p => p.temporal.id === paragraphId)
  }
  removeTemporalParagraph = paragraphId => {
    this.temporalParagraphs.splice(
      this.temporalParagraphs.findIndex(p => p.temporal.id === paragraphId),
      1
    )
  }
  broadcast = (...args) => {
    this.network.broadcast(...args)
  }
  onBroadcast = data => {
    const { type, payload } = data
    if (type === 'update-to-date') {
    }
  }
}

function combination(arr) {
  let i, j, temp
  let result = []
  let arrLen = arr.length
  let power = Math.pow
  let combinations = power(2, arrLen)

  // Time & Space Complexity O (n * 2^n)

  for (i = 0; i < combinations; i++) {
    temp = []

    for (j = 0; j < arrLen; j++) {
      // & is bitwise AND
      if (i & power(2, j)) {
        temp.push(arr[j])
      }
    }
    if (temp.length !== 0) {
      result.push(temp)
    }
  }
  return result
}
