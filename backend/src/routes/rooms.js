const express = require('express');
const db = require('../database/connection');
const { validateRequest } = require('../middleware/validation');
const Joi = require('joi');

const router = express.Router();

const roomSchema = Joi.object({
  room_number: Joi.string().required(),
  room_type: Joi.string().required(),
  capacity: Joi.number().required(),
  price_per_night: Joi.number().required(),
  amenities: Joi.array().items(Joi.string()).optional(),
  floor: Joi.number().optional()
});

// Create room
router.post('/', validateRequest(roomSchema), async (req, res) => {
  try {
    const { room_number, room_type, capacity, price_per_night, amenities, floor } = req.validatedData;

    const result = await db.query(
      'INSERT INTO rooms (room_number, room_type, capacity, price_per_night, amenities, floor) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [room_number, room_type, capacity, price_per_night, amenities || [], floor]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available rooms
router.get('/available/:checkIn/:checkOut', async (req, res) => {
  try {
    const { checkIn, checkOut } = req.params;
    const capacity = parseInt(req.query.capacity) || 1;

    const result = await db.query(
      `SELECT r.* FROM rooms r
       WHERE r.capacity >= $1
       AND r.status = 'available'
       AND r.id NOT IN (
         SELECT room_id FROM reservations
         WHERE (check_in_date, check_out_date) OVERLAPS ($2::DATE, $3::DATE)
       )
       ORDER BY r.price_per_night ASC`,
      [capacity, checkIn, checkOut]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM rooms ORDER BY room_number ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get room by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM rooms WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update room
router.put('/:id', validateRequest(roomSchema), async (req, res) => {
  try {
    const { room_number, room_type, capacity, price_per_night, amenities, floor } = req.validatedData;

    const result = await db.query(
      'UPDATE rooms SET room_number = $1, room_type = $2, capacity = $3, price_per_night = $4, amenities = $5, floor = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
      [room_number, room_type, capacity, price_per_night, amenities || [], floor, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
