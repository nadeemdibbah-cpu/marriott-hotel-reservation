const express = require('express');
const db = require('../database/connection');
const { validateRequest } = require('../middleware/validation');
const Joi = require('joi');
const mailer = require('../utils/mailer');

const router = express.Router();

const reservationSchema = Joi.object({
  guest_id: Joi.number().required(),
  room_id: Joi.number().required(),
  check_in_date: Joi.date().required(),
  check_out_date: Joi.date().required(),
  total_guests: Joi.number().required(),
  special_requests: Joi.string().optional()
});

// Create reservation
router.post('/', validateRequest(reservationSchema), async (req, res) => {
  try {
    const { guest_id, room_id, check_in_date, check_out_date, total_guests, special_requests } = req.validatedData;

    // Get room details
    const roomResult = await db.query('SELECT * FROM rooms WHERE id = $1', [room_id]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = roomResult.rows[0];
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const numberOfNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalPrice = numberOfNights * room.price_per_night;

    const result = await db.query(
      'INSERT INTO reservations (guest_id, room_id, check_in_date, check_out_date, total_guests, number_of_nights, total_price, special_requests) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [guest_id, room_id, check_in_date, check_out_date, total_guests, numberOfNights, totalPrice, special_requests]
    );

    const reservation = result.rows[0];

    // Get guest details for email
    const guestResult = await db.query('SELECT * FROM guests WHERE id = $1', [guest_id]);
    const guest = guestResult.rows[0];

    // Send confirmation email
    if (guest && guest.email) {
      await mailer.sendReservationConfirmation(guest, reservation, room);
    }

    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get reservations by guest
router.get('/guest/:guestId', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM reservations WHERE guest_id = $1 ORDER BY created_at DESC',
      [req.params.guestId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all reservations
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM reservations ORDER BY check_in_date DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get reservation by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM reservations WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update reservation
router.put('/:id', validateRequest(reservationSchema), async (req, res) => {
  try {
    const { guest_id, room_id, check_in_date, check_out_date, total_guests, special_requests } = req.validatedData;

    const result = await db.query(
      'UPDATE reservations SET guest_id = $1, room_id = $2, check_in_date = $3, check_out_date = $4, total_guests = $5, special_requests = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
      [guest_id, room_id, check_in_date, check_out_date, total_guests, special_requests, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel reservation
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE reservations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['cancelled', req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.json({ message: 'Reservation cancelled successfully', reservation: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
