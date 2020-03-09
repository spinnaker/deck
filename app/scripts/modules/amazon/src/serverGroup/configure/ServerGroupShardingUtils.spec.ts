import { parse, toFreeformDetails } from './ServerGroupShardingUtils';

describe('parse', () => {
  it('should return empty shards for empty string', () => {
    expect(parse('', 3)).toEqual({
      shards: { x1: '', x2: '', x3: '' },
      other: '',
    });
  });

  it('should return empty shards for strings without shard info', () => {
    expect(parse('foo-bar-baz', 3)).toEqual({
      shards: { x1: '', x2: '', x3: '' },
      other: 'foo-bar-baz',
    });
  });

  it('should return empty shards for strings not starting with x\\d', () => {
    expect(parse('foo-x1bar-baz', 3)).toEqual({
      shards: { x1: '', x2: '', x3: '' },
      other: 'foo-x1bar-baz',
    });
  });

  it('should return empty shards for shard identifiers with hyphens', () => {
    expect(parse('x1foo-bar-x2baz-other', 3)).toEqual({
      shards: { x1: '', x2: '', x3: '' },
      other: 'x1foo-bar-x2baz-other',
    });
  });

  it('should return shards for string only with shards and no other details', () => {
    expect(parse('x1foo-x2bar-x3baz', 3)).toEqual({
      shards: { x1: 'foo', x2: 'bar', x3: 'baz' },
      other: '',
    });
  });

  it('should return shards for string that begin with a hyphen', () => {
    expect(parse('-x1foo-x2bar-x3baz', 3)).toEqual({
      shards: { x1: 'foo', x2: 'bar', x3: 'baz' },
      other: '',
    });
  });

  it('should return shards and other details by ignoring shards with identifier x0', () => {
    expect(parse('x1foo-x0bar', 3)).toEqual({
      shards: { x1: 'foo', x2: '', x3: '' },
      other: 'x0bar',
    });
  });

  it('should return shards and other details by ignoring shards with identifier x0 and prepend to other', () => {
    expect(parse('x0foo-x1bar-x2baz-other', 3)).toEqual({
      shards: { x1: 'bar', x2: 'baz', x3: '' },
      other: 'x0foo-other',
    });
  });

  it('should return shards and other details for string with shards and hyphenated other details', () => {
    expect(parse('x1foo-bar-baz', 3)).toEqual({
      shards: { x1: 'foo', x2: '', x3: '' },
      other: 'bar-baz',
    });
  });

  it('should return shards and other details for shards specified in different order', () => {
    expect(parse('x2bar-x1foo-x3baz-other', 3)).toEqual({
      shards: { x1: 'foo', x2: 'bar', x3: 'baz' },
      other: 'other',
    });
  });

  it('should return shards and other details for shards with optional identifiers', () => {
    expect(parse('x1foo-x3baz-long-other', 3)).toEqual({
      shards: { x1: 'foo', x2: '', x3: 'baz' },
      other: 'long-other',
    });
  });

  it('should return shards and other details for shards that exceed the specified dimensions', () => {
    expect(parse('x1foo-x2bar-x3baz-x4qux-long-other', 3)).toEqual({
      shards: { x1: 'foo', x2: 'bar', x3: 'baz' },
      other: 'x4qux-long-other',
    });
  });
});

describe('toFreeformDetails', () => {
  it('should return empty string', () => {
    expect(
      toFreeformDetails({
        shards: {},
        other: '',
      }),
    ).toBe('');
  });

  it('should return other details when no shards are present', () => {
    expect(
      toFreeformDetails({
        shards: {},
        other: 'foo-bar',
      }),
    ).toBe('foo-bar');
  });

  it('should join shards and ignore other details when not present', () => {
    expect(
      toFreeformDetails({
        shards: {
          x1: 'foo',
          x2: 'bar',
        },
        other: '',
      }),
    ).toBe('x1foo-x2bar');
  });

  it('should join the only available shard and other details', () => {
    expect(
      toFreeformDetails({
        shards: {
          x1: '',
          x2: 'bar',
        },
        other: 'other',
      }),
    ).toBe('x2bar-other');
  });

  it('should join shards and other details', () => {
    expect(
      toFreeformDetails({
        shards: {
          x1: 'foo',
          x2: 'bar',
        },
        other: 'other',
      }),
    ).toBe('x1foo-x2bar-other');
  });
});
