import React from 'react';
import { FormikProps } from 'formik';
import { every } from 'lodash';

import { HelpField, FormikFormField, CheckboxInput } from '@spinnaker/core';

import { IAmazonNetworkLoadBalancerUpsertCommand } from 'amazon/domain';

export interface INLBAdvancedSettingsProps {
  formik: FormikProps<IAmazonNetworkLoadBalancerUpsertCommand>;
}

export const NLBAdvancedSettings = React.forwardRef<HTMLDivElement, INLBAdvancedSettingsProps>((props, ref) => {
  const { formik } = props;
  /** NLBs can only be dualstacked if they are external and all targets are IPs. This will remain true until NLBs support security groups. */
  const allIpTargets = every(formik.values.targetGroups, { targetType: 'ip' });
  const showDualstack = !formik.values.isInternal && allIpTargets;
  return (
    <div ref={ref}>
      <FormikFormField
        name="deletionProtection"
        label="Protection"
        help={<HelpField id="loadBalancer.advancedSettings.deletionProtection" />}
        input={(props) => <CheckboxInput {...props} text="Enable deletion protection" />}
      />

      <FormikFormField
        name="loadBalancingCrossZone"
        label="Cross-Zone Load Balancing"
        help={<HelpField id="loadBalancer.advancedSettings.loadBalancingCrossZone" />}
        input={(props) => <CheckboxInput {...props} text="Enable deletion protection" />}
      />

      {showDualstack && (
        <FormikFormField
          name="dualstack"
          label="Dualstack"
          help={<HelpField id="loadBalancer.advancedSettings.nlbIpAddressType" />}
          input={(inputProps) => <CheckboxInput {...inputProps} text="Assign Ipv4 and IPv6" />}
        />
      )}
    </div>
  );
});
