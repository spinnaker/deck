import React, { SyntheticEvent, useState, useCallback } from 'react';
import { FormikProps } from 'formik';
import { times } from 'lodash';

import { HelpField, SETTINGS } from '@spinnaker/core';
import { IAmazonServerGroupCommand } from '../../../serverGroupConfiguration.service';
import { ParsedShards, parse, toFreeformDetails } from '../../../ServerGroupShardingUtils';

const SUPPORTED_SHARD_DIMENSION_COUNT = SETTINGS.feature.shards ? 2 : 0;

const removeSPELExpressions = (field: string) => field.split(/\$\{.*\}/).join('');

const validateShard = (shard: string) =>
  /^[a-zA-Z0-9]*$/.test(removeSPELExpressions(shard))
    ? null
    : 'Only alpha-numeric characters are allowed in the Shard field.';

const validateOtherDetails = (detail: string) => {
  const detailWithoutSPEL = removeSPELExpressions(detail);

  if (!/^([a-zA-Z0-9._-])*$/.test(detailWithoutSPEL)) {
    return 'Only dot(.), underscore(_), and dash(-) special characters are allowed in the Detail field.';
  }

  if (/-x\d/.test(`-${detailWithoutSPEL}`)) {
    return 'Tokens of the form `-x\\d` cannot be used in the Detail field.';
  }

  return null;
};

interface LocalError {
  error: string | null;
  value: string | null;
}
/**
 * This react hook is expected to listen to value changes and validate them. If there are no errors, then
 * it will call the `successHandler`. If not, it will store error & value locally and expose it to the
 * component without calling the `successHandler`. This is needed in components that merely render values that are
 * completely controlled by their parent but wishes not to update the parent when there is an error.
 *
 * @param validator - A function that accepts the new value and returns a string if there is an error.
 * @param successHandler - A function that is called by the hook when a new valid value is available.
 * @param errorHandler - A function that is called by the hook when a new invalid value is available.
 *
 * Why keep track of a local error state?
 *
 * Values for `shards` and `other` are not stored as individual fields in the server group. Instead they are embedded
 * into `freeformDetails` field along with other details. See `serverGroupShardingUtils` for more details on the
 * format of the data.
 *
 * When the user is editing the value of this field, it is possible to introduce incorrect values such as hyphens,
 * spaces, dots etc. These incorrect values will get combined to form the consolidated value for `freeformDetails`
 * field. This consolidated value will be parsed again when `ServerGroupDetailsField` is re-rendered, but the parsing
 * will fail this time since the consolidated value does not conform to the expected format. This will result in a
 * state where the error cannot be shown to the user and won't be provided a way to fix it.
 *
 * Keeping a local error state allows us to bail out from informing the parent about the change and provide the user
 * a way to fix the error.
 */
function useLocalError(
  validator: (value: string) => string | null,
  successHandler: (value: string) => void,
  errorHandler: (error: string) => void,
): [LocalError | null, (value: string) => void] {
  const [localError, setLocalError] = useState<LocalError>(null);
  const changeHandler = useCallback(
    (value: string) => {
      const error = validator(value);
      if (!error) {
        successHandler(value);
        setLocalError(null);
      } else {
        setLocalError({ error, value });
        errorHandler(error);
      }
    },
    [validator, successHandler],
  );

  return [localError, changeHandler];
}

interface ShardFieldProps {
  shardIndex: number;
  value: string;
  onChange: (shardIndex: number, value: string) => void;
  onError: (error: string) => void;
}
function ShardField({ shardIndex, value, onChange, onError }: ShardFieldProps) {
  const [localError, changeHandler] = useLocalError(
    validateShard,
    (value: string) => {
      onChange(shardIndex, value);
    },
    onError,
  );

  const onValueChange = useCallback(
    (e: SyntheticEvent) => {
      changeHandler((e.target as HTMLInputElement).value);
    },
    [changeHandler],
  );

  return (
    <>
      <div className="form-group">
        <div className="col-md-3 sm-label-right">
          Shard {shardIndex} <HelpField id="aws.serverGroup.shard" />
        </div>
        <div className="col-md-7">
          <input
            type="text"
            className="form-control input-sm no-spel"
            // When there is an error, the parent wasn't informed of the change, so use the value from local error
            // state.
            value={localError ? localError.value : value}
            onChange={onValueChange}
          />
        </div>
      </div>
      {localError && (
        <div className="form-group row slide-in">
          <div className="col-md-7 col-md-offset-3 error-message">
            <span>{localError.error}</span>
          </div>
          <span></span>
        </div>
      )}
    </>
  );
}

export interface OtherDetailsFieldProps {
  value: string;
  onChange: (value: string) => void;
  onError: (error: string) => void;
}
function OtherDetailsField({ value, onChange, onError }: OtherDetailsFieldProps) {
  const [localError, changeHandler] = useLocalError(
    validateOtherDetails,
    (value: string) => {
      onChange(value);
    },
    onError,
  );

  const onValueChange = useCallback(
    (e: SyntheticEvent) => {
      changeHandler((e.target as HTMLInputElement).value);
    },
    [changeHandler],
  );

  return (
    <>
      <div className="form-group">
        <div className="col-md-3 sm-label-right">
          Detail <HelpField id="aws.serverGroup.detail" />
        </div>
        <div className="col-md-7">
          <input
            className="form-control input-sm no-spel"
            type="text"
            // When there is an error, the parent wasn't informed of the change, so use the value from local error
            // state.
            value={localError ? localError.value : value}
            onChange={onValueChange}
          />
        </div>
      </div>
      {localError && (
        <div className="form-group row slide-in">
          <div className="col-md-7 col-md-offset-3 error-message">
            <span>{localError.error}</span>
          </div>
          <span></span>
        </div>
      )}
    </>
  );
}

export interface DetailsFieldProps {
  formik: FormikProps<IAmazonServerGroupCommand>;
}
export default function ServerGroupDetailsField({ formik }: DetailsFieldProps) {
  const { values, setFieldValue, setFieldError } = formik;
  const parsed = parse(values.freeFormDetails, SUPPORTED_SHARD_DIMENSION_COUNT);

  const updateFreeformDetails = (shardsObj: ParsedShards) => {
    // have to do it here to make sure it's done before calling values.clusterChanged
    values.freeFormDetails = toFreeformDetails(shardsObj);
    setFieldValue('freeFormDetails', values.freeFormDetails);
    values.clusterChanged(values);
  };

  const errorHandler = (error: string) => setFieldError('freeFormDetails', error);
  const detailsChange = (other: string) =>
    updateFreeformDetails({
      ...parsed,
      other,
    });

  const shardValueChange = (shardIndex: number, value: string) =>
    updateFreeformDetails({
      ...parsed,
      shards: {
        ...parsed.shards,
        [`x${shardIndex}`]: value,
      },
    });

  return (
    <>
      <OtherDetailsField value={parsed.other} onChange={detailsChange} onError={errorHandler} />
      {times(SUPPORTED_SHARD_DIMENSION_COUNT).map(index => (
        <ShardField
          shardIndex={index + 1}
          key={index}
          value={parsed.shards?.[`x${index + 1}`] ?? ''}
          onChange={shardValueChange}
          onError={errorHandler}
        />
      ))}
    </>
  );
}
