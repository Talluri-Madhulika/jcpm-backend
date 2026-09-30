const express = require('express');
const router = express.Router();

const DailyPromise = require('../models/DailyPromise');

// GET ALL
router.get('/', async (req, res) => {
  try {
    const promises = await DailyPromise
      .find()
      .sort({ date: -1 });

    res.json(promises);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error fetching daily promises'
    });
  }
});


// GET TODAY
router.get('/today', async (req, res) => {
  try {

    const now = new Date();

    const year = now.getFullYear();

    const month = String(
      now.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      now.getDate()
    ).padStart(2, '0');

    const date = `${year}-${month}-${day}`;

    const promise = await DailyPromise.findOne({
      date
    });

    if (!promise) {
      return res.status(404).json({
        message: 'No Daily Promise for today'
      });
    }

    res.json(promise);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Error fetching today promise'
    });
  }
});


// ADD
router.post('/', async (req, res) => {
  try {

    const promise = new DailyPromise({
      date: req.body.date,
      reference: req.body.reference,
      verse: req.body.verse,
      note: req.body.note || ''
    });

    const savedPromise = await promise.save();

    res.status(201).json(savedPromise);

  } catch (error) {

    console.error(error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'A Daily Promise already exists for this date.'
      });
    }

    res.status(500).json({
      message: 'Error adding Daily Promise'
    });
  }
});


// UPDATE
router.put('/:id', async (req, res) => {
  try {

    const updatedPromise =
      await DailyPromise.findByIdAndUpdate(
        req.params.id,
        {
          date: req.body.date,
          reference: req.body.reference,
          verse: req.body.verse,
          note: req.body.note || ''
        },
        {
          new: true,
          runValidators: true
        }
      );

    if (!updatedPromise) {
      return res.status(404).json({
        message: 'Daily Promise not found'
      });
    }

    res.json(updatedPromise);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Error updating Daily Promise'
    });
  }
});


// DELETE
router.delete('/:id', async (req, res) => {
  try {

    const deletedPromise =
      await DailyPromise.findByIdAndDelete(
        req.params.id
      );

    if (!deletedPromise) {
      return res.status(404).json({
        message: 'Daily Promise not found'
      });
    }

    res.json({
      message: 'Daily Promise deleted successfully'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Error deleting Daily Promise'
    });
  }
});


module.exports = router;