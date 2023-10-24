import express from 'express';
import controller from '../../controllers/bookings-v2';
import { validate } from '../schemas/validate'
import { createBooking, extendStay } from '../schemas/request';

const router = express.Router();

router.get('/', (req, res) => {
    return res.status(200).json({
        message: "OK"
    })
});

router.post('/booking', validate(createBooking), controller.createBooking);
router.patch('/booking/extend/:id', validate(extendStay), controller.extendBooking)
export = router;
