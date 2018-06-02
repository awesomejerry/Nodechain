import BookShelf from '../index'

const prepareBookshelf = async () => {
  const bookshelf = new BookShelf()

  const payload1 = {
    amount: 100,
    initiator: 'a',
    participants: [],
    executeAt: '2018-12-30T08:00+0800',
    duration: '2h'
  }
  const paragraphId1 = await bookshelf.beginParagraph(payload1)
  await bookshelf.endParagraph({ paragraphId: paragraphId1 })

  const payload2 = {
    amount: 100,
    initiator: 'b',
    participants: [],
    executeAt: '2018-12-30T09:00+0800',
    duration: '2h'
  }
  const paragraphId2 = await bookshelf.beginParagraph(payload2)
  await bookshelf.endParagraph({ paragraphId: paragraphId2 })

  const payload3 = {
    amount: 100,
    initiator: 'c',
    participants: [],
    executeAt: '2018-12-30T10:00+0800',
    duration: '2h'
  }
  const paragraphId3 = await bookshelf.beginParagraph(payload3)
  await bookshelf.endParagraph({ paragraphId: paragraphId3 })

  return bookshelf
}

describe('bookshelf', () => {
  it('should have the right amount of paragraphs', async () => {
    const bookshelf = await prepareBookshelf()

    const payload1 = {
      amount: 20,
      initiator: 'a',
      participants: ['b', 'c'],
      executeAt: '2018-12-31T11:00+0800',
      duration: '2h'
    }
    const paragraphId1 = await bookshelf.beginParagraph(payload1)
    await bookshelf.continueParagraph({
      participant: 'b',
      paragraphId: paragraphId1
    })
    await bookshelf.continueParagraph({
      participant: 'c',
      paragraphId: paragraphId1
    })
    await bookshelf.endParagraph({ paragraphId: paragraphId1 })

    const payload2 = {
      amount: 30,
      initiator: 'a',
      participants: ['b', 'c'],
      executeAt: '2018-12-31T12:00+0800',
      duration: '2h'
    }
    const paragraphId2 = await bookshelf.beginParagraph(payload2)
    await bookshelf.continueParagraph({
      participant: 'b',
      paragraphId: paragraphId2
    })
    await bookshelf.continueParagraph({
      participant: 'c',
      paragraphId: paragraphId2
    })
    await bookshelf.endParagraph({ paragraphId: paragraphId2 })

    expect(Object.keys(bookshelf.paragraphs)).toHaveLength(5)
  })

  it('should validate paragraphs correctly', async () => {
    const bookshelf = await prepareBookshelf()

    const payload1 = {
      amount: 20,
      initiator: 'a',
      participants: ['b'],
      executeAt: '2018-12-31T12:00+0800',
      duration: '2h'
    }
    const temporalId1 = await bookshelf.beginParagraph(payload1)
    await bookshelf.continueParagraph({
      participant: 'b',
      paragraphId: temporalId1
    })
    await bookshelf.endParagraph({ paragraphId: temporalId1 })

    const payload2 = {
      amount: 30,
      initiator: 'c',
      participants: ['b'],
      executeAt: '2018-12-31T12:00+0800',
      duration: '2h'
    }
    const temporalId2 = await bookshelf.beginParagraph(payload2)
    await bookshelf.continueParagraph({
      participant: 'b',
      paragraphId: temporalId2
    })
    await bookshelf.endParagraph({ paragraphId: temporalId2 })

    const payload3 = {
      amount: 20,
      initiator: 'a',
      participants: ['c'],
      executeAt: '2018-12-31T12:00+0800',
      duration: '2h'
    }
    const temporalId3 = await bookshelf.beginParagraph(payload3)
    await bookshelf.continueParagraph({
      participant: 'c',
      paragraphId: temporalId3
    })

    const paragraphId = await bookshelf.endParagraph({ paragraphId: temporalId3 })

    expect(paragraphId).toBeDefined()
  })

  it('should validate paragraphs correctly 2', async () => {
    const bookshelf = await prepareBookshelf()

    const payload1 = {
      amount: 20,
      initiator: 'a',
      participants: ['b'],
      executeAt: '2018-12-31T12:00+0800',
      duration: '2h'
    }
    const temporalId1 = await bookshelf.beginParagraph(payload1)
    await bookshelf.continueParagraph({
      participant: 'b',
      paragraphId: temporalId1
    })
    await bookshelf.endParagraph({ paragraphId: temporalId1 })

    const payload2 = {
      amount: 30,
      initiator: 'c',
      participants: ['b'],
      executeAt: '2018-12-31T12:00+0800',
      duration: '2h'
    }
    const temporalId2 = await bookshelf.beginParagraph(payload2)
    await bookshelf.continueParagraph({
      participant: 'b',
      paragraphId: temporalId2
    })
    await bookshelf.endParagraph({ paragraphId: temporalId2 })

    const payload3 = {
      amount: 1000,
      initiator: 'a',
      participants: ['b'],
      executeAt: '2018-12-31T12:00+0800',
      duration: '2h'
    }
    const temporalId3 = await bookshelf.beginParagraph(payload3)
    await bookshelf.continueParagraph({
      participant: 'b',
      paragraphId: temporalId3
    })

    await expect(
      bookshelf.endParagraph({ paragraphId: temporalId3 })
    ).rejects.toThrowError('paragraph error: validate failed')
  })

  it('should throw errors if the paragraph is not complete', async () => {
    const bookshelf = await prepareBookshelf()

    const payload = {
      amount: 30,
      initiator: 'a',
      participants: ['b', 'c'],
      executeAt: '2018-12-31T12:00+0800',
      duration: '2h'
    }
    const paragraphId = await bookshelf.beginParagraph(payload)
    await bookshelf.continueParagraph({
      participant: 'b',
      paragraphId: paragraphId
    })

    await expect(
      bookshelf.endParagraph({ paragraphId: paragraphId })
    ).rejects.toThrowError('temporalParagraph error: paragraph not complete')
  })

  it('should throw errors if the paragraph is invalid', async () => {
    const bookshelf = await prepareBookshelf()

    const payload = {
      amount: 1000,
      initiator: 'a',
      participants: ['b'],
      executeAt: '2018-12-31T12:00+0800',
      duration: '2h'
    }
    const paragraphId = await bookshelf.beginParagraph(payload)
    await bookshelf.continueParagraph({
      participant: 'b',
      paragraphId: paragraphId
    })

    await expect(
      bookshelf.endParagraph({ paragraphId: paragraphId })
    ).rejects.toThrowError('paragraph error: validate failed')
  })

  it('should throw errors if the paragraph is tampered', async () => {
    const bookshelf = await prepareBookshelf()

    const p = Object.values(bookshelf.paragraphs)[0]
    p.payload.amount = 1000

    const payload = {
      amount: 100,
      initiator: 'a',
      participants: ['b'],
      executeAt: '2018-12-31T12:00+0800',
      duration: '2h'
    }
    const paragraphId = await bookshelf.beginParagraph(payload)
    await bookshelf.continueParagraph({
      participant: 'b',
      paragraphId: paragraphId
    })

    await expect(
      bookshelf.endParagraph({ paragraphId: paragraphId })
    ).rejects.toThrowError('paragraph error: payload has been tampered')
  })
})
