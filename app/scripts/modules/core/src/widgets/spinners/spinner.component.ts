import { module } from 'angular';
import { react2angular } from 'react2angular';

import { Spinner } from './Spinner';

export const SPINNER = 'spinnaker.core.spinner.component';

module(SPINNER, [])
  .component('loadingSpinner', react2angular(Spinner, ['size', 'message', 'postnote']));
