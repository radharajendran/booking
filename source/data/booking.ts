import prisma from '../prisma'

interface Booking {
    guestName: string;
    unitID: string;
    checkInDate: Date;
    numberOfNights: number;
}

const addDays = (date: Date, days: number): String => {
    date.setDate(date.getDate() + days);
    return new Date(date).toISOString().split('T')[0];
}

export const update = async (id: number, numberOfNights: number, additionalStay: number) => {
    return await prisma.booking.update({
        where: {
            id: id
        },
        data: {
            numberOfNights: numberOfNights + additionalStay,
        }
    });
}

export const findBookingById = async (id: number) => {
    return await prisma.booking.findUnique({
        where: {
            id: id,
        },
    });
}

export const findBookingByUnitId = async ({ guestName, unitID }: Booking) => {
    return await prisma.booking.findMany({
        where: {
            AND: {
                guestName: {
                    equals: guestName,
                },
                unitID: {
                    equals: unitID,
                },
            },
        },
    });
}

export const findBookingByBookingDate = async ({ guestName, checkInDate }: Booking) => {
    return await prisma.booking.findMany({
        where: {
            guestName: {
                equals: guestName,
            },
            checkInDate: {
                equals: new Date(checkInDate),
            },
        },
    });
}

export const createUnitBooking = async (booking: Booking) => {
    return await prisma.booking.create({
        data: {
            guestName: booking.guestName,
            unitID: booking.unitID,
            checkInDate: new Date(booking.checkInDate),
            numberOfNights: booking.numberOfNights
        }
    })
}

export const findOverlapBooking = async (booking: Booking) => {
    const {
        unitID,
        checkInDate,
        numberOfNights
    } = booking

    const checkOutDate = addDays(new Date(checkInDate), numberOfNights)
    const sql = `
        SELECT 
            id,
            unitId,
            guestName,
            datetime(checkInDate / 1000, 'unixepoch') AS 'checkInDateParsed', 
            datetime(checkInDate / 1000, 'unixepoch', '+' || numberOfNights || ' days') AS 'checkOutDate'
        FROM Booking
        WHERE unitID = ${unitID}
        AND '${checkOutDate}' > checkInDate
        AND ('${checkInDate}'  BETWEEN checkInDate AND datetime(checkInDate / 1000, 'unixepoch', '+' || numberOfNights || ' days')
        OR '${checkOutDate}'  BETWEEN checkInDate AND datetime(checkInDate / 1000, 'unixepoch', '+' || numberOfNights || ' days') )
    `;

    const overlapBookings: Booking[] = await prisma.$queryRawUnsafe(sql);

    return overlapBookings
}