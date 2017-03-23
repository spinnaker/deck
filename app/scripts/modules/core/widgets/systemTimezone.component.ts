import * as moment from 'moment';
import 'moment-timezone';
import {module, IComponentOptions} from 'angular';

import {TimeFilterConstants} from 'core/utils/filters/time/timeFilters.constants';

class SystemTimezoneComponent implements IComponentOptions {

  public template = `<span ng-bind="$ctrl.tz"></span>`;
  public controller = function(settings: any) {
    const zone: string = settings.defaultTimeZone || TimeFilterConstants.DEFAULT_TIMEZONE;
    this.tz = moment.tz(moment(), zone).zoneAbbr();
  };
}

export const SYSTEM_TIMEZONE_COMPONENT = 'spinnaker.core.widget.systemTimezone.component';
module(SYSTEM_TIMEZONE_COMPONENT, [require('core/config/settings.js')])
  .component('systemTimezone', new SystemTimezoneComponent());
