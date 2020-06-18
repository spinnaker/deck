import * as React from 'react';
import {
  FirewallLabels,
  ReactModal,
  WizardModal,
  WizardPage,
  noop,
  TaskMonitor,
  ReactInjector,
  SecurityGroupWriter,
  AccountService,
  InfrastructureCaches,
  NameUtils,
} from '@spinnaker/core';
import { Subject } from 'rxjs';
import { get, uniq, intersection } from 'lodash';
import { ISecurityGroup } from '@spinnaker/core';
import { ISecurityGroupProps, ISecurityGroupDetail } from '../define';
import { LoadBalancerLocation } from './components/LoadBalancerLocation';
import { Ingress } from './components/Ingress';
export interface ICreateSecurityGroupState {
  taskMonitor: TaskMonitor;
  securityGroup: ISecurityGroupDetail;
  accounts: any[];
  regions: any[];
  submitting: boolean;
  refreshingSecurityGroups: boolean;
  infiniteScroll: {
    numToAdd: number;
    currentItems: number;
  };
  allSecurityGroups: [];
  availableSecurityGroups: any[];
  existingSecurityGroupNames: any[];
  securityGroupsLoaded: boolean;
  refreshTime: any;
  namePreview: string;
}

export class CreateSecurityGroupModal extends React.Component<ISecurityGroupProps, ICreateSecurityGroupState> {
  public static defaultProps: Partial<ISecurityGroupProps> = {
    closeModal: noop,
    dismissModal: noop,
  };

  public static show(props: ISecurityGroupProps): Promise<ISecurityGroup> {
    const modalProps = { dialogClassName: 'wizard-modal modal-lg' };
    return ReactModal.show(CreateSecurityGroupModal, props, modalProps);
  }

  constructor(props: ISecurityGroupProps) {
    super(props);
    this.state = {
      taskMonitor: null,
      accounts: [],
      regions: [],
      securityGroup: {
        description: '',
      },
      submitting: false,
      refreshingSecurityGroups: false,
      infiniteScroll: {
        numToAdd: 20,
        currentItems: 20,
      },
      allSecurityGroups: [],
      availableSecurityGroups: [],
      existingSecurityGroupNames: [],
      securityGroupsLoaded: false,
      refreshTime: '',
      namePreview: '',
    };
  }

  componentDidMount() {
    this.initializeSecurityGroups().then(this.initializeAccounts);
  }

  setSecurityGroupRefreshTime() {
    this.setState({
      refreshTime: InfrastructureCaches.get('securityGroups').getStats().ageMax,
    });
  }

  private initializeSecurityGroups() {
    return ReactInjector.securityGroupReader.getAllSecurityGroups().then(securityGroups => {
      this.setSecurityGroupRefreshTime();
      // const {
      //   securityGroup: { credentials, accountName, region },
      // } = this.state;
      // const account = credentials || accountName;
      // let availableGroups;
      // if (account && region) {
      //   availableGroups = (securityGroups[account] && securityGroups[account].tencentcloud[region]) || [];
      // } else {
      //   availableGroups = securityGroups;
      // }
      this.setState({
        allSecurityGroups: (securityGroups as unknown) as [],
        // availableSecurityGroups: availableGroups.map((i: { name: string }) => i.name),
      });
      this.allSecurityGroupsUpdated.next();
    });
  }

  private allSecurityGroupsUpdated = new Subject();

  private initializeAccounts = () => {
    return AccountService.listAllAccounts('tencentcloud').then(res => {
      const accounts = res.filter(a => a.authorized !== false);
      this.setState({ accounts }, () => {
        this.accountUpdated();
      });
    });
  };

  private getAccount = () => this.state.securityGroup.accountName || this.state.securityGroup.credentials;

  private accountUpdated() {
    const { securityGroup } = this.state;
    securityGroup.account = securityGroup.accountId = securityGroup.accountName = securityGroup.credentials;
    AccountService.getRegionsForAccount(this.getAccount()).then(res => {
      const regions = res.map(region => region.name);
      this.setState({ regions });
      // clearSecurityGroups();
      this.regionUpdated();
      if (this.props.isNew) {
        this.updateName();
      }
    });
  }
  updateName() {
    const { securityGroup } = this.state;
    const name = NameUtils.getClusterName(this.props.application.name, securityGroup.stack, securityGroup.detail);
    securityGroup.name = name;
    this.setState({
      securityGroup,
      namePreview: name,
    });
  }

  configureFilteredSecurityGroups() {
    const account = this.getAccount();
    const { securityGroup, allSecurityGroups } = this.state;
    const region = securityGroup.region;
    let existingSecurityGroupNames: any[] = [];
    let availableSecurityGroups: any[] = [];

    const regionalGroupNames = get(allSecurityGroups, [account, 'tencentcloud', region].join('.'), []).map(
      (sg: { name: string }) => sg.name,
    );

    existingSecurityGroupNames = uniq(existingSecurityGroupNames.concat(regionalGroupNames));

    if (!availableSecurityGroups.length) {
      availableSecurityGroups = existingSecurityGroupNames;
    } else {
      availableSecurityGroups = intersection(availableSecurityGroups, regionalGroupNames);
    }
    this.setState({
      availableSecurityGroups,
      existingSecurityGroupNames,
      securityGroupsLoaded: true,
    });
  }
  private regionUpdated() {
    this.configureFilteredSecurityGroups();
  }

  addMoreItems() {
    const { infiniteScroll } = this.state;
    infiniteScroll.currentItems += infiniteScroll.numToAdd;
    this.setState({ infiniteScroll });
  }
  protected onApplicationRefresh = (): void => {
    if (this._isUnmounted) {
      return;
    }
    this.refreshUnsubscribe = undefined;
    this.props.dismissModal();
    this.setState({ taskMonitor: undefined });
    const { name, region, vpcId } = this.state.securityGroup;
    const newStateParams = {
      provider: 'tencentcloud',
      name,
      accountId: this.getAccount(),
      region,
      vpcId,
    };
    if (!ReactInjector.$state.includes('**.firewallDetails')) {
      ReactInjector.$state.go('.firewallDetails', newStateParams);
    } else {
      ReactInjector.$state.go('^.firewallDetails', newStateParams);
    }
  };

  submit = (values: ISecurityGroupDetail) => {
    const { inRules, stack, detail, credentials, name, description, region } = values;
    const taskMonitor = new TaskMonitor({
      application: this.props.application,
      title: `Creating your ${FirewallLabels.get('firewall')}`,
      modalInstance: TaskMonitor.modalInstanceEmulation(() => this.props.dismissModal()),
      onTaskComplete: this.onTaskComplete,
    });
    const command = {
      cloudProvider: 'tencentcloud',
      stack,
      detail,
      application: this.props.application.name,
      account: credentials,
      accountName: credentials,
      name,
      securityGroupDesc: description,
      region,
      inRules,
    };
    taskMonitor.submit(() => {
      return SecurityGroupWriter.upsertSecurityGroup(command, this.props.application, 'Create');
    });
    this.setState({ taskMonitor, securityGroup: values });
  };

  private _isUnmounted = false;

  private refreshUnsubscribe: () => void;

  public componentWillUnmount(): void {
    this._isUnmounted = true;
    if (this.refreshUnsubscribe) {
      this.refreshUnsubscribe();
    }
  }

  private onTaskComplete = (): void => {
    this.props.application.securityGroups.refresh();
    this.refreshUnsubscribe = this.props.application.securityGroups.onNextRefresh(null, this.onApplicationRefresh);
  };

  public render() {
    const { application, isNew, dismissModal } = this.props;
    const { taskMonitor, securityGroup } = this.state;
    return (
      // @ts-ignore
      <WizardModal<ICreateSecurityGroup>
        heading={`${isNew ? 'Creating' : 'Updating'} ${FirewallLabels.get('Firewall')}`}
        initialValues={securityGroup}
        taskMonitor={taskMonitor}
        dismissModal={dismissModal}
        submitButtonLabel={isNew ? 'Create' : 'Update'}
        closeModal={this.submit}
        render={({ formik, nextIdx, wizard }) => {
          // @ts-ignore
          return (
            <>
              {
                // @ts-ignore
                <WizardPage
                  label="Location"
                  wizard={wizard}
                  order={nextIdx()}
                  render={({ innerRef }) => (
                    <LoadBalancerLocation app={application} formik={formik} isNew={isNew} ref={innerRef} />
                  )}
                />
              }
              {
                // @ts-ignore
                <WizardPage
                  label="Ingress"
                  wizard={wizard}
                  order={nextIdx()}
                  render={({ innerRef }) => <Ingress app={application} formik={formik} ref={innerRef} />}
                />
              }
            </>
          );
        }}
      />
    );
  }
}
