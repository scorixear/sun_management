import mariadb from 'mariadb';

import config from '../config.js';

// initialize the connection pool
const pool = mariadb.createPool({
  host: config.dbhost,
  user: config.dbuser,
  password: config.dbpassword,
  port: config.dbport,
  database: config.dbDataBase,
  multipleStatements: true,
  connectionLimit: 5
});

/**
 * Initialized the Database
 */
async function initDB() {
  let conn;
  try {
    console.log('Start DB Connection');
    conn = await pool.getConnection();
    console.log('DB Connection established');
    // create Table for SUN Members
    await conn.query(
      'CREATE TABLE IF NOT EXISTS `SUN_Members` (`key` VARCHAR(255), `value` VARCHAR(255), PRIMARY KEY (`key`))'
    );
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.end();
  }
}

/**
 * Finds an in-game name in the SUN_Members table
 * @param {String} key
 * @return {Promise<String>}
 */
async function findPlayer(key) {
  let conn;
  let returnValue = undefined;
  try {
    console.log(`Finding player ${key}`);
    conn = await pool.getConnection();
    const rows = await conn.query(
      `SELECT \`value\` FROM \`SUN_Members\` WHERE \`key\` = ${pool.escape(
        key
      )}`
    );

    // console.log(rows[0]);
    // console.log(rows.length);
    if (rows && rows.length >= 1) {
      returnValue = rows[0].value;
    }
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
  console.log(`FIND PLAYER RETURNS:\n${returnValue}`);
  return returnValue;
}

/**
 * Saves a new player with their in-game name in SUN_Management table.
 * Returns true if the save was successful (player was not already in the database)
 * @param {String} key
 * @param {String} value
 * @return {Promise<Boolean>}
 */
async function savePlayer(key, value) {
  let conn;
  let returnValue = true;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      `SELECT \`key\` FROM \`SUN_Members\` WHERE \`value\` = ${pool.escape(
        value
      )} AND \`key\` != ${pool.escape(key)}`
    );
    if (rows && rows[0] && value !== config.ignoreRole) {
      returnValue = false;
    } else {
      await conn.query(
        `INSERT INTO \`SUN_Members\` VALUES (${pool.escape(key)}, ${pool.escape(
          value
        )})`
      );
    }
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (conn) conn.end();
    return returnValue;
  }
}

/**
 * Edits the current player in-game name.
 * Returns true if edit was successful (in-game name does not already exist)
 * @param {String} key
 * @param {String} value
 * @return {Promise<Boolean>}
 */
async function editPlayer(key, value) {
  let conn;
  let returnValue = true;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      `SELECT \`key\` FROM \`SUN_Members\` WHERE \`value\` = ${pool.escape(
        value
      )} AND \`key\` != ${pool.escape(key)}`
    );
    if (rows && rows[0] && value !== config.ignoreRole) {
      returnValue = false;
    } else {
      await conn.query(
        `UPDATE \`SUN_Members\` SET \`value\`=${pool.escape(
          value
        )} WHERE \`key\` = ${pool.escape(key)}`
      );
    }

    console.log(`Editing player ${key}`);
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (conn) conn.end();
    return returnValue;
  }
}

/**
 * Finds a discord user given an in-game name
 * @param {String} value
 * @return {Promise<String>}
 */
async function findPlayerFromInGameName(value) {
  let conn;
  let returnValue = undefined;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      `SELECT \`key\` FROM \`SUN_Members\` WHERE \`value\` = ${pool.escape(
        value
      )}`
    );
    if (rows && rows[0]) {
      returnValue = rows[0].key;
    }
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
  return returnValue;
}

/**
 * Removes an entry from the database
 * @param {string} key
 */
async function removePlayer(key) {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log(`Removing player "${key}"`);
    await conn.query(
      `DELETE FROM \`SUN_Members\` WHERE \`key\` = ${pool.escape(key)}`
    );
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.end();
  }
}

export default {
  initDB,
  findPlayer,
  savePlayer,
  editPlayer,
  findPlayerFromInGameName,
  removePlayer
};
