"use strict";

/** Routes for administrators. */

const express = require("express");
const { BadRequestError } = require("../expressError");
const Administrator = require("../models/administrators");

const router = express.Router();

/** POST / { administrator } => { administrator }
 *
 * administrator should be { name, email, title }
 *
 * Returns { id, name, email, title, dateCreated }
 *
 * No authorization required.
 */
router.post("/", async function (req, res, next) {
  try {
      const administrator = await Administrator.create(req.body);
      return res.status(201).json({ administrator });
  } catch (err) {
      return next(err);
  }
});

/** GET / =>
 *   { administrators: [ { id, name, email, title, dateCreated }, ...] }
 *
 * Can provide search filter in query:
 * - minTime (in system/working at hospital)
 * - title (will find case-insensitive, partial matches)
 *
 * No authorization required.
 */
router.get("/", async function (req, res, next) {
    try {
      const administrators = await Administrator.findAll(req.query);
      return res.json({ administrators });
    } catch (err) {
      return next(err);
    }
});

/** GET /[id] => { administrator }
 *
 * Returns { id, name, email, title, dateCreated }
 *
 * No authorization required.
 */
router.get("/:id", async function (req, res, next) {
    try {
      const administrator = await Administrator.get(req.params.id);
      return res.json({ administrator });
    } catch (err) {
      return next(err);
    }
});

/** PATCH /[id] { administrator } => { administrator }
 *
 * Data can include: { name, email, title }
 *
 * Returns { id, name, email, title, dateCreated }
 *
 * No authorization required.
 */
router.patch("/:id", async function (req, res, next) {
    try {
      const administrator = await Administrator.update(req.params.id, req.body);
      return res.json({ administrator });
    } catch (err) {
      return next(err);
    }
});

/** DELETE /[id] => { deleted: id }
 *
 * No authorization required.
 */
router.delete("/:id", async function (req, res, next) {
    try {
      await Administrator.remove(req.params.id);
      return res.json({ deleted: req.params.id });
    } catch (err) {
      return next(err);
    }
});

module.exports = router;
