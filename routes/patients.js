"use strict";

const jsonschema = require("jsonschema");
const express = require("express");
const router = new express.Router();

const Patient = require("../models/patients"); // Assuming you have a patients model similar to the administrators model
const { BadRequestError } = require("../expressError");

// Assuming patientSchema includes fields for name, phone, age, gender, etc.
const patientNewSchema = require("../schemas/patientNew.json");

/** POST /patients: { patient } => { patient }
 *
 * This creates a new patient record.
 * 
 * The patient must include { name, phone, age, gender }
 *
 * Returns the created patient record.
 *
 * Authorization required: (depends on your application's requirements)
 */
router.post("/", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, patientNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const patient = await Patient.create(req.body);
    return res.status(201).json({ patient });
  } catch (err) {
    return next(err);
  }
});

/** GET /patients: { } => { patients }
 *
 * Returns list of all patients.
 *
 * Authorization required: (depends on your application's requirements)
 */
router.get("/", async function (req, res, next) {
  try {
    const patients = await Patient.findAll();
    return res.json({ patients });
  } catch (err) {
    return next(err);
  }
});

/** GET /patients/:id: { } => { patient }
 *
 * Returns details about a specific patient by id.
 *
 * Authorization required: (depends on your application's requirements)
 */
router.get("/:id", async function (req, res, next) {
  try {
    const patient = await Patient.get(req.params.id);
    return res.json({ patient });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /patients/:id: { patient } => { patient }
 *
 * Updates a patient's record.
 * 
 * The patient can include fields { name, phone, age, gender }
 *
 * Returns the updated patient record.
 *
 * Authorization required: (depends on your application's requirements)
 */
router.patch("/:id", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, patientNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const patient = await Patient.update(req.params.id, req.body);
    return res.json({ patient });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /patients/:id: { } => { message }
 *
 * Deletes a specific patient by id.
 *
 * Returns a message on successful deletion.
 *
 * Authorization required: (depends on your application's requirements)
 */
router.delete("/:id", async function (req, res, next) {
  try {
    await Patient.remove(req.params.id);
    return res.json({ message: "Patient deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
