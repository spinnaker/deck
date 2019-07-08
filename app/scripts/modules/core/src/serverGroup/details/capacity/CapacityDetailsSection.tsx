import * as React from 'react';

import { ICapacity } from '../../serverGroupWriter.service';
import { CurrentCapacity } from './CurrentCapacity';
import { DesiredCapacity } from './DesiredCapacity';

interface ICapacityDetailsSectionProps {
  capacity: ICapacity;
  current: number;
}

export function CapacityDetailsSection(props: ICapacityDetailsSectionProps) {
  const { capacity, current } = props;
  const simpleMode = capacity.max === capacity.max;
  return (
    <dl className="dl-horizontal dl-flex">
      <DesiredCapacity capacity={capacity} simpleMode={simpleMode} />
      <CurrentCapacity currentCapacity={current} />
    </dl>
  );
}
