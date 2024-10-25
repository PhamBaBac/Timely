import {appInfo} from '../constants';
import { numberToString } from './numberToString';
import { addDays, addMonths, addWeeks, format } from 'date-fns';

export class DateTime {
  static formatTime(startTime: string): import("react").ReactNode {
    const date = new Date(`1970-01-01T${startTime}Z`);
    return format(date, 'HH:mm');
  }

  static GetTime = (num: Date) => {
    const date = new Date(num);

    return `${numberToString(date.getHours())}:${numberToString(
      date.getMinutes(),
    )}`;
  };

  static GetDate = (num: Date) => {
    const date = new Date(num);

    return `${numberToString(date.getDate())}-${
      appInfo.monthNames[date.getMonth()]
    }-${date.getFullYear()}`;
  };

  static GetDayString = (num: number) => {
    const date = new Date(num);

    return `${appInfo.dayNames[date.getDay()]}, ${
      appInfo.monthNames[date.getMonth()]
    } ${numberToString(date.getDate())}`;
  };

  static GetDayOfWeek = (num: number) => {
    const date = new Date(num);
    return `${numberToString(date.getDate())}-${
      appInfo.monthNames[date.getMonth()]
    }`;
  };

  static GetWeekday = (num: number) => {
    const date = new Date(num);
    return appInfo.dayNames[date.getDay()];
  };
}