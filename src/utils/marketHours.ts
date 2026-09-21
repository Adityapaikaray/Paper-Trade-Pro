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

export type MarketSessionMode = 'LIVE' | 'DELAYED' | 'CLOSED';

export interface MarketSessionDetail {
  mode: MarketSessionMode;
  statusText: 'LIVE' | 'DELAYED' | 'CLOSED';
  exchangeName: string;
  region: 'IN' | 'US';
  sessionName: string;
  schedule: string;
  localTimeStr: string;
  timezoneLabel: string;
  nextEvent: string;
  sessionNote: string;
  feedType: string;
  isOpen: boolean;
  isPreOrPost: boolean;
  phase: 'regular' | 'pre_market' | 'post_market' | 'after_hours' | 'closed';
}

/**
 * Accurately determines the dynamic market session status (LIVE, DELAYED, or CLOSED)
 * based on the official trading schedule for the selected India (NSE/BSE) or U.S. (NYSE/NASDAQ) market.
 */
export const getMarketSessionDetail = (
  region: 'IN' | 'US' = 'IN',
  date: Date = new Date(),
  previewOverride?: MarketSessionMode | null
): MarketSessionDetail => {
  const isUS = region === 'US';
  const exchangeName = isUS ? 'NYSE / NASDAQ' : 'NSE / BSE';
  const timezoneCode = isUS ? 'America/New_York' : 'Asia/Kolkata';
  const tzAbbr = isUS ? 'ET' : 'IST';
  const timezoneLabel = isUS ? 'Eastern Time (New York)' : 'Indian Standard Time (Mumbai)';

  // Format local exchange time
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezoneCode,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
    weekday: 'short',
  });

  const parts = formatter.formatToParts(date);
  const partMap: Record<string, string> = {};
  parts.forEach(p => (partMap[p.type] = p.value));

  const weekday = partMap.weekday || 'Mon';
  const hour = parseInt(partMap.hour, 10) || 0;
  const minute = parseInt(partMap.minute, 10) || 0;
  const second = parseInt(partMap.second, 10) || 0;
  const totalMinutes = hour * 60 + minute;

  const localTimeStr = date.toLocaleTimeString('en-US', {
    timeZone: timezoneCode,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }) + ` ${tzAbbr}`;

  const isWeekend = weekday === 'Sat' || weekday === 'Sun';

  let calculatedMode: MarketSessionMode = 'CLOSED';
  let sessionName = 'Market Closed';
  let schedule = isUS ? '09:30 – 16:00 ET' : '09:15 – 15:30 IST';
  let nextEvent = '';
  let sessionNote = '';
  let feedType = 'Official Close Settled';
  let isOpen = false;
  let isPreOrPost = false;
  let phase: MarketSessionDetail['phase'] = 'closed';

  if (isUS) {
    // US Market Schedule
    if (isWeekend) {
      calculatedMode = 'CLOSED';
      phase = 'closed';
      sessionName = 'Weekend - Market Closed';
      schedule = '09:30 – 16:00 ET (Mon–Fri)';
      nextEvent = 'Opens Monday 09:30 AM ET';
      sessionNote = 'NYSE & NASDAQ regular trading resumes Monday at 9:30 AM ET';
      feedType = 'Previous Session Settled';
    } else if (totalMinutes < 240) {
      // 00:00 - 04:00 ET: Overnight closed
      calculatedMode = 'CLOSED';
      phase = 'closed';
      sessionName = 'Overnight - Market Closed';
      schedule = '09:30 – 16:00 ET';
      nextEvent = 'Pre-market opens at 04:00 AM ET';
      sessionNote = 'U.S. exchanges closed overnight';
      feedType = 'Previous Session Settled';
    } else if (totalMinutes >= 240 && totalMinutes < 570) {
      // 04:00 - 09:30 ET: Pre-Market
      calculatedMode = 'DELAYED';
      phase = 'pre_market';
      isPreOrPost = true;
      sessionName = 'Pre-Market Extended Session';
      schedule = '04:00 – 09:30 ET';
      nextEvent = 'Regular market opens at 09:30 AM ET';
      sessionNote = 'Early pre-market order flow and indications (15-min delay)';
      feedType = '15m Delayed Extended Feed';
    } else if (totalMinutes >= 570 && totalMinutes < 960) {
      // 09:30 - 16:00 ET: Regular Live Session
      calculatedMode = 'LIVE';
      phase = 'regular';
      isOpen = true;
      sessionName = 'Regular Trading Session';
      schedule = '09:30 – 16:00 ET';
      nextEvent = 'Regular session closes at 04:00 PM ET';
      sessionNote = 'Continuous trading on NYSE & NASDAQ in session';
      feedType = 'Real-Time Sub-Second Stream';
    } else if (totalMinutes >= 960 && totalMinutes < 1200) {
      // 16:00 - 20:00 ET: After-Hours
      calculatedMode = 'DELAYED';
      phase = 'after_hours';
      isPreOrPost = true;
      sessionName = 'After-Hours Extended Session';
      schedule = '16:00 – 20:00 ET';
      nextEvent = 'Extended session concludes at 08:00 PM ET';
      sessionNote = 'Post-market earnings releases and trading (15-min delay)';
      feedType = '15m Delayed After-Hours Feed';
    } else {
      // 20:00 - 23:59 ET: Closed
      calculatedMode = 'CLOSED';
      phase = 'closed';
      sessionName = 'Market Closed for the Day';
      schedule = '09:30 – 16:00 ET';
      nextEvent = 'Pre-market opens tomorrow at 04:00 AM ET';
      sessionNote = 'NYSE & NASDAQ trading concluded for today';
      feedType = 'Previous Session Settled';
    }
  } else {
    // India Market Schedule (NSE / BSE)
    if (isWeekend) {
      calculatedMode = 'CLOSED';
      phase = 'closed';
      sessionName = 'Weekend - Market Closed';
      schedule = '09:15 – 15:30 IST (Mon–Fri)';
      nextEvent = 'Opens Monday 09:15 AM IST';
      sessionNote = 'NSE/BSE regular trading resumes Monday at 9:15 AM IST';
      feedType = 'Previous Session Settled';
    } else if (totalMinutes < 540) {
      // 00:00 - 09:00 IST: Overnight closed
      calculatedMode = 'CLOSED';
      phase = 'closed';
      sessionName = 'Overnight - Market Closed';
      schedule = '09:15 – 15:30 IST';
      nextEvent = 'Pre-market auction opens at 09:00 AM IST';
      sessionNote = 'Indian exchanges closed overnight';
      feedType = 'Previous Session Settled';
    } else if (totalMinutes >= 540 && totalMinutes < 555) {
      // 09:00 - 09:15 IST: Pre-Market Call Auction
      calculatedMode = 'DELAYED';
      phase = 'pre_market';
      isPreOrPost = true;
      sessionName = 'Pre-Market Order Discovery';
      schedule = '09:00 – 09:15 IST';
      nextEvent = 'Regular live market opens at 09:15 AM IST';
      sessionNote = 'Order collection, price discovery and pre-open matching';
      feedType = 'Pre-Market Indicative Feed (15m Delay)';
    } else if (totalMinutes >= 555 && totalMinutes < 930) {
      // 09:15 - 15:30 IST: Regular Live Session
      calculatedMode = 'LIVE';
      phase = 'regular';
      isOpen = true;
      sessionName = 'Regular Trading Session';
      schedule = '09:15 – 15:30 IST';
      nextEvent = 'Regular session closes at 03:30 PM IST';
      sessionNote = 'Continuous double auction trading on NSE & BSE in session';
      feedType = 'Real-Time Sub-Second Stream';
    } else if (totalMinutes >= 930 && totalMinutes < 960) {
      // 15:30 - 16:00 IST: Post-Market Closing Auction
      calculatedMode = 'DELAYED';
      phase = 'post_market';
      isPreOrPost = true;
      sessionName = 'Post-Market Closing Session';
      schedule = '15:30 – 16:00 IST';
      nextEvent = 'Day settlement concludes at 04:00 PM IST';
      sessionNote = 'Closing price determination and delayed block settlement';
      feedType = 'Delayed Post-Market Feed';
    } else {
      // 16:00 - 23:59 IST: Closed
      calculatedMode = 'CLOSED';
      phase = 'closed';
      sessionName = 'Market Closed for the Day';
      schedule = '09:15 – 15:30 IST';
      nextEvent = 'Pre-market opens tomorrow at 09:00 AM IST';
      sessionNote = 'NSE & BSE cash market trading concluded for today';
      feedType = 'Previous Session Settled';
    }
  }

  const activeMode = previewOverride || calculatedMode;

  return {
    mode: activeMode,
    statusText: activeMode,
    exchangeName,
    region,
    sessionName: previewOverride ? `${previewOverride} (Preview Override)` : sessionName,
    schedule,
    localTimeStr,
    timezoneLabel,
    nextEvent,
    sessionNote,
    feedType,
    isOpen: activeMode === 'LIVE',
    isPreOrPost,
    phase
  };
};
