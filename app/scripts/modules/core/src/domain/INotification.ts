export interface INotification {
  level?: string;
  type: string;
  when: string[];
  [key: string]: any;
}
