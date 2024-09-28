export interface ScheduleModel {
    id : string;
    course: string;
    period: string;
    group: string;
    room: string;
    day: Date;
    instructor: string;
    isExam: boolean;
}
