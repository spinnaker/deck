import * as React from 'react';
import { FormikProps } from 'formik';

import { SETTINGS } from 'core/config/settings';
import { IPubsubTrigger } from 'core/domain';
import { MapEditorInput } from 'core/forms';
import { HelpField } from 'core/help';

import { FormikFormField, ReactSelectInput, useLatestPromise } from 'core/presentation';
import { PubsubSubscriptionReader } from 'core/pubsub';
import { Spinner } from 'core/widgets';

export interface IPubsubTriggerProps {
  formik: FormikProps<IPubsubTrigger>;
  triggerUpdated: (trigger: IPubsubTrigger) => void;
}

export function PubsubTrigger(pubsubTriggerProps: IPubsubTriggerProps) {
  const { formik } = pubsubTriggerProps;
  const trigger = formik.values;
  const pubsubSystems = SETTINGS.pubsubProviders || ['google']; // TODO(joonlim): Add amazon once it is confirmed that amazon pub/sub works.

  const fetchSubscriptions = useLatestPromise(() => PubsubSubscriptionReader.getPubsubSubscriptions(), []);
  const pubsubSubscriptions = fetchSubscriptions.result || [];
  const subscriptionsLoaded = fetchSubscriptions.status === 'RESOLVED';

  const filteredPubsubSubscriptions = pubsubSubscriptions
    .filter(subscription => subscription.pubsubSystem === trigger.pubsubSystem)
    .map(subscription => subscription.subscriptionName);

  if (subscriptionsLoaded) {
    return (
      <>
        <FormikFormField
          name="pubsubSystem"
          label="Pub/Sub System Type"
          input={props => (
            <ReactSelectInput {...props} placeholder="Select Pub/Sub System" stringOptions={pubsubSystems} />
          )}
        />

        <FormikFormField
          name="subscriptionName"
          label="Subscription Name"
          input={props => (
            <ReactSelectInput
              {...props}
              placeholder="Select Pub/Sub Subscription"
              stringOptions={filteredPubsubSubscriptions}
            />
          )}
        />

        <hr />

        <FormikFormField
          name="payloadConstraints"
          label="Payload Constraints"
          help={<HelpField id="pipeline.config.trigger.pubsub.payloadConstraints" />}
          input={props => <MapEditorInput {...props} addButtonLabel="Add payload constraint" />}
        />

        <FormikFormField
          name="attributeConstraints"
          label="Attribute Constraints "
          help={<HelpField id="pipeline.config.trigger.pubsub.attributeConstraints" />}
          input={props => <MapEditorInput {...props} addButtonLabel="Add attribute constraint" />}
        />
      </>
    );
  } else {
    return (
      <div className="horizontal middle center" style={{ marginBottom: '250px', height: '150px' }}>
        <Spinner size={'medium'} />
      </div>
    );
  }
}
