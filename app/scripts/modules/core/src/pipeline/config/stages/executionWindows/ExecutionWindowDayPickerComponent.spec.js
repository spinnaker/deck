import { DAYS_OF_WEEK} from './daysOfWeek';
import { EXECUTION_WINDOWS_DAY_PICKER } from './executionWindowDayPicker.component';
describe('Component:  Execution Window Day Picker', () => {

  let $componentController;
  beforeEach(window.module(EXECUTION_WINDOWS_DAY_PICKER));
  beforeEach(window.inject((_$componentController_) => $componentController = _$componentController_));

  function constructController(bindings) {
    const ctrl = $componentController('executionWindowDayPicker', null, { windowConfig: bindings });
    ctrl.$onInit();
    return ctrl;
  }

  it('should not have any days selected when the days property is not defined', () => {
    const ctrl = constructController({days: undefined});
    expect(ctrl.windowConfig.days).toBeUndefined();
  });

  it('should not have any days selected when the days property is null', () => {
    const ctrl = constructController({days: null});
    expect(ctrl.windowConfig.days).toBe(null);
  });

  it('should not have any days selected when the days property is an empty array', () => {
    const ctrl = constructController({days: []});
    expect(ctrl.windowConfig.days.length).toBe(0);
  });

  DAYS_OF_WEEK.forEach((day) => {
    it(`should have ${day.key} selected when the days property contains ${day.ordinal}`, () => {
      const ctrl = constructController({days: [day.ordinal]});
      expect(ctrl.windowConfig.days.length).toBe(1);
      expect(ctrl.windowConfig.days[0]).toBe(day.ordinal);
    });
  });

  it('should select all the days when the all button is clicked', () => {
    const ctrl = constructController({});
    ctrl.all();
    expect(ctrl.windowConfig.days.length).toBe(7);
  });

  it('should select none of the days when the none button is clicked', () => {
    const ctrl = constructController({});
    ctrl.all();
    expect(ctrl.windowConfig.days.length).toBe(7);
    ctrl.none();
    expect(ctrl.windowConfig.days.length).toBe(0);
  });

  it('should select just the weekdays when the weekday button is clicked', () => {
    const ctrl = constructController({});
    ctrl.weekdays();
    expect(ctrl.windowConfig.days.length).toBe(5);
    expect(ctrl.windowConfig.days).toEqual([2,3,4,5,6]);
  });

  it('should select just the weekend when the weekend button is clicked', () => {
    const ctrl = constructController({});
    ctrl.weekend();
    expect(ctrl.windowConfig.days.length).toBe(2);
    expect(ctrl.windowConfig.days[0]).toBe(1); // sunday
    expect(ctrl.windowConfig.days[1]).toBe(7); // saturday
  });

  it('should specify whether or not a day is selected', () => {
    const ctrl = constructController({
      days: [1]
    });
    expect(ctrl.daySelected(1)).toBe(true);
    expect(ctrl.daySelected(2)).toBe(false);

    ctrl.windowConfig.days = [1, 2];
    expect(ctrl.daySelected(2)).toBe(true);
    expect(ctrl.daySelected(3)).toBe(false);
  });

  it('should add a day to the model when selected', () => {
    const ctrl = constructController({});
    ctrl.updateModel(DAYS_OF_WEEK[0]);
    expect(ctrl.daySelected(1)).toBe(true);
  });

  it('should remove a day from the model when unselected', () => {
    const ctrl = constructController({
      days: [1] // pre-select sunday
    });
    ctrl.updateModel(DAYS_OF_WEEK[0]);
    expect(ctrl.daySelected(1)).toBe(false);
  });
});
