// import packages
/* eslint-disable max-len */
import mariadb from 'mariadb'
import config from '../config.js'
// eslint-disable-next-line no-unused-vars
import Discord from 'discord.js'

// initialize the connection pool
const pool = mariadb.createPool({
  host: config.dbhost,
  user: config.dbuser,
  password: config.dbpassword,
  port: config.dbport,
  database: config.dbDataBase,
  multipleStatements: true,
  connectionLimit: 5
})

/**
 * Initialized the Database
 */
async function initDB() {
  let conn
  try {
    console.log('Start DB Connection')
    conn = await pool.getConnection()
    console.log('DB Connection established')
    // create Table for SUN Members
    await conn.query(
      'CREATE TABLE IF NOT EXISTS `SUN_Members` (`key` VARCHAR(255), `value` VARCHAR(255), PRIMARY KEY (`key`))'
    )
  } catch (err) {
    throw err
  } finally {
    if (conn) return conn.end()
  }
}

/**
 * Finds an ingame name in the SUN_Members table
 * @param {string} key
 * @return {string}
 */
async function findPlayer(key) {
  let conn
  let returnValue = undefined
  try {
    conn = await pool.getConnection()
    const rows = await conn.query(
      `SELECT \`value\` FROM \`SUN_Members\` WHERE \`key\` = ${pool.escape(
        key
      )}`
    )
    if (rows && rows[0]) {
      returnValue = rows[0].value
    }
  } catch (err) {
    throw err
  } finally {
    if (conn) conn.end()
  }
  return returnValue
}

/**
 * Saves a new player with their ingame name in SUN_Management table.
 * Returns true if the save was successfull (player was not already in the database)
 * @param {string} key
 * @param {string} value
 * @return {boolean}
 */
async function savePlayer(key, value) {
  let conn
  let returnValue = true
  try {
    conn = await pool.getConnection()
    const rows = await conn.query(
      `SELECT \`key\` FROM \`SUN_Members\` WHERE \`value\` = ${pool.escape(
        value
      )} AND \`key\` != ${pool.escape(key)}`
    )
    if (rows && rows[0] && value !== config.ignoreRole) {
      returnValue = false
    } else {
      await conn.query(
        `INSERT INTO \`SUN_Members\` VALUES (${pool.escape(key)}, ${pool.escape(
          value
        )})`
      )
    }
  } catch (err) {
    throw err
  } finally {
    if (conn) conn.end()
    return returnValue
  }
}

/**
 * Edits the current player ingame name.
 * Returns true if edit was successfull (ingame name does not already exist)
 * @param {string} key
 * @param {string} value
 * @return {boolean}
 */
async function editPlayer(key, value) {
  let conn
  let returnValue = true
  try {
    conn = await pool.getConnection()
    const rows = await conn.query(
      `SELECT \`key\` FROM \`SUN_Members\` WHERE \`value\` = ${pool.escape(
        value
      )} AND \`key\` != ${pool.escape(key)}`
    )
    if (rows && rows[0] && value !== config.ignoreRole) {
      returnValue = false
    } else {
      await conn.query(
        `UPDATE \`SUN_Members\` SET \`value\`=${pool.escape(
          value
        )} WHERE \`key\` = ${pool.escape(key)}`
      )
    }
  } catch (err) {
    throw err
  } finally {
    if (conn) conn.end()
    return returnValue
  }
}

/**
 * Finds a discord is given a ingame name
 * @param {string} value
 * @return {string}
 */
async function findPlayerFromIngameName(value) {
  let conn
  let returnValue = undefined
  try {
    conn = await pool.getConnection()
    const rows = await conn.query(
      `SELECT \`key\` FROM \`SUN_Members\` WHERE \`value\` = ${pool.escape(
        value
      )}`
    )
    if (rows && rows[0]) {
      returnValue = rows[0].key
    }
  } catch (err) {
    throw err
  } finally {
    if (conn) conn.end()
  }
  return returnValue
}

/**
 * Removes an entry from the database
 * @param {string} key
 */
async function removePlayer(key) {
  let conn
  try {
    conn = await pool.getConnection()
    await conn.query(
      `DELETE FROM \`SUN_Members\` WHERE \`key\` = ${pool.escape(key)}`
    )
  } catch (err) {
    throw err
  } finally {
    if (conn) return conn.end()
  }
}

export default {
  initDB,
  findPlayer,
  savePlayer,
  editPlayer,
  findPlayerFromIngameName,
  removePlayer
}
