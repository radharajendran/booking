import { z } from "zod";

export const createBooking = z.object({
    body: z.object({
        guestName: z.string({
            required_error: "Guest name is required",
        }),
        unitID: z.string({
            required_error: "UnitId is required",
        }),
        numberOfNights: z.number({
            required_error: 'Number Of nights is required'
        }).min(1),
        checkInDate: z.coerce.date({
            required_error: 'Check-in date is required'
        }).min(new Date((new Date().toISOString().split('T')[0])))
    }),
});

export const extendStay = z.object({
    body: z.object({
        id: z.number({
            required_error: 'Booking id is required'
        }),
        additionalNights: z.number({
            required_error: 'Number Of additional nights is required'
        }).min(1)
    }),
});