import * as React from 'react';
import { IPipeline } from '../../domain';
import { SpelText } from '../../widgets';

export interface IMapPair {
  key: string;
  value: string;
  error?: string;
}

export const MapPair = (props: {
  keyLabel: string;
  valueLabel: string;
  labelsLeft: boolean;
  pair: IMapPair;
  onChange: (pair: IMapPair) => void;
  onDelete: () => void;
  valueCanContainSpel?: boolean;
  pipeline?: IPipeline;
}) => {
  const { keyLabel, labelsLeft, pair, onChange, onDelete, valueLabel, valueCanContainSpel, pipeline } = props;

  return (
    <tr>
      {labelsLeft && (
        <td className="table-label">
          <b>{keyLabel}</b>
        </td>
      )}
      <td>
        <input
          className="form-control input input-sm"
          type="text"
          value={pair.key}
          onChange={e => onChange({ key: e.target.value, value: pair.value })}
        />
        {pair.error && <div className="error-message">{pair.error}</div>}
      </td>
      {labelsLeft && (
        <td className="table-label">
          <b>{valueLabel}</b>
        </td>
      )}
      <td>
        {valueCanContainSpel ? (
          <SpelText
            value={pair.value}
            pipeline={pipeline}
            docLink={true}
            onChange={value => onChange({ key: pair.key, value: value })}
          />
        ) : (
          <input
            className="form-control input input-sm"
            type="text"
            value={pair.value}
            onChange={e => onChange({ key: pair.key, value: e.target.value })}
          />
        )}
      </td>
      <td>
        <div className="form-control-static">
          <a className="clickable" onClick={onDelete}>
            <span className="glyphicon glyphicon-trash" />
            <span className="sr-only">Remove field</span>
          </a>
        </div>
      </td>
    </tr>
  );
};
