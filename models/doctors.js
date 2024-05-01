"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for doctors. */

class Doctor {
  /** Create a doctor (from data), update db, return new doctor data.
   *
   * data should be { name, phone, email, title }
   *
   * Returns { id, name, phone, email, title, dateCreated }
   *
   * Throws BadRequestError if doctor already in database.
   * */
  static async create({ name, phone, email, title }) {
    const duplicateCheck = await db.query(
          `SELECT email
           FROM doctors
           WHERE email = $1`,
        [email]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate doctor email: ${email}`);

    const result = await db.query(
          `INSERT INTO doctors
           (name, phone, email, title, date_created)
           VALUES ($1, $2, $3, $4, current_timestamp)
           RETURNING id, name, phone, email, title, date_created AS "dateCreated"`,
        [
          name,
          phone,
          email,
          title,
        ],
    );
    const doctor = result.rows[0];

    return doctor;
  }

  /** Find all doctors.
   *
   * Returns [{ id, name, phone, email, title, dateCreated }, ...]
   * */
  static async findAll() {
    const doctorsRes = await db.query(
          `SELECT id,
                  name,
                  phone,
                  email,
                  title,
                  date_created AS "dateCreated"
           FROM doctors
           ORDER BY name`);
    return doctorsRes.rows;
  }

  /** Given a doctor's ID, return data about the doctor.
   *
   * Returns { id, name, phone, email, title, dateCreated }
   *
   * Throws NotFoundError if not found.
   */
  static async get(id) {
    const doctorRes = await db.query(
          `SELECT id,
                  name,
                  phone,
                  email,
                  title,
                  date_created AS "dateCreated"
           FROM doctors
           WHERE id = $1`,
        [id]);

    const doctor = doctorRes.rows[0];

    if (!doctor) throw new NotFoundError(`No doctor: ${id}`);

    return doctor;
  }

  /** Update doctor data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, phone, email, title}
   *
   * Returns { id, name, phone, email, title, dateCreated }
   *
   * Throws NotFoundError if not found.
   */
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE doctors 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                name, 
                                phone, 
                                email, 
                                title, 
                                date_created AS "dateCreated"`;
    const result = await db.query(querySql, [...values, id]);
    const doctor = result.rows[0];

    if (!doctor) throw new NotFoundError(`No doctor: ${id}`);

    return doctor;
  }

  /** Delete given doctor from database; returns undefined.
   *
   * Throws NotFoundError if doctor not found.
   **/
  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM doctors
           WHERE id = $1
           RETURNING id`,
        [id]);
    const doctor = result.rows[0];

    if (!doctor) throw new NotFoundError(`No doctor: ${id}`);
  }
}


module.exports = Doctor;
