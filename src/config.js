// import packages
import fs from 'fs'

// Parse config.json file
const config = JSON.parse(fs.readFileSync('./src/config.json'))
// add version to the object by parsing the package.json
config.version = JSON.parse(fs.readFileSync('package.json')).version

// export the config object
export default config
