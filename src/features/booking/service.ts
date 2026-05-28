import {
  addMinutes,
  startOfDay,
  parse,
  isWithinInterval,
  areIntervalsOverlapping,
} from 'date-fns';
import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import prisma from '../../lib/prisma';
import { getSiteConfig, type SiteBookingConfig } from '../../config/booking';

interface TimeRange {
  start: Date;
  end: Date;
}

// 获取店铺配置（从硬编码配置）
function getStoreConfig(site: string): SiteBookingConfig {
  return getSiteConfig(site);
}

function parseTimeToDate(baseDate: Date, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const d = new Date(baseDate);
  d.setUTCHours(hours, minutes, 0, 0);
  return d;
}

function generateSlots(
  workRange: TimeRange,
  breaks: TimeRange[],
  bookings: TimeRange[],
  duration: number,
  interval: number
): Date[] {
  const slots: Date[] = [];
  let current = workRange.start;

  while (addMinutes(current, duration) <= workRange.end) {
    const slotEnd = addMinutes(current, duration);
    const slotRange: TimeRange = { start: current, end: slotEnd };

    const inBreak = breaks.some((b) =>
      areIntervalsOverlapping(slotRange, b, { inclusive: true })
    );

    const isBooked = bookings.some((b) =>
      areIntervalsOverlapping(slotRange, b, { inclusive: false })
    );

    if (!inBreak && !isBooked) {
      slots.push(current);
    }

    current = addMinutes(current, interval);
  }

  return slots;
}

export async function getAvailableSlots(
  dateStr: string,
  duration: number,
  userTimezone: string,
  site: string = 'coollaa'
) {
  // 获取店铺配置
  const config = getStoreConfig(site);
  const TZ = config.businessTimezone;

  // 1. 解析商家日期为 UTC 当天的开始
  const merchantDate = parse(dateStr, 'yyyy-MM-dd', new Date());
  const dayStart = fromZonedTime(
    `${dateStr}T00:00:00`,
    TZ
  );
  const dayEnd = addMinutes(dayStart, 24 * 60);

  const dayOfWeek = merchantDate.getDay();

  // 周末不可约（周六=6，周日=0）
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return { date: dateStr, duration, slots: [] };
  }

  // 法定节假日不可约
  if ((config.holidays2026 as readonly string[]).includes(dateStr)) {
    return { date: dateStr, duration, slots: [] };
  }

  // 过去日期不可约
  const todayStr = formatInTimeZone(new Date(), TZ, 'yyyy-MM-dd');
  if (dateStr < todayStr) {
    return { date: dateStr, duration, slots: [] };
  }

  // 2. 查询可用性配置
  let availability = await prisma.availabilityConfig.findUnique({
    where: { site_dayOfWeek: { site, dayOfWeek } },
  });

  // 如果没有配置，使用默认
  if (!availability) {
    const defaultConfig = config.defaultAvailability.find(
      (a) => a.dayOfWeek === dayOfWeek
    );
    if (!defaultConfig) {
      return { date: dateStr, duration, slots: [] };
    }
    availability = {
      id: '',
      site,
      dayOfWeek,
      startTime: defaultConfig.startTime,
      endTime: defaultConfig.endTime,
      isActive: true,
    };
  }

  if (!availability.isActive) {
    return { date: dateStr, duration, slots: [] };
  }

  // 3. 构建工作时间范围（UTC）
  const workStart = fromZonedTime(
    `${dateStr}T${availability.startTime}:00`,
    TZ
  );
  const workEnd = fromZonedTime(
    `${dateStr}T${availability.endTime}:00`,
    TZ
  );

  // 4. 查询午休配置
  const breakConfigs = await prisma.breakTime.findMany({
    where: {
      site,
      isActive: true,
      OR: [{ dayOfWeek: null }, { dayOfWeek }],
    },
  });

  const breaks: TimeRange[] = [];
  for (const b of breakConfigs.length > 0 ? breakConfigs : config.defaultBreaks.map(b => ({...b, id: '', site, dayOfWeek: null as number | null, isActive: true}))) {
    breaks.push({
      start: fromZonedTime(`${dateStr}T${b.startTime}:00`, TZ),
      end: fromZonedTime(`${dateStr}T${b.endTime}:00`, TZ),
    });
  }

  // 5. 查询已有预约
  const existingBookings = await prisma.booking.findMany({
    where: {
      site,
      status: 'confirmed',
      startTime: { gte: dayStart, lt: dayEnd },
    },
    select: { startTime: true, endTime: true },
  });

  const bookingRanges: TimeRange[] = existingBookings.map((b) => ({
    start: b.startTime,
    end: b.endTime,
  }));

  // 6. 生成可用时段
  let utcSlots = generateSlots(
    { start: workStart, end: workEnd },
    breaks,
    bookingRanges,
    duration,
    config.intervalMinutes
  );

  // 如果是今天，过滤掉已经过期的时段
  if (dateStr === todayStr) {
    const now = new Date();
    utcSlots = utcSlots.filter((slot) => slot >= now);
  }

  // 7. 转换为用户时区
  const slots = utcSlots.map((utc) => ({
    utc: utc.toISOString(),
    localTime: formatInTimeZone(utc, userTimezone, 'HH:mm'),
    localDate: formatInTimeZone(utc, userTimezone, 'yyyy-MM-dd'),
  }));

  return { date: dateStr, duration, slots };
}

export async function createBooking(data: {
  date: string;
  startTime: string;
  duration: number;
  userTimezone: string;
  lastName: string;
  firstName?: string;
  email?: string;
  company: string;
  phone: string;
  meetingType: string;
  site?: string;
}) {
  const site = data.site || 'coollaa';
  const config = getStoreConfig(site);
  const TZ = config.businessTimezone;

  // 将商家时区的时间转换为 UTC
  const startTimeUTC = fromZonedTime(
    `${data.date}T${data.startTime}:00`,
    TZ
  );
  const endTimeUTC = addMinutes(startTimeUTC, data.duration);

  // Cannot book past time slots
  if (startTimeUTC < new Date()) {
    throw new Error('Cannot book a time slot in the past');
  }

  // 检查是否与已有预约冲突
  const conflicting = await prisma.booking.findFirst({
    where: {
      site,
      status: 'confirmed',
      OR: [
        {
          startTime: { lte: startTimeUTC },
          endTime: { gt: startTimeUTC },
        },
        {
          startTime: { lt: endTimeUTC },
          endTime: { gte: endTimeUTC },
        },
        {
          startTime: { gte: startTimeUTC },
          endTime: { lte: endTimeUTC },
        },
      ],
    },
  });

  if (conflicting) {
    throw new Error('This time slot is already booked');
  }

  const booking = await prisma.booking.create({
    data: {
      site,
      startTime: startTimeUTC,
      endTime: endTimeUTC,
      duration: data.duration,
      lastName: data.lastName,
      firstName: data.firstName,
      email: data.email,
      company: data.company,
      phone: data.phone,
      meetingType: data.meetingType,
      userTimezone: data.userTimezone,
    },
  });

  return booking;
}

export async function getBookingConfig(site: string = 'coollaa') {
  const config = getStoreConfig(site);
  return {
    site: config.site,
    timeZone: config.businessTimezone,
    timeZoneName: config.businessTimezoneName,
    durationOptions: config.durationOptions,
    intervalMinutes: config.intervalMinutes,
    meetingOptions: config.meetingOptions,
  };
}
