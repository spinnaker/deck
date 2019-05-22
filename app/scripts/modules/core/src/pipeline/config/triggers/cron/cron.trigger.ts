import { ArtifactTypePatterns } from 'core/artifact';
import { ICronTrigger } from 'core/domain';
import { Registry } from 'core/registry';

import { CronTrigger } from './CronTrigger';

Registry.pipeline.registerTrigger({
  component: CronTrigger,
  description: 'Executes the pipeline on a CRON schedule',
  excludedArtifactTypePatterns: [ArtifactTypePatterns.JENKINS_FILE],
  executionTriggerLabel: (trigger: ICronTrigger) => trigger.cronExpression,
  key: 'cron',
  label: 'CRON',
  validators: [
    {
      type: 'serviceAccountAccess',
      message: `You do not have access to the service account configured in this pipeline's CRON trigger.
                    You will not be able to save your edits to this pipeline.`,
      preventSave: true,
    },
  ],
});
