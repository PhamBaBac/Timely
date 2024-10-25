import { ScheduleModel } from '../models/ScheduleModel';


export const compareSchedule = (a: ScheduleModel, b: ScheduleModel) => {
  // So sánh startDate trước
  if (a.startDate.getTime() !== b.startDate.getTime()) {
    return a.startDate.getTime() - b.startDate.getTime();
  }

  // Khi startDate bằng nhau, tiếp tục so sánh period
  const getPeriodStart = (period: string) => {
    switch(period) {
      case '1-3': return 1;
      case '4-6': return 2;
      case '7-9': return 3;
      case '10-12': return 4;
      case '13-15': return 5;
      default: return 999; // Để những period không hợp lệ xuống cuối
    }
  };

  const periodA = getPeriodStart(a.period);
  const periodB = getPeriodStart(b.period);

  return periodA - periodB;
};