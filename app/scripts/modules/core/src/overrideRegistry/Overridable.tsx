import { Spinner } from 'core';
import * as React from 'react';
import { Subject, Observable } from 'rxjs';

import { ReactInjector, AngularJSAdapter } from 'core/reactShims';
import { IAccountDetails } from 'core/account';

export interface IOverridableProps {
  accountId?: string;
}

/**
 * Enables this component to be overriden by some other component.
 *
 * This is a Class Decorator which should be applied to a React Component Class.
 *
 * When rendered, the component will first check if an overriding component is registered using the same key.
 * If yes, the overriding component is rendered.
 * If no, the decorated component itself is rendered.
 *
 * @Overridable('overrideKey')
 * class MyCmp extends React.Component {
 *   render() { return <h1>Overridable Component</h1> }
 * }
 *
 * When using the component, just render it as usual:
 * <MyCmp/>
 *
 * If the override is cloud provider specific, pass the accountId as a prop:
 * <MyCmp accountId={accountId} />
 */
export function Overridable(key: string) {
  return function <P extends IOverridableProps, T extends React.ComponentClass<P>> (targetComponent: T): T {
    return overridableComponent(targetComponent, key)
  }
}

/**
 * A high order component which returns a delegating component.
 * The component will delegate to the overriding component registered with OverrideRegistry or CloudProviderRegistry.
 * If no override is registered, it delegates to the component being decorated.
 *
 * class MyCmp extends React.Component {
 *   render() { return <h1>Overridable Component</h1>
 * }
 *
 * export const MyOverridableCmp = overridableComponent(MyCmp);
 */
export function overridableComponent <P extends IOverridableProps, T extends React.ComponentClass<P>> (DefaultComponent: T, key: string): T {
  class OverridableComponent extends React.Component<P, { Component: T }> {
    private account$ = new Subject<string>();
    private destroy$ = new Subject();

    constructor(props: P) {
      super(props);

      const { accountService } = ReactInjector;
      let constructing = true;

      this.account$
        .switchMap(accountName => {
          if (!accountName) {
            return Observable.of(null);
          }

          return accountService.accounts$.map(accts => accts.find(acct => acct.name === accountName));
        })
        .map((accountDetails: IAccountDetails) => this.getComponent(accountDetails))
        .takeUntil(this.destroy$)
        .subscribe((Component) => {
          // The component may be ready synchronously (when the constructor is run), or it might require async.
          // Handle either case here
          if (constructing) {
            this.state = { Component };
          } else {
            this.setState({ Component });
          }
        });

      this.account$.next(this.props.accountId);
      constructing = false;
    }

    public componentWillUnmount() {
      this.destroy$.next();
    }

    public componentWillReceiveProps(nextProps: P) {
      const { accountId } = nextProps;
      if (this.props.accountId !== accountId) {
        this.account$.next(accountId);
      }
    }

    private getComponentFromCloudProvider(accountDetails: IAccountDetails): T {
      const { cloudProvider, providerVersion } = accountDetails;
      const { cloudProviderRegistry } = ReactInjector;
      if (!cloudProvider) {
        return null;
      }

      const CloudProviderComponentOverride = cloudProviderRegistry.getValue(cloudProvider, key, providerVersion);
      if (CloudProviderComponentOverride) {
        return CloudProviderComponentOverride as T;
      }

      const cloudProviderTemplateOverride = cloudProviderRegistry.getValue(cloudProvider, key + 'TemplateUrl', providerVersion);
      if (cloudProviderTemplateOverride) {
        const cloudProviderController = cloudProviderRegistry.getValue(cloudProvider, key + 'Controller', providerVersion);
        const controllerAs = cloudProviderController && cloudProviderController.includes(' as ') ? undefined : 'ctrl';
        const Component = (props: any) =>
          <AngularJSAdapter {...props} templateUrl={cloudProviderTemplateOverride} controller={cloudProviderController} controllerAs={controllerAs}/>;

        return Component as any as T;
      }

      return null;
    }

    private getComponentFromOverrideRegistry(): T {
      const { overrideRegistry } = ReactInjector;

      const ComponentOverride = overrideRegistry.getComponent(key);
      if (ComponentOverride) {
        return ComponentOverride as T;
      }

      const templateOverride: string = overrideRegistry.getTemplate(key, null);
      if (templateOverride) {
        const controllerOverride: string = overrideRegistry.getController(key, null);
        const controllerAs = controllerOverride && controllerOverride.includes(' as ') ? undefined : 'ctrl';
        const Component = (props: any) =>
            <AngularJSAdapter {...props} templateUrl={templateOverride} controller={controllerOverride} controllerAs={controllerAs} />;

        return Component as any as T;
      }

      return null;
    }

    private getComponent(accountDetails: IAccountDetails): T {
      return this.getComponentFromCloudProvider(accountDetails || {} as any) || this.getComponentFromOverrideRegistry() || DefaultComponent;
    }

    public render() {
      const Component = this.state && this.state.Component;
      return Component ? <Component {...this.props} /> : <Spinner/>;
    }
  }

  return OverridableComponent as any as T;
}
