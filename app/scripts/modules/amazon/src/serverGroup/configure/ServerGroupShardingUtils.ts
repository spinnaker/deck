import { chain, isEmpty, partition, sortBy, times, toPairs } from 'lodash';

export interface ParsedShards {
  shards: { [shardIndex: string]: string };
  other: string;
}

function createEmpty(dimensions: number, other = ''): ParsedShards {
  const result: ParsedShards = { shards: {}, other };
  times(dimensions).forEach(index => (result.shards[`x${index + 1}`] = ''));

  return result;
}

/**
 * Given a free form details string, this function parses, validates and returns the shards along with remaining
 * detail string. This function also accepts a `dimension` param that restricts the number of accepted shard
 * identifiers.
 *
 * freeFormDetails = 'x1Shard1-x2Shard2-x3Shard3-Other', dimensions = 3
 * Returns: {shards: {x1: 'Shard1', x2: 'Shard2', x3: 'Shard3'}, other: 'Other'}
 *
 * freeFormDetails = 'x2Shard2-x1Shard1-x3Shard3-Other', dimensions = 2
 * Returns: {shards: {x1: 'Shard1', x2: 'Shard2'}, other: 'x3Shard3-Other'}
 */
export function parse(freeFormDetails: string, dimensions = 2): ParsedShards {
  // Valid shard strings must begin with x\d or -x\d.
  if (!freeFormDetails.match(/^-?x\d/)) {
    return createEmpty(dimensions, freeFormDetails);
  }

  // Prepend with a '-' and split it so that potentialShards look like the following
  // [ "" or "-", "1", "Shard1", "2", "Shard2", "3", "Shard3-Other"].
  const potentialShards = `-${freeFormDetails}`.split(/-x(\d)/);

  // Remove the empty first entry.
  potentialShards.shift();

  let shards: Array<[number, string]> = [];
  let other = '';
  let i = 0;

  // By the end of this loop, we're trying to group the pairs of shard index and shard identifier so that `shards`
  // looks like [[1, 'Shard1'], [2, 'Shard2'], [3, 'Shard3']] and `other` looks like 'Other'.
  while (i < potentialShards.length) {
    // NOTE: Due to how the regular expression is set up, we are guaranteed to have an even number of entries
    // in potentialShards.

    if (i === potentialShards.length - 2 && potentialShards[i + 1].match(/-/)) {
      // The last shard entry can potentially contain 'other' details separated by a hyphen. If that is the case, then
      // they need to be split.
      const splitIndex = potentialShards[i + 1].indexOf('-');
      shards.push([parseInt(potentialShards[i]), potentialShards[i + 1].substring(0, splitIndex)]);
      other = potentialShards[i + 1].substring(splitIndex + 1);
    } else if (potentialShards[i + 1].indexOf('-') > -1) {
      // If there are hyphens within a shard identifier, then it is an invalid format and stop processing further.
      return createEmpty(3, freeFormDetails);
    } else {
      shards.push([parseInt(potentialShards[i]), potentialShards[i + 1]]);
    }
    i = i + 2;
  }

  // It is possible for the shards to be not listed in order, so sort them here.
  shards = sortBy(shards, entry => entry[0]);

  // In the following lines, we are restricting the number of shards to the dimensions param and finally constructing
  // the output in the desired format.
  return partition(
    shards,
    // Partition the list such that shard indices lesser than the `dimensions` value are included in the
    // first partition and rest in the second.
    // NOTE: 0 isn't an accepted shard index, so we're filtering out that as well.
    entry => entry[0] !== 0 && entry[0] <= dimensions,
  ).reduce((acc: ParsedShards, entries: Array<[number, string]>, index: number) => {
    if (index === 0) {
      // These are the shard entries within the accepted dimensions, so add them to `shards` property.
      entries.forEach(entry => {
        acc.shards[`x${entry[0]}`] = entry[1];
      });
    } else {
      // These are the shard entries that go beyond the accepted dimensions, so combine them and set in `other`
      // property.
      const other = !isEmpty(entries)
        ? chain(entries)
            .map(entry => `x${entry[0]}${entry[1]}`)
            .flatMap()
            .join('-')
        : null;

      if (other) {
        acc.other = !isEmpty(acc.other) ? `${other}-${acc.other}` : `${other}`;
      }
    }
    return acc;
  }, createEmpty(dimensions, other));
}

export function toFreeformDetails(shardObj: ParsedShards): string {
  const shardString = toPairs(shardObj.shards)
    .filter(([_, identifier]) => !isEmpty(identifier))
    .map(([index, identifier]) => `${index}${identifier}`)
    .join('-');

  return isEmpty(shardString)
    ? shardObj.other
    : isEmpty(shardObj.other)
    ? shardString
    : `${shardString}-${shardObj.other}`;
}
