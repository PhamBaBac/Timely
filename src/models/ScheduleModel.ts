export interface ScheduleModel {
    [x: string]: any;
    id : string;
    course: string;
    period: string;
    group: string;
    room: string;
    day: Date;
    instructor: string;
    isExam: boolean;
    startDate: Date;
    endDate: Date;
    
}
