import React from 'react';

import { ChecklistInput } from '@spinnaker/core';

export interface IAvailabilityZoneSelectorProps {
  allZones: string[];
  credentials: string;
  region: string;
  selectedZones: string[];
  onChange: (zones: string[]) => void;
  onPreferredZonesSelect?: () => void;
}

export const AvailabilityZoneSelector = ({
  allZones,
  selectedZones,
  onChange,
  onPreferredZonesSelect,
}: IAvailabilityZoneSelectorProps) => {
  const handleSelectedZonesChanged = React.useCallback(zones => onChange([...zones]), []);
  return (
    <div className="form-group">
      <div className="col-md-3 sm-label-right">Availability Zones</div>
      <div className="col-md-7">
        <p className="form-control-static">Choose Your Zones:</p>
        <div>
          <ChecklistInput
            stringOptions={allZones}
            value={selectedZones}
            onChange={(e: React.ChangeEvent<any>) => handleSelectedZonesChanged(e.target.value)}
          />
          {onPreferredZonesSelect ? (
            <a style={{ cursor: 'pointer' }} onClick={onPreferredZonesSelect}>
              Reset to preferred zones
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
};
