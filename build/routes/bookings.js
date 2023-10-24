"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const bookings_1 = __importDefault(require("../controllers/bookings"));
const router = express_1.default.Router();
router.get('/', bookings_1.default.healthCheck);
router.post('/api/v1/booking/', bookings_1.default.createBooking);
module.exports = router;
