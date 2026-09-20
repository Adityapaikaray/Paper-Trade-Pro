import { MarketRegion } from '../types.ts';

export interface RegionalMarketStatus {
  status: 'Market Open' | 'Pre-Market' | 'After Hours' | 'Post-Market' | 'Market Closed';
  isOpen: boolean;
  timeString: string;
  timezoneLabel: string;
  sessionNote: string;
  nextEvent: string;
}

export const getRegionalMarketStatus = (
  region: MarketRegion = 'US',
  date: Date = new Date()
): RegionalMarketStatus => {
  if (region === 'US') {
    // Convert to US Eastern Time (ET)
    const etFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
      weekday: 'short',
    });

    const parts = etFormatter.formatToParts(date);
    const partMap: Record<string, string> = {};
    parts.forEach(p => (partMap[p.type] = p.value));

    const weekday = partMap.weekday; // Mon, Tue, etc.
    const hour = parseInt(partMap.hour, 10);
    const minute = parseInt(partMap.minute, 10);
    const totalMinutes = hour * 60 + minute;

    const displayTime = date.toLocaleTimeString('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const isWeekend = weekday === 'Sat' || weekday === 'Sun';

    if (isWeekend) {
      return {
        status: 'Market Closed',
        isOpen: false,
        timeString: `${displayTime} ET`,
        timezoneLabel: 'ET (New York)',
        sessionNote: 'Weekend - Regular trading resumes Monday at 9:30 AM ET',
        nextEvent: 'Opens Mon 9:30 AM ET',
      };
    }

    // 04:00 - 09:30 ET: Pre-Market (240 to 570 mins)
    if (totalMinutes >= 240 && totalMinutes < 570) {
      return {
        status: 'Pre-Market',
        isOpen: false,
        timeString: `${displayTime} ET`,
        timezoneLabel: 'ET (New York)',
        sessionNote: 'Pre-market trading in session (4:00 AM – 9:30 AM ET)',
        nextEvent: 'Regular opens at 9:30 AM ET',
      };
    }

    // 09:30 - 16:00 ET: Market Open (570 to 960 mins)
    if (totalMinutes >= 570 && totalMinutes < 960) {
      return {
        status: 'Market Open',
        isOpen: true,
        timeString: `${displayTime} ET`,
        timezoneLabel: 'ET (New York)',
        sessionNote: 'Regular trading hours (NYSE & NASDAQ)',
        nextEvent: 'Closes at 4:00 PM ET',
      };
    }

    // 16:00 - 20:00 ET: After Hours (960 to 1200 mins)
    if (totalMinutes >= 960 && totalMinutes < 1200) {
      return {
        status: 'After Hours',
        isOpen: false,
        timeString: `${displayTime} ET`,
        timezoneLabel: 'ET (New York)',
        sessionNote: 'After-hours trading session (4:00 PM – 8:00 PM ET)',
        nextEvent: 'Pre-market opens 4:00 AM ET',
      };
    }

    // Overnight / Closed
    return {
      status: 'Market Closed',
      isOpen: false,
      timeString: `${displayTime} ET`,
      timezoneLabel: 'ET (New York)',
      sessionNote: 'NYSE & NASDAQ closed overnight',
      nextEvent: 'Pre-market opens 4:00 AM ET',
    };
  } else {
    // India - IST (Asia/Kolkata)
    const istFormatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
      weekday: 'short',
    });

    const parts = istFormatter.formatToParts(date);
    const partMap: Record<string, string> = {};
    parts.forEach(p => (partMap[p.type] = p.value));

    const weekday = partMap.weekday;
    const hour = parseInt(partMap.hour, 10);
    const minute = parseInt(partMap.minute, 10);
    const totalMinutes = hour * 60 + minute;

    const displayTime = date.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const isWeekend = weekday === 'Sat' || weekday === 'Sun';

    if (isWeekend) {
      return {
        status: 'Market Closed',
        isOpen: false,
        timeString: `${displayTime} IST`,
        timezoneLabel: 'IST (Mumbai)',
        sessionNote: 'Weekend - NSE/BSE trading resumes Monday at 9:15 AM IST',
        nextEvent: 'Opens Mon 9:15 AM IST',
      };
    }

    // 09:00 - 09:15 IST: Pre-Market (540 to 555 mins)
    if (totalMinutes >= 540 && totalMinutes < 555) {
      return {
        status: 'Pre-Market',
        isOpen: false,
        timeString: `${displayTime} IST`,
        timezoneLabel: 'IST (Mumbai)',
        sessionNote: 'Pre-open market order collection & matching',
        nextEvent: 'Regular opens at 9:15 AM IST',
      };
    }

    // 09:15 - 15:30 IST: Market Open (555 to 930 mins)
    if (totalMinutes >= 555 && totalMinutes < 930) {
      return {
        status: 'Market Open',
        isOpen: true,
        timeString: `${displayTime} IST`,
        timezoneLabel: 'IST (Mumbai)',
        sessionNote: 'Regular trading hours (NSE & BSE)',
        nextEvent: 'Closes at 3:30 PM IST',
      };
    }

    // 15:40 - 16:00 IST: Post-Market (940 to 960 mins)
    if (totalMinutes >= 940 && totalMinutes < 960) {
      return {
        status: 'Post-Market',
        isOpen: false,
        timeString: `${displayTime} IST`,
        timezoneLabel: 'IST (Mumbai)',
        sessionNote: 'Post-closing session for settlement',
        nextEvent: 'Pre-market opens 9:00 AM IST',
      };
    }

    // Closed
    return {
      status: 'Market Closed',
      isOpen: false,
      timeString: `${displayTime} IST`,
      timezoneLabel: 'IST (Mumbai)',
      sessionNote: 'NSE & BSE closed for the day',
      nextEvent: 'Pre-market opens 9:00 AM IST',
    };
  }
};
