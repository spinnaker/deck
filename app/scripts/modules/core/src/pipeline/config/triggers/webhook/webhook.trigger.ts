import { ArtifactTypePatterns } from 'core/artifact';
import { Registry } from 'core/registry';

import { WebhookTrigger } from './WebhookTrigger';

Registry.pipeline.registerTrigger({
  component: WebhookTrigger,
  description: 'Executes the pipeline when a webhook is received.',
  excludedArtifactTypePatterns: [ArtifactTypePatterns.JENKINS_FILE],
  key: 'webhook',
  label: 'Webhook',
  validators: [
    {
      type: 'serviceAccountAccess',
      message: `You do not have access to the service account configured in this pipeline's webhook trigger.
                You will not be able to save your edits to this pipeline.`,
      preventSave: true,
    },
  ],
});
