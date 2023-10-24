"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../prisma"));
const healthCheck = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json({
        message: "OK"
    });
});
const createBooking = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = req.body;
    let outcome = yield isBookingPossible(booking);
    if (!outcome.result) {
        return res.status(400).json(outcome.reason);
    }
    let bookingResult = yield prisma_1.default.booking.create({
        data: {
            guestName: booking.guestName,
            unitID: booking.unitID,
            checkInDate: new Date(booking.checkInDate),
            numberOfNights: booking.numberOfNights
        }
    });
    return res.status(200).json(bookingResult);
});
function isBookingPossible(booking) {
    return __awaiter(this, void 0, void 0, function* () {
        // check 1 : The Same guest cannot book the same unit multiple times
        let sameGuestSameUnit = yield prisma_1.default.booking.findMany({
            where: {
                AND: {
                    guestName: {
                        equals: booking.guestName,
                    },
                    unitID: {
                        equals: booking.unitID,
                    },
                },
            },
        });
        if (sameGuestSameUnit.length > 0) {
            return { result: false, reason: "The given guest name cannot book the same unit multiple times" };
        }
        // check 2 : the same guest cannot be in multiple units at the same time
        let sameGuestAlreadyBooked = yield prisma_1.default.booking.findMany({
            where: {
                guestName: {
                    equals: booking.guestName,
                },
            },
        });
        if (sameGuestAlreadyBooked.length > 0) {
            return { result: false, reason: "The same guest cannot be in multiple units at the same time" };
        }
        // check 3 : Unit is available for the check-in date
        let isUnitAvailableOnCheckInDate = yield prisma_1.default.booking.findMany({
            where: {
                AND: {
                    checkInDate: {
                        equals: new Date(booking.checkInDate),
                    },
                    unitID: {
                        equals: booking.unitID,
                    }
                }
            }
        });
        if (isUnitAvailableOnCheckInDate.length > 0) {
            return { result: false, reason: "For the given check-in date, the unit is already occupied" };
        }
        return { result: true, reason: "OK" };
    });
}
exports.default = { healthCheck, createBooking };
