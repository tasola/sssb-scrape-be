const utils = require('../../utils/utils')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const sinon = require('sinon')
require('should')

describe('utils', () => {
  afterEach(() => {
    sinon.restore()
  })
  const areas = [
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

  const fewAreas = [
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

  const manyAreas = [
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
    },
    {
      area: 'Lappkärrsberget',
      floor: '06',
      adress: '0823-12313-2122',
      link: 'www.lappis1.se'
    }
  ]

  const similarObject = {
    area: 'Nyponet',
    floor: '19',
    adress: '0823-2102-2122',
    link: 'www.nyponet1.se'
  }

  describe('arraysOfObjectsAreSame()', () => {
    it('should return true as the arrays are identical', () => {
      const identicalArray = Object.assign({}, areas)
      const result = utils.arraysOfObjectsAreSame(areas, identicalArray)
      result.should.be.true
    })
    it('should return false as the first is longer than the other', () => {
      const result = utils.arraysOfObjectsAreSame(areas, fewAreas)
      result.should.be.false
    })
    it('should return false as the first is shorter than the other', () => {
      const result = utils.arraysOfObjectsAreSame(areas, manyAreas)
      result.should.be.false
    })
  })

  describe('objectsAreSame()', () => {
    it('should return true as the objects are identical', () => {
      const object = areas[0]
      const identicalObject = manyAreas[0]
      const result = utils.objectsAreSame(object, identicalObject)
      result.should.be.true
    })
    it('should return false as the objects have different values, although same keys', () => {
      const object = areas[0]
      const result = utils.objectsAreSame(object, similarObject)
      result.should.be.false
    })
  })

  describe('getFloorFromAdress()', () => {
    it('should return "2"', () => {
      const adress = 'Kungshamra 3, 1227'
      const result = utils.getFloorFromAdress(adress, 'Kungshamra')
      result.should.equal('2')
    })
    it('should return "0"', () => {
      const adress = 'Professorslingan 4, 1011'
      const result = utils.getFloorFromAdress(adress, 'Lappkärrsberget')
      result.should.equal('0')
    })
    it('should return "10"', () => {
      const adress = 'Professorslingan 4, 2015'
      const result = utils.getFloorFromAdress(adress, 'Lappkärrsberget')
      result.should.equal('10')
    })
    it('should return "22"', () => {
      const adress = 'Professorslingan 4, 3202'
      const result = utils.getFloorFromAdress(adress, 'Lappkärrsberget')
      result.should.equal('22')
    })
    it('should return "10" for special case Nyponet', () => {
      const adress = 'Körsbärsvägen 9, 1602'
      const result = utils.getFloorFromAdress(adress, 'Nyponet')
      result.should.equal('10')
    })
    it('should return "18" for special case Nyponet', () => {
      const adress = 'Körsbärsvägen 9, 2403'
      const result = utils.getFloorFromAdress(adress, 'Nyponet')
      result.should.equal('18')
    })
  })

  describe('removeLeadingZeroFromString()', () => {
    it('should return "0"', () => {
      const floor = '0'
      const result = utils.removeLeadingZeroFromString(floor)
      result.should.equal('0')
    })
    it('should return "3"', () => {
      const floor = '03'
      const result = utils.removeLeadingZeroFromString(floor)
      result.should.equal('3')
    })
    it('should return "10"', () => {
      const floor = '10'
      const result = utils.removeLeadingZeroFromString(floor)
      result.should.equal('10')
    })
    it('should return "100"', () => {
      const floor = '100'
      const result = utils.removeLeadingZeroFromString(floor)
      result.should.equal('100')
    })
  })
})
