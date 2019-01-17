import {
  Validation,
  buildValidators,
  Validator,
  ArrayItemValidator,
  buildValidatorsAsync,
  IValidationBuilder,
} from './Validation';

const { isRequired, minValue, maxValue } = Validation;

const makeAsync = (syncValidator: Validator): Validator => {
  return (value, label) => {
    const result = syncValidator(value, label);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        result ? reject(result) : resolve();
      }, 1);
    });
  };
};

interface ISynchronousTestCase {
  expectation: string; // feels more like a title but jasmine calls it expectation
  values: any;
  expectedResult: any;
  builders: (builder: IValidationBuilder) => void;
}

const synchronousTestCases: ISynchronousTestCase[] = [
  {
    expectation: 'returns empty errors when validating no validators',
    values: { foo: 'bar' },
    builders: builder => {
      builder.field('foo', 'Foo').validate([]);
    },
    expectedResult: {},
  },
  {
    expectation: 'returns correct error when validating top level field',
    values: {},
    builders: builder => {
      builder.field('foo', 'Foo').validate([isRequired()]);
    },
    expectedResult: {
      foo: 'Foo is required.',
    },
  },
  {
    expectation: 'returns correct error when validating a deep field',
    values: {},
    builders: builder => {
      builder.field('foo.bar.baz', 'Foo').validate([isRequired()]);
    },
    expectedResult: {
      foo: {
        bar: {
          baz: 'Foo is required.',
        },
      },
    },
  },
  {
    expectation: 'aggregates multiple levels of errors correctly',
    values: {},
    builders: builder => {
      builder.field('foo', 'Foo').validate([isRequired()]);
      builder.field('bar.baz', 'Baz').validate([isRequired()]);
    },
    expectedResult: {
      foo: 'Foo is required.',
      bar: {
        baz: 'Baz is required.',
      },
    },
  },
  {
    expectation: 'validates arrays and aggregates them correctly',
    values: {
      lotsastuff: [1, 2, 3, 4, 5],
    },
    builders: builder => {
      const arrayNotEmpty: Validator = (array, label) => array.length < 1 && `${label} must have at least 1 item.`;
      const { arrayForEach } = builder;

      builder.field('lotsastuff', 'Array').validate([
        isRequired(),
        arrayNotEmpty,
        arrayForEach(itemBuilder => {
          itemBuilder.item('Item').validate([isRequired(), maxValue(3)]);
        }),
      ]);
    },
    expectedResult: {
      lotsastuff: [undefined, undefined, undefined, 'Item cannot be greater than 3', 'Item cannot be greater than 3'],
    },
  },
  {
    expectation: 'validates keys on array items and aggregates errors into resulting arrays correctly',
    values: {
      lotsastuff: [{ key: 1 }, { value: 2 }, 3, 4, 5],
    },
    builders: builder => {
      const { arrayForEach } = builder;
      builder.field('lotsastuff', 'Array').validate([
        (array, label) => array.length < 1 && `${label} must have at least 1 item.`,
        arrayForEach(itemBuilder => {
          itemBuilder.field(`key`, `Item Key`).validate([isRequired()]);
          itemBuilder.field(`value`, `Item Value`).validate([isRequired()]);
        }),
      ]);
    },
    expectedResult: {
      lotsastuff: [
        { value: 'Item Value is required.' },
        { key: 'Item Key is required.' },
        { key: 'Item Key is required.', value: 'Item Value is required.' },
        { key: 'Item Key is required.', value: 'Item Value is required.' },
        { key: 'Item Key is required.', value: 'Item Value is required.' },
      ],
    },
  },
  {
    expectation: 'validates crazy complicated arrays of objects with arrays of objects',
    values: {
      letsgetcrazy: [
        {},
        {
          key: 'array',
          data: [
            { all: 1, of: 2, the: 3, things: 4 },
            { all: '', of: 2, the: 3, things: 4 },
            { all: 1, of: '', the: 3, things: 4 },
            { all: 1, of: 2, the: '', things: 4 },
            { all: 1, of: 2, the: 3, things: '' },
            {},
          ],
        },
        {
          key: 'nothotdog',
          data: { foo: 'bar' },
        },
      ],
    },
    builders: builder => {
      const isArray: Validator = (array, label) => !Array.isArray(array) && `${label} must be an array.`;
      const allOfTheThingsValidator: ArrayItemValidator = itemBuilder => {
        itemBuilder.field(`all`, 'All').validate([isRequired()]);
        itemBuilder.field(`of`, 'Of').validate([isRequired()]);
        itemBuilder.field(`the`, 'The').validate([isRequired()]);
        itemBuilder.field(`things`, 'Things').validate([isRequired()]);
      };

      const outerArrayItemValidator: ArrayItemValidator = itemBuilder => {
        itemBuilder.field('key', 'Item key').validate([isRequired()]);
        itemBuilder.field('data', 'Item data').validate([isRequired(), isArray, arrayForEach(allOfTheThingsValidator)]);
      };

      const { arrayForEach } = builder;
      builder.field('letsgetcrazy', 'Outer array').validate([arrayForEach(outerArrayItemValidator)]);
    },
    expectedResult: {
      letsgetcrazy: [
        { key: 'Item key is required.', data: 'Item data is required.' },
        {
          data: [
            undefined,
            { all: 'All is required.' },
            { of: 'Of is required.' },
            { the: 'The is required.' },
            { things: 'Things is required.' },
            {
              all: 'All is required.',
              of: 'Of is required.',
              the: 'The is required.',
              things: 'Things is required.',
            },
          ],
        },
        { data: 'Item data must be an array.' },
      ],
    },
  },
];

fdescribe('Synchronous validation', () => {
  synchronousTestCases.forEach(testCase => {
    it(testCase.expectation, () => {
      const builder = buildValidators(testCase.values);
      testCase.builders(builder);
      const result = builder.result();
      expect(result).toEqual(testCase.expectedResult);
    });
  });
});

fdescribe('Asynchronous validation of synchronous validators', () => {
  synchronousTestCases.forEach(testCase => {
    const hasErrors = Object.keys(testCase.expectedResult).length;
    it(`${testCase.expectation} - should also work with async`, done => {
      const builder = buildValidatorsAsync(testCase.values);
      testCase.builders(builder);
      if (hasErrors) {
        builder.result().catch((errors: any) => {
          expect(errors).toEqual(testCase.expectedResult);
          done();
        });
      } else {
        builder.result().then((errors: any) => {
          expect(errors).toEqual(testCase.expectedResult);
          done();
        });
      }
    });
  });
});

fdescribe('Asynchronous simple validation', () => {
  it('Validate nothing', done => {
    const values = { foo: 'bar' };

    const builder = buildValidatorsAsync(values);
    builder.field('foo', 'Foo').validate([]);

    builder.result().then((result: any) => {
      expect(result).toEqual({});
      done();
    });
  });

  it('Validate mixed sync/async', done => {
    const values = { bar: 1, baz: 2 };

    const builder = buildValidatorsAsync(values);
    builder.field('foo', 'Foo').validate([isRequired()]);
    builder.field('bar', 'Bar').validate([makeAsync(isRequired()), minValue(2)]);
    builder.field('baz', 'Baz').validate([isRequired(), makeAsync(maxValue(1))]);

    builder.result().catch((result: any) => {
      expect(result).toEqual({
        foo: 'Foo is required.',
        bar: 'Bar cannot be less than 2',
        baz: 'Baz cannot be greater than 1',
      });
      done();
    });
  });
});

fdescribe('Asynchronous array validation', () => {
  it('Simple array validation', done => {
    const values = {
      lotsastuff: [1, 2, 3, 4, 5],
    };
    const builder = buildValidators(values, true);
    const { arrayForEach } = builder;

    builder.field('lotsastuff', 'Array').validate([
      makeAsync(isRequired()),
      arrayForEach(itemBuilder => {
        itemBuilder.item('Item').validate([makeAsync(isRequired()), makeAsync(maxValue(3))]);
      }),
    ]);

    builder.result().catch((result: any) => {
      expect(result).toEqual({
        lotsastuff: [undefined, undefined, undefined, 'Item cannot be greater than 3', 'Item cannot be greater than 3'],
      });
      done();
    });
  });
});

fdescribe('Errors', () => {
  it('Sneaking a promise into synchronous validation', () => {
    const values = { foo: 'bar' };

    const builder = buildValidators(values);

    expect(() => {
      builder.field('foo', 'Foo').validate([isRequired(), () => Promise.resolve(undefined)]);
    }).toThrowError(
      Error,
      'Synchronous validator cannot return a Promise (while validating foo). Use buildValidatorsAsync(values) instead.',
    );
    expect(() => {
      builder.field('bar', 'Bar').validate([() => Promise.reject('Bars should be awesome.')]);
    }).toThrowError(
      Error,
      'Synchronous validator cannot return a Promise (while validating bar). Use buildValidatorsAsync(values) instead.',
    );
  });

  it('Made one too many promises', done => {
    const values = {
      lotsastuff: [1, 2, 3, 4, 5],
    };
    const builder = buildValidators(values, true);
    const { arrayForEach } = builder;

    builder.field('lotsastuff', 'Array').validate([
      makeAsync(isRequired()),
      makeAsync(
        arrayForEach(itemBuilder => {
          itemBuilder.item('Item').validate([makeAsync(isRequired()), makeAsync(maxValue(3))]);
        }),
      ),
    ]);

    builder.result().catch((error: any) => {
      expect(error).toEqual(
        new Error(
          'Warning: caught nested Promise while validating lotsastuff. Async Validators should only be rejecting undefined or string, not Promises.',
        ),
      );
      done();
    });
  });
});
