const separator = '----------------------------------'

const isThisANewRelease = (bool, prev, curr) => {
  console.log(separator)
  if (bool) {
    console.log('The newly scraped object is identical to the previous one')
  } else {
    console.log('The newly scraped object is DIFFERENT than the last one!')
  }
  console.log(prev)
  console.log(curr)
  console.log(separator)
}

module.exports = {
  isThisANewRelease
}
