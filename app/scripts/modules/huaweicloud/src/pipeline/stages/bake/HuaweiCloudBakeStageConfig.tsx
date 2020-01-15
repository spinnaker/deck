import * as React from 'react';

import { Observable, Subject } from 'rxjs';
import { Option } from 'react-select';
import { HelpField } from 'core/help';

import {
  BakeryReader,
  IBaseImage,
  IStageConfigProps,
  TextInput,
  SelectInput,
  RadioButtonInput,
  CheckboxInput,
  FormikFormField,
  FormikStageConfig,
  SETTINGS,
} from '@spinnaker/core';

interface IHuaweiCloudBakeStageConfigState {
  regions: string[];
  baseImages: IBaseImage[];
  baseLabels: string[];
  showAdvanceOptions: boolean;
}

export class HuaweiCloudBakeStageConfig extends React.Component<IStageConfigProps, IHuaweiCloudBakeStageConfigState> {
  constructor(props: IStageConfigProps) {
    super(props);
    props.stage.cloudProvider = 'huaweicloud';
    this.state = {
      regions: [],
      baseImages: [],
      baseLabels: [],
      showAdvanceOptions: false,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange() {
    this.setState({ showAdvanceOptions: !this.state.showAdvanceOptions });
  }

  public componentWillMount(): void {
    Promise.all([
      BakeryReader.getRegions('huaweicloud'),
      BakeryReader.getBaseOsOptions('huaweicloud'),
      BakeryReader.getBaseLabelOptions(),
    ]).then(([regions, options, labels]) => {
      this.setState({
        regions: regions,
        baseImages: options.baseImages,
        baseLabels: labels,
      });
    });
  }

  public render() {
    const { regions, baseImages, baseLabels } = this.state;

    const baseImages1 = baseImages.map((baseImage: IBaseImage) => {
      return { label: baseImage.id, value: baseImage.id, help: <HelpField content={baseImage.shortDescription} /> };
    });

    const baseLabels1 = baseLabels.map((label: string) => {
      return { label: label, value: label };
    });

    const regions1 = regions.map((region: string) => {
      return { label: region, value: region };
    });

    const roscoMode = SETTINGS.feature.roscoMode;
    const stageConfigProps = this.props;

    return (
      <div className="form-horizontal">
        {regions && regions.length > 0 ? (
          <FormikStageConfig
            {...stageConfigProps}
            onChange={stageConfigProps.updateStage}
            render={({ pipeline }) => (
              <div className="form-horizontal">
                <FormikFormField
                  name="baseOs"
                  label="Base Image"
                  input={inputProps => <RadioButtonInput {...inputProps} inline={true} options={baseImages1} />}
                />

                <FormikFormField
                  name="region"
                  label="Region"
                  input={inputProps => <RadioButtonInput {...inputProps} inline={true} options={regions1} />}
                />

                <FormikFormField
                  name="package"
                  label="Package"
                  help={<HelpField id="pipeline.config.bake.package" />}
                  input={inputProps => <TextInput {...inputProps} />}
                />

                <FormikFormField
                  name="baseLabel"
                  label="Base Label"
                  input={inputProps => <RadioButtonInput {...inputProps} inline={true} options={baseLabels1} />}
                />

                {roscoMode && (
                  <FormikFormField
                    name="rebake"
                    label="Rebake"
                    input={(inputProps: ICheckBoxInputProps) => (
                      <CheckboxInput
                        {...inputProps}
                        text="Rebake image without regard to the status of any existing bake"
                      />
                    )}
                  />
                )}

                <CheckboxInput
                  text="Advanced Options"
                  value={this.state.showAdvanceOptions}
                  inputClassName="col-md-offset-2"
                  onChange={this.handleChange}
                />

                {this.state.showAdvanceOptions && roscoMode && (
                  <FormikFormField
                    name="templateFileName"
                    label="Template File Name"
                    help={<HelpField id="pipeline.config.bake.templateFileName" />}
                    input={inputProps => <TextInput {...inputProps} />}
                  />
                )}
              </div>
            )}
          />
        ) : null}
      </div>
    );
  }
}
