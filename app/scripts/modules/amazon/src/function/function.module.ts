import { module } from 'angular';

import { AWS_FUNCTION_DETAILS_CTRL } from './details/functionDetails.controller';
import { FUNCTION_ACTIONS } from './details/functionActions.component';

export const AWS_FUNCTION_MODULE = 'spinnaker.amazon.function';

module(AWS_FUNCTION_MODULE, [AWS_FUNCTION_DETAILS_CTRL, FUNCTION_ACTIONS]);
