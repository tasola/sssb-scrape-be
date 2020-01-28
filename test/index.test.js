const importTest = (name, path) => {
  describe(name, () => {
    require(path)
  })
}

describe('index', () => {
  describe('Service tests', () => {
    importTest('analyze', './service/analyze.test.js')
    importTest('users', './service/users.test.js')
  })
  describe('Utils tests', () => {
    importTest('mail', './utils/mail.test.js')
    importTest('utils', './utils/utils.test.js')
  })
})
