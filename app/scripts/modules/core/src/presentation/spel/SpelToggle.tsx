import * as React from 'react';
import * as classNames from 'classnames';

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
  return (
    <Tooltip
      value={
        props.inputMode === SpelAwareInputMode.FREEFORM ? 'Return to default input' : 'Enter SpEL in freeform input'
      }
    >
      <button
        className={classNames('btn btn-sm btn-default', { active: props.inputMode === SpelAwareInputMode.FREEFORM })}
        onClick={props.onClick}
      >
        <span className="fa icon-spel" />
      </button>
    </Tooltip>
  );
}
