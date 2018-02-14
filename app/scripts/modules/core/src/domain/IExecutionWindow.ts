export interface IExecutionWindow {
  whitelist: ITimeWindow[];
  days?: number[];
}

export interface ITimeWindow {
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
}
