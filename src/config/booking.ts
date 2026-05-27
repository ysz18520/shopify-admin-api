export const COOLLAA_BOOKING = {
  site: 'coollaa',
  businessTimezone: 'Asia/Shanghai',
  businessTimezoneName: 'UTC +08:00 China, Hong Kong, Singapore',
  durationOptions: [30, 60],
  intervalMinutes: 15,
  meetingOptions: ['WhatsApp Call', 'In-Person Appointment'],
  // Default weekday config: Mon-Fri, 9:00-18:00
  defaultAvailability: [
    { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 4, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 5, startTime: '09:00', endTime: '18:00' },
  ],
  // Default lunch break: daily 12:00-14:00
  defaultBreaks: [
    { startTime: '12:00', endTime: '14:00' },
  ],
  // 2026 China public holidays (no bookings)
  holidays2026: [
    '2026-01-01',
    '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20',
    '2026-02-21', '2026-02-22', '2026-02-23',
    '2026-04-04', '2026-04-05', '2026-04-06',
    '2026-05-01', '2026-05-02', '2026-05-03', '2026-05-04', '2026-05-05',
    '2026-06-19', '2026-06-20', '2026-06-21',
    '2026-09-25', '2026-09-26', '2026-09-27',
    '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04',
    '2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08',
  ],
} as const;

// 多店铺配置映射
const SITE_CONFIGS: Record<string, typeof COOLLAA_BOOKING> = {
  coollaa: COOLLAA_BOOKING,
  // longshade: { ... }, // 新店铺在此添加
};

export function getSiteConfig(site: string): typeof COOLLAA_BOOKING {
  return SITE_CONFIGS[site] || COOLLAA_BOOKING;
}

export function getAllSites(): string[] {
  return Object.keys(SITE_CONFIGS);
}

export const TIMEZONE_LABELS: Record<string, string> = {
  'Pacific/Tongatapu': 'UTC +13:00 - Tonga',
  'Pacific/Apia': 'UTC +13:00 - Samoa',
  'Pacific/Auckland': 'UTC +12:00 - Auckland, New Zealand',
  'Pacific/Fiji': 'UTC +12:00 - Fiji',
  'Pacific/Chatham': 'UTC +12:45 - Chatham Islands',
  'Pacific/Guadalcanal': 'UTC +11:00 - Solomon Islands',
  'Pacific/Noumea': 'UTC +11:00 - New Caledonia',
  'Pacific/Norfolk': 'UTC +11:00 - Norfolk Island',
  'Australia/Sydney': 'UTC +10:00 - Sydney, Australia',
  'Australia/Adelaide': 'UTC +09:30 - Adelaide, Australia',
  'Asia/Tokyo': 'UTC +09:00 - Tokyo, Japan',
  'Asia/Seoul': 'UTC +09:00 - Seoul, South Korea',
  'Australia/Perth': 'UTC +08:00 - Perth, Australia',
  'Asia/Shanghai': 'UTC +08:00 - China, Hong Kong, Singapore',
  'Asia/Hong_Kong': 'UTC +08:00 - China, Hong Kong, Singapore',
  'Asia/Singapore': 'UTC +08:00 - China, Hong Kong, Singapore',
  'Asia/Taipei': 'UTC +08:00 - Taipei, Taiwan',
  'Asia/Bangkok': 'UTC +07:00 - Bangkok, Thailand',
  'Asia/Yangon': 'UTC +06:30 - Yangon, Myanmar',
  'Asia/Dhaka': 'UTC +06:00 - Dhaka, Bangladesh',
  'Asia/Kathmandu': 'UTC +05:45 - Kathmandu, Nepal',
  'Asia/Kolkata': 'UTC +05:30 - Mumbai, India',
  'Asia/Karachi': 'UTC +05:00 - Karachi, Pakistan',
  'Asia/Kabul': 'UTC +04:30 - Kabul, Afghanistan',
  'Asia/Dubai': 'UTC +04:00 - Dubai, UAE',
  'Asia/Tbilisi': 'UTC +04:00 - Tbilisi, Georgia',
  'Asia/Tehran': 'UTC +03:30 - Tehran, Iran',
  'Asia/Baghdad': 'UTC +03:00 - Baghdad, Iraq',
  'Asia/Riyadh': 'UTC +03:00 - Riyadh, Saudi Arabia',
  'Europe/Istanbul': 'UTC +03:00 - Istanbul, Turkey',
  'Africa/Nairobi': 'UTC +03:00 - Nairobi, Kenya',
  'Asia/Jerusalem': 'UTC +02:00 - Jerusalem, Israel',
  'Africa/Cairo': 'UTC +02:00 - Cairo, Egypt',
  'Africa/Khartoum': 'UTC +02:00 - Khartoum, Sudan',
  'Europe/Athens': 'UTC +02:00 - Athens, Greece',
  'Africa/Lagos': 'UTC +01:00 - Lagos, Nigeria',
  'Europe/Berlin': 'UTC +01:00 - Berlin, Germany',
  'Europe/Zurich': 'UTC +01:00 - Zurich, Switzerland',
  'Europe/Stockholm': 'UTC +01:00 - Stockholm, Sweden',
  'Europe/Warsaw': 'UTC +01:00 - Warsaw, Poland',
  'Africa/Accra': 'UTC +00:00 - Accra, Ghana',
  'Europe/London': 'UTC +00:00 - London, UK',
  'Atlantic/Azores': 'UTC -01:00 - Azores, Portugal',
  "America/St_Johns": "UTC -02:30 - St. John's, Canada",
  'America/Halifax': 'UTC -03:00 - Halifax, Canada',
  'America/Sao_Paulo': 'UTC -03:00 - Sao Paulo, Brazil',
  'America/Asuncion': 'UTC -03:00 - Asuncion, Paraguay',
  'America/New_York': 'UTC -04:00 - New York, USA',
  'America/Caracas': 'UTC -04:00 - Caracas, Venezuela',
  'America/Guyana': 'UTC -04:00 - Georgetown, Guyana',
  'America/Chicago': 'UTC -05:00 - Chicago, USA',
  'America/Lima': 'UTC -05:00 - Lima, Peru',
  'America/Denver': 'UTC -06:00 - Denver, USA',
  'America/Edmonton': 'UTC -06:00 - Edmonton, Canada',
  'America/Los_Angeles': 'UTC -07:00 - Los Angeles, USA',
  'America/Phoenix': 'UTC -07:00 - Phoenix, USA',
  'America/Anchorage': 'UTC -08:00 - Anchorage, USA',
  'Pacific/Honolulu': 'UTC -10:00 - Honolulu, USA',
  'Pacific/Midway': 'UTC -11:00 - Midway Atoll',
  'Pacific/Pago_Pago': 'UTC -11:00 - Pago Pago, American Samoa',
};
