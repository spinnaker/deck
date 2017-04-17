import {IPlatformProperty} from './platformProperty.model';
import {Scope} from './scope.domain';

export class Property {
  [key: string]: any;
  public propertyId: string;
  public env = 'prod';
  public sourceOfUpdate = 'spinnaker';
  public updatedBy: string;
  public constraints: string;
  public description: string;
  public key: string;
  public value: string;
  public email: string;
  public cmcTicket: string;

  public appId: string;
  public scope: Scope;

  public static build(platformProperty: IPlatformProperty): Property {
    const property = new Property();
    property.propertyId = platformProperty.propertyId;
    property.env = platformProperty.env;
    property.updatedBy = platformProperty.updatedBy;
    property.constraints = platformProperty.constraints;
    property.description = platformProperty.description;
    property.key = platformProperty.key;
    property.value = platformProperty.value;
    property.email = platformProperty.email;
    property.cmcTicket = platformProperty.updatedBy;

    return property;
  }

  public static copy(property: Property): Property {
    return Object.assign(new Property(), property);
  }

  constructor(env?: string) {
    this.env = env;
  }

  public isValid() {
    return (this.key && this.value && this.email);
  }
}
