import { module } from 'angular';
import * as React from 'react';

export class OverrideRegistry {
  private templateOverrides: Map<string, string> = new Map();
  private componentOverrides: Map<string, React.ComponentClass> = new Map();
  private controllerOverrides: Map<string, string> = new Map();

  public overrideTemplate(key: string, val: string) {
    this.templateOverrides.set(key, val);
  }

  public overrideComponent(key: string, val: React.ComponentClass) {
    this.componentOverrides.set(key, val);
  }

  public overrideController(key: string, val: string) {
    this.controllerOverrides.set(key, val);
  }

  public getTemplate(key: string, defaultVal: string) {
    return this.templateOverrides.get(key) || defaultVal;
  }

  public getComponent<T>(key: string) {
    return this.componentOverrides.get(key) as React.ComponentClass<T>;
  }

  public getController(key: string) {
    return this.controllerOverrides.get(key) || key;
  }
}

export const OVERRIDE_REGISTRY = 'spinnaker.core.override.registry';
module(OVERRIDE_REGISTRY, []).service('overrideRegistry', OverrideRegistry);
