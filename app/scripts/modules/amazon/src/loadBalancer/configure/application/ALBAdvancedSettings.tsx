import React from 'react';

import { FormikProps } from 'formik';
import { FormikFormField, CheckboxInput, NumberInput, HelpField } from '@spinnaker/core';
import { IAmazonApplicationLoadBalancerUpsertCommand } from 'amazon/domain';

export interface IALBAdvancedSettingsProps {
  formik: FormikProps<IAmazonApplicationLoadBalancerUpsertCommand>;
}

export const ALBAdvancedSettings = React.forwardRef<HTMLDivElement, IALBAdvancedSettingsProps>((props, ref) => (
  <div ref={ref}>
    <FormikFormField
      name="idleTimeout"
      label="Idle Timeout"
      help={<HelpField id="loadBalancer.advancedSettings.idleTimeout" />}
      input={(props) => <NumberInput {...props} min={0} />}
    />

    <FormikFormField
      name="deletionProtection"
      label="Protection"
      help={<HelpField id="loadBalancer.advancedSettings.deletionProtection" />}
      input={(props) => <CheckboxInput {...props} text="Enable delete protection" />}
    />

    <FormikFormField
      name="dualstack"
      label="Dualstack"
      help={<HelpField id="loadBalancer.advancedSettings.albIpAddressType" />}
      input={(inputProps) => (
        <CheckboxInput
          {...inputProps}
          text="Assign Ipv4 and IPv6"
          disabled={Boolean(props.formik.values?.isInternal)}
        />
      )}
    />
  </div>
));
