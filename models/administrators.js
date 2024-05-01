"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { BCRYPT_WORK_FACTOR } = require("../config");

/** Related functions for administrators. */

class Administrator {
  /** Create an administrator (from data), update db, return new administrator data.
   *
   * data should be { name, email, title }
   *
   * Returns { id, name, email, title, dateCreated }
   *
   * Throws BadRequestError if administrator already in database.
   * */
  static async create({ name, email, title }) {
    const duplicateCheck = await db.query(
      `SELECT email
       FROM administrators
       WHERE email = $1`,
      [email]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate administrator email: ${email}`);

    const result = await db.query(
      `INSERT INTO administrators
       (name, email, title, date_created)
       VALUES ($1, $2, $3, current_timestamp)
       RETURNING id, name, email, title, date_created AS "dateCreated"`,
      [
        name,
        email,
        title,
      ]
    );
    const administrator = result.rows[0];

    return administrator;
  }
  
  /** Register a new administrator.
   *
   * Required data: { username, password, firstName, lastName, email }
   * Optional data: { isAdmin }
   *
   * Returns { username, isAdmin }
   */
  static async register({ username, password, firstName, lastName, email, isAdmin }) {
    // Check for duplicate administrator username
    const duplicateCheck = await db.query(
      `SELECT username
       FROM administrators
       WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate administrator username: ${username}`);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    // Insert the new admin into the database
    const result = await db.query(
      `INSERT INTO administrators
       (username, password, first_name, last_name, email, is_admin, date_created)
       VALUES ($1, $2, $3, $4, $5, $6, current_timestamp)
       RETURNING username, is_admin AS "isAdmin"`,
      [username, hashedPassword, firstName, lastName, email, isAdmin || false]
    );

    const newAdmin = result.rows[0];

    return newAdmin;
  }

  /** Find all administrators.
   *
   * Returns [{ id, name, email, title, dateCreated }, ...]
   * */
  static async findAll() {
    const administratorsRes = await db.query(
      `SELECT id,
              name,
              email,
              title,
              date_created AS "dateCreated"
       FROM administrators
       ORDER BY name`
    );
    return administratorsRes.rows;
  }

  /** Given an administrator's ID, return data about the administrator.
   *
   * Returns { id, name, email, title, dateCreated }
   *
   * Throws NotFoundError if not found.
   */
  static async get(id) {
    const administratorRes = await db.query(
      `SELECT id,
              name,
              email,
              title,
              date_created AS "dateCreated"
       FROM administrators
       WHERE id = $1`,
      [id]
    );

    const administrator = administratorRes.rows[0];

    if (!administrator) throw new NotFoundError(`No administrator: ${id}`);

    return administrator;
  }

  /** Update administrator data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, email, title}
   *
   * Returns { id, name, email, title, dateCreated }
   *
   * Throws NotFoundError if not found.
   */
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {}
    );
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE administrators 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                name, 
                                email, 
                                title, 
                                date_created AS "dateCreated"`;
    const result = await db.query(querySql, [...values, id]);
    const administrator = result.rows[0];

    if (!administrator) throw new NotFoundError(`No administrator: ${id}`);

    return administrator;
  }

  /** Delete given administrator from database; returns undefined.
   *
   * Throws NotFoundError if administrator not found.
   **/
  static async remove(id) {
    const result = await db.query(
      `DELETE
       FROM administrators
       WHERE id = $1
       RETURNING id`,
      [id]
    );
    const administrator = result.rows[0];

    if (!administrator) throw new NotFoundError(`No administrator: ${id}`);
  }
}

module.exports = Administrator;
