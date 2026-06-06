import { ObjectType, v } from 'convex/values';

// Time constants
export const DAY_DURATION = 10 * 60 * 1000; // 10 minutes per day (in game time)
export const HOUR_DURATION = DAY_DURATION / 24;

// Day phases
export type DayPhase = 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';

export const serializedTime = {
  // Current time in the game (0 to DAY_DURATION)
  timeOfDay: v.number(),
  // Day number (starts at 1)
  dayNumber: v.number(),
  // Real timestamp when the current day started
  dayStartTimestamp: v.number(),
};
export type SerializedTime = ObjectType<typeof serializedTime>;

export class GameTime {
  timeOfDay: number; // 0 to DAY_DURATION
  dayNumber: number;
  dayStartTimestamp: number;

  constructor(serialized: SerializedTime) {
    this.timeOfDay = serialized.timeOfDay;
    this.dayNumber = serialized.dayNumber;
    this.dayStartTimestamp = serialized.dayStartTimestamp;
  }

  // Update time based on current real timestamp
  tick(now: number): void {
    const elapsed = now - this.dayStartTimestamp;
    this.timeOfDay = elapsed % DAY_DURATION;

    // Check if day has changed
    const newDayNumber = Math.floor(elapsed / DAY_DURATION) + 1;
    if (newDayNumber !== this.dayNumber) {
      this.dayNumber = newDayNumber;
    }
  }

  // Get current hour (0-23)
  getHour(): number {
    return Math.floor((this.timeOfDay / DAY_DURATION) * 24);
  }

  // Get current minute (0-59)
  getMinute(): number {
    const hourFraction = (this.timeOfDay / DAY_DURATION) * 24;
    return Math.floor((hourFraction - Math.floor(hourFraction)) * 60);
  }

  // Get time as formatted string (e.g., "14:30")
  getTimeString(): string {
    const hour = this.getHour();
    const minute = this.getMinute();
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  // Get current day phase
  getDayPhase(): DayPhase {
    const hour = this.getHour();
    if (hour >= 5 && hour < 8) return 'dawn';
    if (hour >= 8 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 20) return 'evening';
    return 'night';
  }

  // Check if it's night time (when agents should go home)
  isNight(): boolean {
    const hour = this.getHour();
    return hour >= 20 || hour < 6;
  }

  // Check if it's evening (time to start heading home)
  isEvening(): boolean {
    const hour = this.getHour();
    return hour >= 18 && hour < 20;
  }

  // Check if it's morning (time to leave home)
  isMorning(): boolean {
    const hour = this.getHour();
    return hour >= 6 && hour < 9;
  }

  // Get how much time has passed since a specific hour
  hoursSince(targetHour: number): number {
    const currentHour = this.getHour();
    const currentMinute = this.getMinute();
    let diff = currentHour - targetHour;
    if (diff < 0) diff += 24;
    return diff + currentMinute / 60;
  }

  serialize(): SerializedTime {
    return {
      timeOfDay: this.timeOfDay,
      dayNumber: this.dayNumber,
      dayStartTimestamp: this.dayStartTimestamp,
    };
  }

  // Create initial time
  static createInitial(now: number): GameTime {
    return new GameTime({
      timeOfDay: 0,
      dayNumber: 1,
      dayStartTimestamp: now,
    });
  }
}

// Utility to check if agent should go home
export function shouldGoHome(gameTime: GameTime, atHome: boolean): boolean {
  if (atHome) {
    // If already at home, stay until morning
    return !gameTime.isMorning();
  }
  // If not at home, go home in the evening or night
  return gameTime.isEvening() || gameTime.isNight();
}

// Utility to check if agent should leave home
export function shouldLeaveHome(gameTime: GameTime): boolean {
  return gameTime.isMorning();
}
