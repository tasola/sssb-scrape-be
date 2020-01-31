process.env.NODE_ENV = 'test'
const analyze = require('../../services/analyze')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const sinon = require('sinon')
require('should')

describe('analyze', () => {
  afterEach(() => {
    sinon.restore()
  })

  describe('checkIfNewRelease()', () => {
    it('should return curr', async () => {
      const result = analyze.checkIfNewRelease(prev, curr)
      result.should.deepEqual(curr)
    })
  })

  describe('handlePotentialNewRelease()', () => {
    it('should return curr', async () => {
      const result = analyze.handlePotentialNewRelease(prev, curr)
      result.should.deepEqual(curr)
    })
  })

  describe('handleBatchChange()', () => {
    it('should call handleNewShortTerms once', async () => {
      const handleNewShortTermsStub = sinon
        .stub(analyze.factory, 'handleNewShortTerms')
        .returns(1)
      analyze.handleBatchChange(prev, curr)
      handleNewShortTermsStub.callCount.should.equal(1)
    })

    it('should not call handleNewFlush', async () => {
      const handleNewFlushStub = sinon
        .stub(analyze.factory, 'handleNewFlush')
        .returns(1)
      analyze.handleBatchChange(prev, curr)
      handleNewFlushStub.callCount.should.equal(0)
    })

    it('should call handleNewFlush because of a new release with one re-release', async () => {
      const handleNewFlushStub = sinon
        .stub(analyze.factory, 'handleNewFlush')
        .returns(1)
      analyze.handleBatchChange(prev, newReleaseWithARerelease)
      handleNewFlushStub.callCount.should.equal(1)
    })
  })

  describe('handleNewRelease()', () => {
    it('should call amountOfShortTerms', () => {
      const amountOfShortTermsStub = sinon.stub(
        analyze.factory,
        'amountOfShortTerms'
      )
      analyze.factory.handleNewRelease(prev, curr)
      amountOfShortTermsStub.callCount.should.equal(1)
    })

    it('should call handleNewShortTerms once if any short terms are detected', () => {
      sinon.stub(analyze.factory, 'amountOfShortTerms').returns(1)
      const handleNewShortTermsStub = sinon.stub(
        analyze.factory,
        'handleNewShortTerms'
      )
      analyze.factory.handleNewRelease(prev, curr)
      handleNewShortTermsStub.callCount.should.equal(1)
    })

    it('should call handleNewFlush once if no short terms are detected', () => {
      sinon.stub(analyze.factory, 'amountOfShortTerms').returns(0)
      const handleNewFlushStub = sinon.stub(analyze.factory, 'handleNewFlush')
      analyze.factory.handleNewRelease(prev, curr)
      handleNewFlushStub.callCount.should.equal(1)
    })
  })

  describe('amountOfShortTerms()', () => {
    it('should return 1', async () => {
      const idHitsDict = analyze.countIdHits(prev, curr)
      const result = analyze.amountOfShortTerms(idHitsDict)
      result.should.deepEqual(1)
    })
  })
})

const prev = [
  {
    area: 'Nyponet',
    floor: '18',
    adress: '0823-2102-2122',
    id: '0823-2102-2122',
    link: 'www.nyponet1.se'
  },
  {
    area: 'Kungshamra',
    floor: '01',
    adress: '0823-1010-2122',
    id: '0823-1010-2122',
    link: 'www.kungshamra1.se'
  }
]

const curr = [
  {
    area: 'Nyponet',
    floor: '18',
    adress: '0823-2102-2122',
    id: '0823-2102-2122',
    link: 'www.nyponet1.se'
  },
  {
    area: 'Nyponet',
    floor: '05',
    adress: '0823-9823-2122',
    id: '0823-9823-2122',
    link: 'www.nyponet2.se'
  },
  {
    area: 'Kungshamra',
    floor: '01',
    adress: '0823-1010-2122',
    id: '0823-1010-2122',
    link: 'www.kungshamra1.se'
  }
]

const newReleaseWithARerelease = [
  {
    area: 'Nyponet',
    floor: '18',
    adress: '0823-2102-2122',
    id: '0823-2102-2122',
    link: 'www.nyponet1.se'
  },
  {
    area: 'Nyponet',
    floor: '05',
    adress: '0823-6124-2122',
    id: '0823-9823-2122',
    link: 'www.nyponet2.se'
  },
  {
    area: 'Jerum',
    floor: '01',
    adress: '0823-0192-2122',
    id: '0823-1010-2122',
    link: 'www.kungshamra1.se'
  },
  {
    area: 'Kungshamra',
    floor: '01',
    adress: '0823-1234-2122',
    id: '0823-1010-2122',
    link: 'www.kungshamra1.se'
  },
  {
    area: 'Kungshamra',
    floor: '01',
    adress: '0823-6534-2122',
    id: '0823-1010-2122',
    link: 'www.kungshamra1.se'
  }
]
