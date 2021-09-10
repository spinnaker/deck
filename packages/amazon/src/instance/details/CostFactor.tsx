import React from 'react';

export interface ICostFactorProps {
  costFactor: number | { min: number; max: number };
}

export function CostFactor(props: ICostFactorProps) {
  if (typeof props.costFactor === 'number') {
    return (
      <span className={'cost-factor'}>
        <CostFactorDollar costF={props.costFactor} />
      </span>
    );
  } else {
    const { min, max } = props.costFactor;
    return (
      <span className={'cost-factor'}>
        <CostFactorDollar costF={min} /> - <CostFactorDollar costF={max} />
      </span>
    );
  }
}

const CostFactorDollar = (props: { costF: number }): JSX.Element => {
  const MAX_LENGTH = 4;
  const DOLLAR = '$';

  return (
    <>
      <span className="cost">{DOLLAR.repeat(props.costF)}</span>
      {DOLLAR.repeat(MAX_LENGTH - props.costF)}
    </>
  );
};
