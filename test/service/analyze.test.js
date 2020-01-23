process.env.NODE_ENV = 'test'
const proxyquire = require('proxyquire')
const analyze = require('../../services/analyze')
const refresh = require('../../services/refresh')
const mailUtils = require('../../utils/mail')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const sinon = require('sinon')
require('should')

describe('analyze', () => {
  afterEach(() => {
    sinon.restore()
  })

  const prev = [
    {
      area: 'Nyponet',
      floor: '18',
      adress: '0823-2102-2122',
      link: 'www.nyponet1.se'
    },
    {
      area: 'Kungshamra',
      floor: '01',
      adress: '0823-1010-2122',
      link: 'www.kungshamra1.se'
    }
  ]

  const curr = [
    {
      area: 'Nyponet',
      floor: '18',
      adress: '0823-2102-2122',
      link: 'www.nyponet1.se'
    },
    {
      area: 'Nyponet',
      floor: '05',
      adress: '0823-9823-2122',
      link: 'www.nyponet2.se'
    },
    {
      area: 'Kungshamra',
      floor: '01',
      adress: '0823-1010-2122',
      link: 'www.kungshamra1.se'
    }
  ]

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

  describe('amountOfShortTerms()', () => {
    it('should return 1', async () => {
      const result = analyze.amountOfShortTerms(prev, curr)
      result.should.deepEqual(1)
    })
  })
})
