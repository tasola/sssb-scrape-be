const mail = require('../../utils/mail')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const sinon = require('sinon')
require('should')

describe('mail', () => {
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

  // Says that there are 3 new nyponet releases although there only are two. Expected, but TODO
  const correctEmail = {
    from: 'SSSB Info <sssb-scrape@hotmail.com>',
    to: 'mail1@mail.com',
    subject: '3 new Nyponet & Kungshamra releases!',
    text: '',
    html: `SSSB just released 3 new Nyponet & Kungshamra releases!\n Here\'s the apartments:\n</hr><p>Area: Nyponet</p><p>Floor: 18</p><p>Apartment number: 2122</p><p>Book it <a href=\'www.nyponet1.se\'> here <a/></p><hr><p>Area: Nyponet</p><p>Floor: 05</p><p>Apartment number: 2122</p><p>Book it <a href=\'www.nyponet2.se\'> here <a/></p><hr><p>Area: Kungshamra</p><p>Floor: 01</p><p>Apartment number: 2122</p><p>Book it <a href=\'www.kungshamra1.se\'> here <a/></p><hr>`
  }

  const correctShortTermEmail = {
    from: 'SSSB Info <sssb-scrape@hotmail.com>',
    to: 'mail1@mail.com',
    subject: '3 new SHORT TERM Nyponet & Kungshamra releases!',
    text: '',
    html: `SSSB just released 3 new SHORT TERM Nyponet & Kungshamra releases!\n Here\'s the apartments:\n</hr><p>Area: Nyponet</p><p>Floor: 18</p><p>Apartment number: 2122</p><p>Book it <a href=\'www.nyponet1.se\'> here <a/></p><hr><p>Area: Nyponet</p><p>Floor: 05</p><p>Apartment number: 2122</p><p>Book it <a href=\'www.nyponet2.se\'> here <a/></p><hr><p>Area: Kungshamra</p><p>Floor: 01</p><p>Apartment number: 2122</p><p>Book it <a href=\'www.kungshamra1.se\'> here <a/></p><hr>`
  }

  describe('generateContent()', () => {
    it('should return a correct formatted email', () => {
      const recipient = 'mail1@mail.com'
      const isShortTerm = false
      const email = mail.generateContent(areas, recipient, isShortTerm)
      email.should.deepEqual(correctEmail)
    })
  })

  describe('generateContent()', () => {
    it('should return "Nyponet"', () => {
      const oneArea = [areas[0]]
      const uniqueAreas = mail.getAllUniqueAreas(oneArea)
      uniqueAreas.should.equal('Nyponet')
    })
    it('should return "Nyponet & Kungshamra"', () => {
      const uniqueAreas = mail.getAllUniqueAreas(areas)
      uniqueAreas.should.equal('Nyponet & Kungshamra')
    })
    it('should return "Nyponet, Kungshamra & Hugin"', () => {
      const cloneAreas = areas.slice()
      cloneAreas.push({
        area: 'Hugin',
        floor: '05',
        adress: '0823-3142-2122',
        link: 'www.hugin1.se'
      })
      uniqueAreas = mail.getAllUniqueAreas(cloneAreas)
      uniqueAreas.should.equal('Nyponet, Kungshamra & Hugin')
    })
  })

  describe('generateSpecificContent()', () => {
    it('should return a correct formatted email', () => {
      const recipient = 'mail1@mail.com'
      const email = mail.generateSpecificContent(areas, recipient)
      email.should.deepEqual(correctEmail)
    })
  })

  describe('generateShortTermContent()', () => {
    it('should return a correct formatted email', () => {
      const recipient = 'mail1@mail.com'
      const email = mail.generateShortTermContent(areas, recipient)
      email.should.deepEqual(correctShortTermEmail)
    })
  })
})
