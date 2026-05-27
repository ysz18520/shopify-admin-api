import prisma from '../../lib/prisma';
import { generateToken } from '../../middleware/auth';
import { getSiteConfig } from '../../config/booking';

// 支持的店铺列表（账号密码即为店铺名）
const SITES = ['coollaa', 'longshade'];

export async function login(username: string, password: string) {
  // 超管登录
  if (username === 'admin') {
    if (password !== 'admin') {
      throw new Error('Invalid credentials');
    }
    const token = generateToken('admin', 'super', 'all');
    return { token, username: 'admin', role: 'super', site: 'all' };
  }

  // 店铺账号登录：账号密码均为店铺名
  if (SITES.includes(username) && password === username) {
    const token = generateToken(username, 'site', username);
    return { token, username, role: 'site', site: username };
  }

  throw new Error('Invalid credentials');
}

export async function getBookings(
  siteFilter: string | undefined,
  page: number,
  pageSize: number,
  status?: string
) {
  const where: any = {};
  if (siteFilter) where.site = siteFilter;
  if (status) where.status = status;

  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { startTime: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.booking.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function cancelBooking(id: string, siteFilter?: string) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw new Error('Booking not found');
  if (siteFilter && booking.site !== siteFilter) {
    throw new Error('Permission denied');
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: 'cancelled' },
  });
  return updated;
}

export async function getStats(siteFilter: string | undefined) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const where: any = {};
  if (siteFilter) where.site = siteFilter;

  const [todayCount, weekCount, monthCount, pendingCount, totalCount] = await Promise.all([
    prisma.booking.count({
      where: { ...where, startTime: { gte: todayStart, lt: todayEnd } },
    }),
    prisma.booking.count({
      where: { ...where, startTime: { gte: weekStart, lt: todayEnd } },
    }),
    prisma.booking.count({
      where: { ...where, startTime: { gte: monthStart, lt: todayEnd } },
    }),
    prisma.booking.count({
      where: { ...where, status: 'confirmed', startTime: { gte: now } },
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    today: todayCount,
    week: weekCount,
    month: monthCount,
    pending: pendingCount,
    total: totalCount,
  };
}

export async function getAvailability(site: string) {
  const configs = await prisma.availabilityConfig.findMany({
    where: { site },
  });

  const config = getSiteConfig(site);

  if (configs.length === 0) {
    return config.defaultAvailability.map((a) => ({
      dayOfWeek: a.dayOfWeek,
      startTime: a.startTime,
      endTime: a.endTime,
      isActive: true,
    }));
  }

  return configs.map((c) => ({
    dayOfWeek: c.dayOfWeek,
    startTime: c.startTime,
    endTime: c.endTime,
    isActive: c.isActive,
  }));
}

export async function saveAvailability(
  site: string,
  configs: Array<{ dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }>
) {
  await Promise.all(
    configs.map((config) =>
      prisma.availabilityConfig.upsert({
        where: { site_dayOfWeek: { site, dayOfWeek: config.dayOfWeek } },
        update: {
          startTime: config.startTime,
          endTime: config.endTime,
          isActive: config.isActive,
        },
        create: {
          site,
          dayOfWeek: config.dayOfWeek,
          startTime: config.startTime,
          endTime: config.endTime,
          isActive: config.isActive,
        },
      })
    )
  );
}

export async function getBreaks(site: string) {
  const breaks = await prisma.breakTime.findMany({
    where: { site, isActive: true },
  });

  const config = getSiteConfig(site);

  if (breaks.length === 0) {
    return config.defaultBreaks.map((b) => ({
      startTime: b.startTime,
      endTime: b.endTime,
    }));
  }

  return breaks.map((b) => ({
    startTime: b.startTime,
    endTime: b.endTime,
  }));
}

export async function saveBreaks(
  site: string,
  breaks: Array<{ startTime: string; endTime: string }>
) {
  await prisma.breakTime.deleteMany({ where: { site } });
  await prisma.breakTime.createMany({
    data: breaks.map((b) => ({
      site,
      dayOfWeek: null as number | null,
      startTime: b.startTime,
      endTime: b.endTime,
      isActive: true,
    })),
  });
}

export async function getHolidays(site: string) {
  return prisma.holiday.findMany({
    where: { site },
    orderBy: { date: 'asc' },
  });
}

export async function addHoliday(site: string, date: string, reason?: string) {
  return prisma.holiday.create({
    data: { site, date, reason },
  });
}

export async function removeHoliday(id: string, siteFilter?: string) {
  if (siteFilter) {
    const holiday = await prisma.holiday.findUnique({ where: { id } });
    if (!holiday) throw new Error('Holiday not found');
    if (holiday.site !== siteFilter) throw new Error('Permission denied');
  }
  await prisma.holiday.delete({ where: { id } });
}
