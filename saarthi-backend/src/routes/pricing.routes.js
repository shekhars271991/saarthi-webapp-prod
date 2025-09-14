const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricing.controller');

/**
 * @route   POST /api/pricing/calculate
 * @desc    Calculate pricing for a ride
 * @access  Public
 * @body    {
 *   ride_type: 'airport-transfer' | 'hourly' | 'outstation',
 *   pickup_location?: string,
 *   drop_location?: string,
 *   pickup_lat?: number,
 *   pickup_lng?: number,
 *   drop_lat?: number,
 *   drop_lng?: number,
 *   selected_airport?: string, // Required for airport-transfer
 *   hours?: number // Required for hourly
 * }
 */
router.post('/calculate', pricingController.calculatePricing);

/**
 * @route   GET /api/pricing/config
 * @desc    Get pricing configuration
 * @access  Public
 */
router.get('/config', pricingController.getPricingConfig);

module.exports = router;
