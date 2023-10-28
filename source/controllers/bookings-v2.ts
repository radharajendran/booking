import { Request, Response, NextFunction } from 'express';
import {
    createUnitBooking,
    findOverlapBooking,
    findBookingByUnitId,
    findBookingByBookingDate,
    findBookingById,
    update
} from '../data/booking'
import { sendApiError, sendApiResponse } from '../utils/http'

interface Booking {
    guestName: string;
    unitID: string;
    checkInDate: Date;
    numberOfNights: number;
}

interface ExtendBooking {
    numberOfNights: number
}

const createBooking = async (req: Request, res: Response, next: NextFunction) => {
    const booking: Booking = req.body;

    let outcome = await isBookingPossible(booking);
    if (!outcome.result) {
        return sendApiError(res, 400, outcome.reason);
    }

    let bookingResult = await createUnitBooking(booking);
    return sendApiResponse(res, bookingResult);
}

type bookingOutcome = { result: boolean, reason: string };

const isBookingPossible = async (booking: Booking): Promise<bookingOutcome> => {
    // check 0: find any guest booked the requested date for a specific unit 
    // check 1 : The Same guest cannot book the same unit multiple times
    let sameGuestSameUnit = await findBookingByUnitId(booking);
    if (sameGuestSameUnit.length > 0) {
        return { result: false, reason: "The given guest name cannot book the same unit multiple times" };
    }

    // check 2 : the same guest cannot be in multiple units at the same time, 
    // validate date if the guest have booking in requested date 
    let sameGuestAlreadyBooked = await findBookingByBookingDate(booking);
    if (sameGuestAlreadyBooked.length > 0) {
        return { result: false, reason: "The same guest cannot be in multiple units at the same time" };
    }

    // check 3 : Unit is available for the check-in date
    let isOverlapBookings = await findOverlapBooking(booking);
    if (isOverlapBookings.length) {
        return { result: false, reason: "For the given check-in date, the unit is already occupied" };
    }

    return { result: true, reason: "OK" };
}

const extendBooking = async (req: Request, res: Response, next: NextFunction) => {
    const extendBooking: ExtendBooking = req.body;
    const bookingId = Number(req.params.id);

    //check 1: validate booking availability by booking id
    const booking = await findBookingById(bookingId);
    if (!booking) {
        return sendApiError(res, 404, { result: false, reason: "Booking not available" })
    }

    // check 2 : Unit is available for the Extended Stay
    booking.numberOfNights = extendBooking.numberOfNights + booking.numberOfNights;
    let isOverlapBookings = await findOverlapBooking(booking);
    isOverlapBookings = isOverlapBookings.filter((b: any) => b.id != bookingId);

    if (isOverlapBookings.length) {
        return sendApiError(res, 400, { result: false, reason: "For the given extend stay, the unit is already occupied" })
    }

    let updateBookingResult = await update(booking.id, booking.numberOfNights, extendBooking.numberOfNights);

    return sendApiResponse(res, updateBookingResult)
}

export default { createBooking, extendBooking }
