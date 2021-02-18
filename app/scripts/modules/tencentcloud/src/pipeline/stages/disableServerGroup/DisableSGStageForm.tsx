import React from 'react';
const { useEffect, useState } = React;
import {
  AccountService,
  NgReact,
  StageConfigField,
  StageConstants,
  IAccount,
  IFormikStageConfigInjectedProps,
} from '@spinnaker/core';
const { AccountRegionClusterSelector, TargetSelect } = NgReact;

export function DisableSGStageForm({ application, formik, pipeline }: IFormikStageConfigInjectedProps) {
  const stage = formik.values;
  const { setFieldValue } = formik;
  const [accounts, setAccounts] = useState([]);
  const [targets] = useState(StageConstants.TARGET_LIST);

  useEffect(() => {
    AccountService.listAccounts('tencentcloud').then((accounts: IAccount[]) => {
      setAccounts(accounts);
    });

    if (
      stage.isNew &&
      application?.attributes?.platformHealthOnlyShowOverride &&
      application?.attributes?.platformHealthOnly
    ) {
      setFieldValue('interestingHealthProviderNames', ['Tencentcloud']);
    }

    if (!stage.credentials && application?.defaultCredentials?.tencentcloud) {
      setFieldValue('credentials', application?.defaultCredentials?.tencentcloud);
    }

    if (!stage?.regions?.length && application?.defaultRegions?.tencentcloud) {
      setFieldValue('regions', [...stage.regions, application?.defaultRegions?.tencentcloud]);
    }

    if (!stage.target) {
      setFieldValue('target', targets[0].val);
    }
  }, []);

  const targetUpdated = (target: string) => {
    setFieldValue('target', target);
  };

  return (
    <div className="form-horizontal">
      {!pipeline.strategy && (
        <AccountRegionClusterSelector
          application={application}
          clusterField={'cluster'}
          component={stage}
          accounts={accounts}
        />
      )}
      <StageConfigField label="Target">
        <TargetSelect model={{ target: stage.target }} options={targets} onChange={targetUpdated} />
      </StageConfigField>
    </div>
  );
}
