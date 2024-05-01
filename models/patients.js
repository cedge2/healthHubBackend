'use strict';

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');
const { sqlForPartialUpdate } = require('../helpers/sql');

/** Related functions for patients. */

class Patients {
  /** Create a patient (from data), update db, return new patient data.
   *
   * data should be { name, phone, age, gender }
   *
   * Returns { id, name, phone, age, gender, dateCreated }
   *
   * Throws BadRequestError if patient already in database.
   * */
  static async create({ name, phone, age, gender }) {
    const duplicateCheck = await db.query(
      `SELECT phone
           FROM patients
           WHERE phone = $1`,
      [phone]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate patient phone: ${phone}`);

    const result = await db.query(
      `INSERT INTO patients
           (name, phone, age, gender, date_created)
           VALUES ($1, $2, $3, $4, current_timestamp)
           RETURNING id, name, phone, age, gender, date_created AS "dateCreated"`,
      [name, phone, age, gender]
    );
    const patient = result.rows[0];

    return patient;
  }

  /** Find all patients.
   *
   * Returns [{ id, name, phone, age, gender, dateCreated }, ...]
   * */
  static async findAll() {
    const patientsRes = await db.query(
      `SELECT id,
                  name,
                  phone,
                  age,
                  gender,
                  date_created AS "dateCreated"
           FROM patients
           ORDER BY name`
    );
    return patientsRes.rows;
  }

  /** Given a patient's ID, return data about the patient.
   *
   * Returns { id, name, phone, age, gender, dateCreated }
   *
   * Throws NotFoundError if not found.
   */
  static async get(id) {
    const patientRes = await db.query(
      `SELECT id,
                  name,
                  phone,
                  age,
                  gender,
                  date_created AS "dateCreated"
           FROM patients
           WHERE id = $1`,
      [id]
    );

    const patient = patientRes.rows[0];

    if (!patient) throw new NotFoundError(`No patient: ${id}`);

    return patient;
  }

  /** Update patient data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, phone, age, gender}
   *
   * Returns { id, name, phone, age, gender, dateCreated }
   *
   * Throws NotFoundError if not found.
   */
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const idVarIdx = '$' + (values.length + 1);

    const querySql = `UPDATE patients 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                name, 
                                phone, 
                                age, 
                                gender, 
                                date_created AS "dateCreated"`;
    const result = await db.query(querySql, [...values, id]);
    const patient = result.rows[0];

    if (!patient) throw new NotFoundError(`No patient: ${id}`);

    return patient;
  }

  /** Delete given patient from database; returns undefined.
   *
   * Throws NotFoundError if patient not found.
   **/
  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM patients
           WHERE id = $1
           RETURNING id`,
      [id]
    );
    const patient = result.rows[0];

    if (!patient) throw new NotFoundError(`No patient: ${id}`);
  }
}

module.exports = Patients;
