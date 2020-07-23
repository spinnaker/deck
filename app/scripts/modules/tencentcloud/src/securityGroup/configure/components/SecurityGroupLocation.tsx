import * as React from 'react';
import { FormikProps } from 'formik';
import {
  AccountSelectInput,
  AccountService,
  Application,
  FormikFormField,
  HelpField,
  IMoniker,
  IWizardPageComponent,
  NameUtils,
  RegionSelectInput,
  Spinner,
  TextAreaInput,
  TextInput,
  FormValidator,
  FirewallLabels,
  Validators,
  useData,
  useDataSource,
} from '@spinnaker/core';
import { ISecurityGroupDetail } from '../../interface';

export interface ISecurityGroupLocationProps {
  app: Application;
  formik: FormikProps<ISecurityGroupDetail>;
  forPipelineConfig?: boolean;
  isNew?: boolean;
  securityGroup?: ISecurityGroupDetail;
}

export interface ISecurityGroupLocationState {
  existingSecurityGroupNames: string[];
}

// IWizardPageComponent wrapper component which must be a Class component with validate()
export class SecurityGroupLocation extends React.Component<ISecurityGroupLocationProps, ISecurityGroupLocationState>
  implements IWizardPageComponent<ISecurityGroupDetail> {
  public state: ISecurityGroupLocationState = {
    existingSecurityGroupNames: [],
  };

  public validate(values: ISecurityGroupDetail) {
    const { credentials, region } = values;
    const validator = new FormValidator(values);

    validator.field('credentials').required();
    validator
      .field('name')
      .withValidators(
        Validators.valueUnique(
          this.state.existingSecurityGroupNames,
          `There is already a ${FirewallLabels.get('firewall')} in ${credentials}:${region} with that name.`,
        ),
        Validators.maxLength(32, `${FirewallLabels.get('Firewall')} names cannot exceed 32 characters in length`),
      );

    validator
      .field('stack')
      .optional()
      .withValidators(value => !value.match(/^[a-zA-Z0-9]*$/) && 'Stack can only contain letters and numbers.');

    validator
      .field('detail')
      .optional()
      .withValidators(
        value => !value.match(/^[a-zA-Z0-9-]*$/) && 'Detail can only contain letters, numbers, and dashes.',
      );

    return validator.validateForm();
  }

  public render() {
    const onExistingSecurityGroupsChanged = (groups: string[]) => {
      // Revalidate form if the known existing security groups have changed
      this.setState({ existingSecurityGroupNames: groups });
      this.props.formik.validateForm();
    };

    return (
      <FirewallLocationForm
        onExistingSecurityGroupsChanged={onExistingSecurityGroupsChanged}
        formik={this.props.formik}
        app={this.props.app}
      />
    );
  }
}

interface IFirewallLocationFormProps {
  app: Application;
  formik: FormikProps<ISecurityGroupDetail>;
  onExistingSecurityGroupsChanged: (groups: string[]) => void;
}

function FirewallLocationForm(props: IFirewallLocationFormProps) {
  const { app, formik } = props;
  const { values } = formik;
  const { credentials, region, stack, detail } = values;

  const fetchAccounts = useData(() => AccountService.listAccounts('tencentcloud'), [], []);
  const fetchRegions = useData(() => AccountService.getRegionsForAccount(values.credentials), [], [values.credentials]);
  const regions = fetchRegions.result;
  const allSecurityGroups: ISecurityGroupDetail[] = useDataSource(app.getDataSource('securityGroups')).data;

  React.useEffect(() => {
    // Notify parent component when all security groups are loaded
    const regionalSecurityGroups = allSecurityGroups
      .filter(sg => sg.account === credentials && sg.region === region)
      .map(sg => sg.name);
    props.onExistingSecurityGroupsChanged(regionalSecurityGroups);
  }, [allSecurityGroups, credentials, region]);

  React.useEffect(() => {
    // Update the form values whenever app/stack/detail change
    const cluster = NameUtils.getClusterName(app.name, stack, detail);
    const moniker: IMoniker = { app: app.name, stack, detail, cluster: cluster };
    formik.setFieldValue('moniker', moniker);
    formik.setFieldValue('name', cluster);
  }, [app, stack, detail]);

  React.useEffect(() => {
    // If the selected region doesn't exist in the new list of regions (for a new acct), select the first region.
    if (!regions.find(x => x.name === region)) {
      props.formik.setFieldValue('region', regions[0] && regions[0].name);
    }
  }, [regions, region]);

  return (
    <div className="container-fluid form-horizontal">
      <div className="well alert-info">
        <FormikFormField
          name="name"
          touched={true}
          input={() => (
            <>
              <span>
                <strong>Your load balancer will be named: </strong>
                {values.name}
                <HelpField id="tencentcloud.loadBalancer.name" />
              </span>
            </>
          )}
        />
      </div>

      <FormikFormField
        name="credentials"
        label="Account"
        input={props =>
          fetchAccounts.status === 'PENDING' ? (
            <Spinner />
          ) : (
            <AccountSelectInput {...props} accounts={fetchAccounts.result} provider="tencentcloud" />
          )
        }
      />

      <FormikFormField
        name="region"
        label="Region"
        input={props => {
          return fetchRegions.status === 'PENDING' ? (
            <Spinner />
          ) : (
            <RegionSelectInput {...props} account={values.credentials} regions={fetchRegions.result} />
          );
        }}
      />

      <FormikFormField name="stack" label="Stack" touched={true} input={props => <TextInput {...props} />} />
      <FormikFormField name="detail" label="Detail" touched={true} input={props => <TextInput {...props} />} />
      <FormikFormField name="description" label="Description" input={props => <TextAreaInput {...props} />} />
    </div>
  );
}
