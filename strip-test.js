const fs = require('fs')
const path = require('path')

const target = 'no-test'
const source = 'src'

if (!fs.existsSync(target)){
  fs.mkdirSync(target)
}
fs.readdirSync(source)
  .filter((file) => file !== 'test.ts')
  .forEach((file) => {
    const content = fs.readFileSync(path.join(source, file)).toString()
    const newContent = content
      .replace(/.*\/\/ <test>/g, '')
      .replace(/\/\/ <test[^>].*?\/\/ test>/sg, '')
    fs.writeFileSync(path.join(target, file), newContent)
  })