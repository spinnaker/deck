// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
"use strict"

import { upsertDefaults } from './UpsertDefaults';

test('Upsert adds new field and value to initial dictionary', () => {
  const initialDict = {};
  const defaultDict = {Foo: "Bar"};
  const upsertDict = upsertDefaults(initialDict, defaultDict);

  expect(Object.keys(upsertDict)).toContain("Foo");
  expect(upsertDict.Foo).toBe("Bar");
});

test('Upsert does not mutate initial dict if key:value present', () => {
  const initialDict = {Foo: "FooBar"};
  const defaultDict = {Foo: "Bar"};
  const upsertDict = upsertDefaults(initialDict, defaultDict);

  expect(Object.keys(upsertDict)).toContain("Foo");
  expect(upsertDict.Foo).toBe("FooBar");
});
