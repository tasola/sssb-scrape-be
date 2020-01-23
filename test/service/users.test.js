const users = require('../../services/users')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const sinon = require('sinon')
require('should')

describe('users', () => {
  afterEach(() => {
    sinon.restore()
  })
  describe('updateUsersSubscriptions()', () => {
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

    it('should return a correct formatted object of subscribers/areas from skratch', async () => {
      const correctUsersSubscriptions = {
        'testmail1@mail.com': [areas[0]],
        'testmail2@mail.com': [areas[0]]
      }

      let usersSubscriptions = {}
      const subscriberEmails = ['testmail1@mail.com', 'testmail2@mail.com']
      const apartment = areas[0]

      const results = users.updateUsersSubscriptions(
        usersSubscriptions,
        subscriberEmails,
        apartment
      )

      results.should.deepEqual(correctUsersSubscriptions)
    })

    it('should return a correct formatted object of subscribers/areas based on a pre-existing object', async () => {
      const correctUsersSubscriptions = {
        'testmail1@mail.com': [areas[0], areas[1], areas[2]],
        'testmail2@mail.com': [areas[0]],
        'testmail3@mail.com': [areas[0], areas[2]]
      }

      let usersSubscriptions = {
        'testmail1@mail.com': [areas[0], areas[1]],
        'testmail2@mail.com': [areas[0]],
        'testmail3@mail.com': [areas[0]]
      }

      const subscriberEmails = ['testmail1@mail.com', 'testmail3@mail.com']
      const apartment = areas[2]

      const results = users.updateUsersSubscriptions(
        usersSubscriptions,
        subscriberEmails,
        apartment
      )

      results.should.deepEqual(correctUsersSubscriptions)
    })
  })
})
