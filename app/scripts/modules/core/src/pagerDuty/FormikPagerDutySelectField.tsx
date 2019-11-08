import * as React from 'react';

import { FormikFormField, ReactSelectInput } from 'core/presentation';
import { IPagerDutyService, PagerDutyReader } from './pagerDuty.read.service';

export interface IFormikPagerDutySelectField {
  required?: boolean;
}

export function FormikPagerDutySelectField(props: IFormikPagerDutySelectField) {
  const [pageDutyServices, setPageDutyServices] = React.useState<IPagerDutyService[]>([]);
  const [servicesLoaded, setServicesLoaded] = React.useState<boolean>(false);
  const label = `PagerDuty${props.required ? ' *' : ''}`;
  const helpContents = (
    <>
      <p>Make sure your service exists in Pager Duty and includes the "Generic API" integration.</p>
      <h5>
        <b>Setting up a new integration</b>
      </h5>
      <ol>
        <li>Find your service in Pager Duty</li>
        <li>Click "New Integration"</li>
        <li>Select "Use our API directly"</li>
        <li>Make sure to select "Events API v1" (Spinnaker is not compatible with v2)</li>
      </ol>
      <p>
        <b>Note:</b> it can take up to five minutes for the service to appear in Spinnaker
      </p>
    </>
  );

  React.useEffect(() => {
    PagerDutyReader.listServices().subscribe((pagerDutyServices: IPagerDutyService[]) => {
      setPageDutyServices(pagerDutyServices.filter(service => service.integration_key));
      setServicesLoaded(true);
    });
  }, []);

  return (
    <>
      {servicesLoaded && (
        <FormikFormField
          name="pdApiKey"
          label={label}
          help={helpContents}
          required={props.required}
          input={fieldProps => (
            <ReactSelectInput
              {...fieldProps}
              options={pageDutyServices.map(pd => ({ label: pd.name, value: pd.integration_key }))}
            />
          )}
        />
      )}
    </>
  );
}
