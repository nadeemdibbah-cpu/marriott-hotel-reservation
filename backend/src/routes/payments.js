const express = require('express');
const db = require('../database/connection');
const { validateRequest } = require('../middleware/validation');
const Joi = require('joi');

const router = express.Router();

const paymentSchema = Joi.object({
  reservation_id: Joi.number().required(),
  amount: Joi.number().required(),
  payment_method: Joi.string().required()
});

// Create payment
router.post('/', validateRequest(paymentSchema), async (req, res) => {
  try {
    const { reservation_id, amount, payment_method } = req.validatedData;

    // Verify reservation exists
    const reservationResult = await db.query('SELECT * FROM reservations WHERE id = $1', [reservation_id]);
    if (reservationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Generate transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const result = await db.query(
      'INSERT INTO payments (reservation_id, amount, payment_method, transaction_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [reservation_id, amount, payment_method, transactionId, 'completed']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payments by reservation
router.get('/reservation/:reservationId', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM payments WHERE reservation_id = $1 ORDER BY created_at DESC',
      [req.params.reservationId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM payments WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
