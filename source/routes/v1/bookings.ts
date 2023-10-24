import express from 'express';
import controller from '../../controllers/bookings';


const router = express.Router();

router.get('/', controller.healthCheck);
router.post('/booking', controller.createBooking);

export = router;
