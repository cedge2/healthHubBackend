"use strict";

/** Routes for doctors. */

const express = require("express");
const { ensureCorrectUserOrAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Doctor = require("../models/doctors");

const router = express.Router();


router.post("/", async function (req, res, next) {
  try {
      // Log the request body to the console
      console.log("Received request body:", req.body);

      const doctor = await Doctor.create(req.body); // Attempts to create a new doctor
      return res.status(201).json({ doctor });
  } catch (err) {
      console.error("Error when trying to create a doctor:", err);
      return next(err);
  }
});


/** POST / { doctor } => { doctor }
 *
 * doctor should be { name, phone, email, title }
 *
 * Returns { id, name, phone, email, title, dateCreated }
 *
 * Authorization removed: was previously required to be admin
 */
router.post("/", async function (req, res, next) {
  try {
      const doctor = await Doctor.create(req.body); // Assumes validation is handled in the Doctor.create method
      return res.status(201).json({ doctor });
  } catch (err) {
      return next(err);
  }
});


/** GET / =>
 *   { doctors: [ { id, name, phone, email, title, dateCreated }, ...] }
 *
 * Can provide search filter in query:
 * - minTime (in system/working at hospital)
 * - title (will find case-insensitive, partial matches - such as MD / DO)
 *
 * Authorization required: none
 */
router.get("/", async function (req, res, next) {
    try {
      // This assumes that Doctor.findAll can handle filtering if query parameters are provided.
      const doctors = await Doctor.findAll(req.query);
      return res.json({ doctors });
    } catch (err) {
      return next(err);
    }
});

/** GET /[doctorId] => { doctor }
 *
 * Returns { id, name, phone, email, title, dateCreated }
 *
 * Authorization required: none
 */
router.get("/:id", async function (req, res, next) {
    try {
      const doctor = await Doctor.get(req.params.id);
      return res.json({ doctor });
    } catch (err) {
      return next(err);
    }
});

/** PATCH /[doctorId] { doctor } => { doctor }
 *
 * Data can include: { name, phone, email, title }
 *
 * Returns { id, name, phone, email, title, dateCreated }
 *
 * Authorization required: admin or same-user-as-:username
 */
router.patch("/:doctorId", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
      const doctor = await Doctor.update(req.params.doctorId, req.body); // Assumes validation is handled in the Doctor.update method
      return res.json({ doctor });
    } catch (err) {
      return next(err);
    }
});

/** DELETE /[doctorId] => { deleted: doctorId }
 *
 * Authorization required: admin or same-user-as-:doctorId
 */
router.delete("/:doctorId", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
      await Doctor.remove(req.params.doctorId);
      return res.json({ deleted: req.params.doctorId });
    } catch (err) {
      return next(err);
    }
});

module.exports = router;
