const express = require('express');
const db = require('../database/connection');
const { validateRequest } = require('../middleware/validation');
const Joi = require('joi');

const router = express.Router();

const checkInSchema = Joi.object({
  reservation_id: Joi.number().required(),
  notes: Joi.string().optional()
});

const checkOutSchema = Joi.object({
  reservation_id: Joi.number().required(),
  notes: Joi.string().optional()
});

// Check-in
router.post('/in', validateRequest(checkInSchema), async (req, res) => {
  try {
    const { reservation_id, notes } = req.validatedData;

    // Verify reservation exists
    const reservationResult = await db.query('SELECT * FROM reservations WHERE id = $1', [reservation_id]);
    if (reservationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const result = await db.query(
      'INSERT INTO check_in_records (reservation_id, check_in_time, notes) VALUES ($1, NOW(), $2) RETURNING *',
      [reservation_id, notes]
    );

    // Update room status
    await db.query('UPDATE rooms SET status = $1 WHERE id = (SELECT room_id FROM reservations WHERE id = $2)',
      ['occupied', reservation_id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check-out
router.post('/out', validateRequest(checkOutSchema), async (req, res) => {
  try {
    const { reservation_id, notes } = req.validatedData;

    const result = await db.query(
      'UPDATE check_in_records SET check_out_time = NOW(), notes = $1 WHERE reservation_id = $2 RETURNING *',
      [notes, reservation_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Check-in record not found' });
    }

    // Update room status
    await db.query('UPDATE rooms SET status = $1 WHERE id = (SELECT room_id FROM reservations WHERE id = $2)',
      ['available', reservation_id]);

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
