import * as React from 'react';
import { FormikErrors } from 'formik';

import { Validation, FormikFormField, NumberInput, HelpField, IWizardPageProps, wizardPage } from '@spinnaker/core';

import { IAmazonClassicLoadBalancerUpsertCommand } from 'amazon/domain';

import './AdvancedSettings.css';

export type IAdvancedSettingsProps = IWizardPageProps<IAmazonClassicLoadBalancerUpsertCommand>;

class AdvancedSettingsImpl extends React.Component<IAdvancedSettingsProps> {
  public static LABEL = 'Advanced Settings';

  public validate(): FormikErrors<IAmazonClassicLoadBalancerUpsertCommand> {
    return {};
  }

  public render() {
    const { values } = this.props.formik;
    return (
      <div className="form-group AmazonLoadBalancer-AdvancedSettings">
        <FormikFormField
          name="healthTimeout"
          label="Timeout"
          required={true}
          fastField={false} /* This field depends on healthInterval */
          help={<HelpField id="loadBalancer.advancedSettings.healthTimeout" />}
          input={props => <NumberInput {...props} min={0} max={values.healthInterval} />}
          validate={Validation.maxValue(values.healthInterval, 'Timeout must be less than the health interval.')}
        />

        <FormikFormField
          name="healthInterval"
          label="Interval"
          required={true}
          help={<HelpField id="loadBalancer.advancedSettings.healthInterval" />}
          input={props => <NumberInput {...props} min={0} />}
        />

        <FormikFormField
          name="healthyThreshold"
          label="Healthy Threshold"
          required={true}
          help={<HelpField id="loadBalancer.advancedSettings.healthyThreshold" />}
          input={props => <NumberInput {...props} min={0} />}
        />

        <FormikFormField
          name="unhealthyThreshold"
          label="Unhealthy Threshold"
          required={true}
          help={<HelpField id="loadBalancer.advancedSettings.unhealthyThreshold" />}
          input={props => <NumberInput {...props} min={0} />}
        />

        <FormikFormField
          name="idleTimeout"
          label="Idle Timeout"
          required={true}
          help={<HelpField id="loadBalancer.advancedSettings.idleTimeout" />}
          input={props => <NumberInput {...props} min={0} />}
        />

        <div className="col-md-12">
          <p>
            Additional configuration options (cross-zone load balancing, session stickiness, access logs) are available
            via the AWS console.
          </p>
        </div>
      </div>
    );
  }
}

export const AdvancedSettings = wizardPage(AdvancedSettingsImpl);
