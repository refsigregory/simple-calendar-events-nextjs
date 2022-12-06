import {describe, expect, test} from '@jest/globals';
import generateDays from "./generateDaysArray";

describe('Generate Date', () => {
  test('1 week schedule with same time', () => {
    const exampleDate: number[] = [202001011000, 202001021000, 202001031000, 202001041000, 202001051000, 202001061000, 202001071000];
    const resultTest: number[] = generateDays(202001011000, 202001071000);
    expect(resultTest.toString()).toBe(exampleDate.toString());
  });


  test('1 week schedule with different time', () => {
    const exampleDate: number[] = [];
    const resultTest: number[] = generateDays(202001011000, 202001071200);
    expect(resultTest.toString()).toBe(exampleDate.toString());
  });


  test('1 week schedule with reverse schedule', () => {
    const exampleDate: number[] = [];
    const resultTest: number[] = generateDays(202001071000, 202001011000);
    expect(resultTest.toString()).toBe(exampleDate.toString());
  });

  test('3 day schedule', () => {
    const exampleDate: number[] = [202001011000, 202001021000, 202001031000];
    const resultTest: number[] = generateDays(202001011000, 202001031000);
    expect(resultTest.toString()).toBe(exampleDate.toString());
  });


  test('2 day schedule', () => {
    const exampleDate: number[] = [202001011000, 202001021000, ];
    const resultTest: number[] = generateDays(202001011000, 202001021000);
    expect(resultTest.toString()).toBe(exampleDate.toString());
  });

  test('same day and time schedule', () => {
    const exampleDate: number[] = [202001011000 ];
    const resultTest: number[] = generateDays(202001011000, 202001011000);
    expect(resultTest.toString()).toBe(exampleDate.toString());
  });

  test('same day and diff time schedule', () => {
    const exampleDate: number[] = [202001011000, 202001011200 ];
    const resultTest: number[] = generateDays(202001011000, 202001011200);
    expect(resultTest.toString()).toBe(exampleDate.toString());
  });
});