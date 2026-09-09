const express = require('express');
const db = require('../database/connection');
const { validateRequest } = require('../middleware/validation');
const Joi = require('joi');

const router = express.Router();

const guestSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  country: Joi.string().optional(),
  date_of_birth: Joi.date().optional(),
  id_type: Joi.string().optional(),
  id_number: Joi.string().optional()
});

// Create guest
router.post('/', validateRequest(guestSchema), async (req, res) => {
  try {
    const { first_name, last_name, email, phone, country, date_of_birth, id_type, id_number } = req.validatedData;

    const result = await db.query(
      'INSERT INTO guests (first_name, last_name, email, phone, country, date_of_birth, id_type, id_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [first_name, last_name, email, phone, country, date_of_birth, id_type, id_number]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all guests
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const result = await db.query(
      'SELECT * FROM guests ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const countResult = await db.query('SELECT COUNT(*) FROM guests');

    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get guest by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM guests WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Guest not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update guest
router.put('/:id', validateRequest(guestSchema), async (req, res) => {
  try {
    const { first_name, last_name, email, phone, country, date_of_birth, id_type, id_number } = req.validatedData;

    const result = await db.query(
      'UPDATE guests SET first_name = $1, last_name = $2, email = $3, phone = $4, country = $5, date_of_birth = $6, id_type = $7, id_number = $8, updated_at = NOW() WHERE id = $9 RETURNING *',
      [first_name, last_name, email, phone, country, date_of_birth, id_type, id_number, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete guest
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM guests WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Guest not found' });
    }
    res.json({ message: 'Guest deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
