class Chapter {
  id = null
  paragraphs = []
  relatedChapters = []
  constructor(id) {
    this.id = id
  }
  addParagraph(paragraphId) {
    this.paragraphs.push(paragraphId)
  }
}

export default Chapter
