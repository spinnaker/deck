import * as React from 'react';

import { IStage } from 'core/domain';
import { HelpField } from 'core/help';
import { RadioButtonInput } from 'core/presentation';
import { StageConfigField } from 'core/pipeline';

const { useEffect, useState } = React;
import './overrideFailure.less';

export interface IOverrideFailureConfigProps {
  failPipeline: boolean;
  continuePipeline: boolean;
  completeOtherBranchesThenFail: boolean;
  updateStageField: (changes: Partial<IStage>) => void;
}

export const OverrideFailure = (props: IOverrideFailureConfigProps) => {
  const [failureOption, setFailureOption] = useState('');
  const overrideFailureOptions = [
    {
      label: 'halt the entire pipeline',
      value: 'fail',
      help: <HelpField id="pipeline.config.haltPipelineOnFailure" />,
    },
    {
      label: 'halt this branch of the pipeline',
      value: 'stop',
      help: <HelpField id="pipeline.config.haltBranchOnFailure" />,
    },
    {
      label: 'halt this branch and fail the pipeline once other branches complete',
      value: 'faileventual',
      help: <HelpField id="pipeline.config.haltBranchOnFailureFailPipeline" />,
    },
    {
      label: 'ignore the failure',
      value: 'ignore',
      help: <HelpField id="pipeline.config.ignoreFailure" />,
    },
  ];

  useEffect(() => {
    let initValue = 'fail';
    if (props.completeOtherBranchesThenFail === true) {
      initValue = 'faileventual';
    } else if (props.failPipeline === true && props.continuePipeline === false) {
      initValue = 'fail';
    } else if (props.failPipeline === false && props.continuePipeline === false) {
      initValue = 'stop';
    } else if (props.failPipeline === false && props.continuePipeline === true) {
      initValue = 'ignore';
    }
    setFailureOption(initValue);
  }, [props.completeOtherBranchesThenFail, props.failPipeline, props.continuePipeline]);

  const failureOptionChanged = (value: string) => {
    if (value === 'fail') {
      props.updateStageField({
        failPipeline: true,
        continuePipeline: false,
        completeOtherBranchesThenFail: false,
      });
    } else if (value === 'stop') {
      props.updateStageField({
        failPipeline: false,
        continuePipeline: false,
        completeOtherBranchesThenFail: false,
      });
    } else if (value === 'ignore') {
      props.updateStageField({
        failPipeline: false,
        continuePipeline: true,
        completeOtherBranchesThenFail: false,
      });
    } else if (value === 'faileventual') {
      props.updateStageField({
        failPipeline: false,
        continuePipeline: true,
        completeOtherBranchesThenFail: true,
      });
    }
    setFailureOption(value);
  };

  return (
    <StageConfigField label="If stage fails">
      <RadioButtonInput
        inputClassName={'override-failure-radio-input'}
        options={overrideFailureOptions}
        value={failureOption}
        onChange={(e: any) => failureOptionChanged(e.target.value)}
      />
    </StageConfigField>
  );
};
