import * as React from 'react';

import { Tooltip } from 'core/presentation';

interface ISpelToggleProps {
  inputMode: SpelAwareInputMode;
  onClick: () => void;
}

export enum SpelAwareInputMode {
  DEFAULT = 'DEFAULT',
  FREEFORM = 'FREEFORM',
}

export function SpelToggle(props: ISpelToggleProps) {
  const inputModeLabels: { [k in SpelAwareInputMode]: string } = {
    [SpelAwareInputMode.DEFAULT]: 'Enter SpEL in freeform input',
    [SpelAwareInputMode.FREEFORM]: 'Return to default input',
  };

  return (
    <Tooltip value={inputModeLabels[props.inputMode]}>
      <button className="btn btn-sm btn-default" onClick={props.onClick}>
        <span className="fa icon-spel" />
      </button>
    </Tooltip>
  );
}
