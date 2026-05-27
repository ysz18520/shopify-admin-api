import type { Response } from 'express';
import type { AuthRequest } from '../../middleware/auth';
import * as adminService from './service';

export async function login(req: AuthRequest, res: Response) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const result = await adminService.login(username, password);
    res.json(result);
  } catch (error: any) {
    console.error('Admin login error:', error);
    res.status(401).json({ error: 'Invalid credentials' });
  }
}

export async function getBookings(req: AuthRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const status = req.query.status as string | undefined;
    const site = req.query.site as string | undefined;

    const result = await adminService.getBookings(site, page, pageSize, status);
    res.json(result);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function cancelBooking(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const site = req.query.site as string | undefined;
    const booking = await adminService.cancelBooking(id as string, site);
    res.json(booking);
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    if (error.message === 'Permission denied') {
      res.status(403).json({ error: 'Permission denied' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getStats(req: AuthRequest, res: Response) {
  try {
    const site = req.query.site as string | undefined;
    const stats = await adminService.getStats(site);
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAvailability(req: AuthRequest, res: Response) {
  try {
    const site = req.query.site as string | undefined;
    if (!site) {
      res.status(400).json({ error: 'site is required' });
      return;
    }
    const configs = await adminService.getAvailability(site);
    const breaks = await adminService.getBreaks(site);
    res.json({ availability: configs, breaks });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function saveAvailability(req: AuthRequest, res: Response) {
  try {
    const site = req.query.site as string | undefined;
    if (!site) {
      res.status(400).json({ error: 'site is required' });
      return;
    }
    const { availability, breaks } = req.body;

    if (availability) {
      await adminService.saveAvailability(site, availability);
    }
    if (breaks) {
      await adminService.saveBreaks(site, breaks);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Save availability error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getHolidays(req: AuthRequest, res: Response) {
  try {
    const site = req.query.site as string | undefined;
    if (!site) {
      res.status(400).json({ error: 'site is required' });
      return;
    }
    const holidays = await adminService.getHolidays(site);
    res.json(holidays);
  } catch (error) {
    console.error('Get holidays error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function addHoliday(req: AuthRequest, res: Response) {
  try {
    const site = req.query.site as string | undefined;
    if (!site) {
      res.status(400).json({ error: 'site is required' });
      return;
    }
    const { date, reason } = req.body;
    if (!date) {
      res.status(400).json({ error: 'Date is required' });
      return;
    }

    const holiday = await adminService.addHoliday(site, date, reason);
    res.status(201).json(holiday);
  } catch (error: any) {
    console.error('Add holiday error:', error);
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Date already exists' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function removeHoliday(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const site = req.query.site as string | undefined;
    await adminService.removeHoliday(id as string, site);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Remove holiday error:', error);
    if (error.message === 'Permission denied') {
      res.status(403).json({ error: 'Permission denied' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}
