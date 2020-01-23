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
})
