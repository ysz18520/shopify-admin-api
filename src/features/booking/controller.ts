import type { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import * as bookingService from './service';

export async function getConfig(_req: Request, res: Response) {
  try {
    const config = bookingService.getBookingConfig();
    res.json(config);
  } catch (error) {
    console.error('Get booking config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getSlots(req: Request, res: Response) {
  try {
    const { date, duration, timezone } = req.query;

    if (!date || !duration || !timezone) {
      res.status(400).json({ error: 'date, duration, timezone are required' });
      return;
    }

    const dur = parseInt(duration as string, 10);
    if (![30, 60].includes(dur)) {
      res.status(400).json({ error: 'duration must be 30 or 60' });
      return;
    }

    const result = await bookingService.getAvailableSlots(
      date as string,
      dur,
      timezone as string
    );
    res.json(result);
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function cancelBooking(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.update({
      where: { id: id as string },
      data: { status: 'cancelled' },
    });
    res.json(booking);
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createBooking(req: Request, res: Response) {
  try {
    const {
      date,
      startTime,
      duration,
      userTimezone,
      lastName,
      firstName,
      email,
      company,
      phone,
      meetingType,
    } = req.body;

    if (!date || !startTime || !duration || !userTimezone || !lastName || !company || !phone || !meetingType) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (![30, 60].includes(duration)) {
      res.status(400).json({ error: 'duration must be 30 or 60' });
      return;
    }

    const booking = await bookingService.createBooking({
      date,
      startTime,
      duration,
      userTimezone,
      lastName,
      firstName,
      email,
      company,
      phone,
      meetingType,
    });

    res.status(201).json(booking);
  } catch (error: any) {
    console.error('Create booking error:', error);
    if (error.message === 'This time slot is already booked') {
      res.status(409).json({ error: error.message });
      return;
    }
    if (error.message === 'Cannot book a time slot in the past') {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}
