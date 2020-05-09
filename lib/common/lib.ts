import { InjectionToken, ModuleWithProviders, PipeTransform, Type } from '@angular/core';
import { getTestBed } from '@angular/core/testing';

import { MockedComponent } from '../mock-component';
import { MockedDirective } from '../mock-directive';
import { MockedModule } from '../mock-module';
import { MockedPipe } from '../mock-pipe';

import { ngMocksUniverse } from './ng-mocks-universe';
import { jitReflector } from './reflect';

export const NG_MOCKS = new InjectionToken<Map<any, any>>('NG_MOCKS');

/**
 * Can be changed any time.
 *
 * @internal
 */
export const getNgMocksFromTestBed = (): Map<any, any> | undefined => {
  const testBed: any = getTestBed();
  try {
    return testBed.inject ? testBed.inject(NG_MOCKS) : testBed.get(NG_MOCKS);
  } catch (e) {
    return undefined;
  }
};

export const flatten = <T>(values: T | T[], result: T[] = []): T[] => {
  if (Array.isArray(values)) {
    values.forEach((value: T | T[]) => flatten(value, result));
  } else {
    result.push(values);
  }
  return result;
};

export const isNgType = (object: Type<any>, type: string): boolean =>
  jitReflector.annotations(object).some(annotation => annotation.ngMetadataName === type);

/**
 * Checks whether a class was decorated by a ng type.
 * m - module.
 * c - component.
 * d - directive.
 * p - pipe.
 */
export function isNgDef(object: any, ngType: 'm' | 'c' | 'd'): object is Type<any>;
export function isNgDef(object: any, ngType: 'p'): object is Type<PipeTransform>;
export function isNgDef(object: any, ngType: string): object is Type<any> {
  if (ngType === 'm') {
    return isNgType(object, 'NgModule');
  }
  if (ngType === 'c') {
    return isNgType(object, 'Component');
  }
  if (ngType === 'd') {
    return isNgType(object, 'Directive');
  }
  if (ngType === 'p') {
    return isNgType(object, 'Pipe');
  }
  return false;
}

/**
 * Checks whether a class is a mock of a class that was decorated by a ng type.
 * m - module.
 * c - component.
 * d - directive.
 * p - pipe.
 */
export function isMockedNgDefOf<T>(object: any, type: Type<T>, ngType: 'm'): object is Type<MockedModule<T>>;
export function isMockedNgDefOf<T>(object: any, type: Type<T>, ngType: 'c'): object is Type<MockedComponent<T>>;
export function isMockedNgDefOf<T>(object: any, type: Type<T>, ngType: 'd'): object is Type<MockedDirective<T>>;
export function isMockedNgDefOf<T extends PipeTransform>(
  object: any,
  type: Type<T>,
  ngType: 'p'
): object is Type<MockedPipe<T>>;
export function isMockedNgDefOf<T>(object: any, type: Type<T>): object is Type<T>;
export function isMockedNgDefOf<T>(object: any, type: Type<T>, ngType?: any): object is Type<T> {
  return typeof object === 'function' && object.mockOf === type && (ngType ? isNgDef(object, ngType) : true);
}

export const isNgInjectionToken = (object: any): object is InjectionToken<any> =>
  typeof object === 'object' && object.ngMetadataName === 'InjectionToken';

// Checks if an object implements ModuleWithProviders.
export const isNgModuleDefWithProviders = (object: any): object is ModuleWithProviders =>
  object.ngModule !== undefined && isNgDef(object.ngModule, 'm');

/**
 * Checks whether an object is an instance of a mocked class that was decorated by a ng type.
 * m - module.
 * c - component.
 * d - directive.
 * p - pipe.
 */
export function isMockOf<T>(object: any, type: Type<T>, ngType: 'm'): object is MockedModule<T>;
export function isMockOf<T>(object: any, type: Type<T>, ngType: 'c'): object is MockedComponent<T>;
export function isMockOf<T>(object: any, type: Type<T>, ngType: 'd'): object is MockedDirective<T>;
export function isMockOf<T extends PipeTransform>(object: any, type: Type<T>, ngType: 'p'): object is MockedPipe<T>;
export function isMockOf<T>(object: any, type: Type<T>): object is T;
export function isMockOf<T>(object: any, type: Type<T>, ngType?: any): object is T {
  return (
    typeof object === 'object' &&
    (ngType ? isMockedNgDefOf(object.constructor, type, ngType) : isMockedNgDefOf(object.constructor, type))
  );
}

/**
 * Returns a def of a mocked class based on another mock class or a source class that was decorated by a ng type.
 * m - module.
 * c - component.
 * d - directive.
 * p - pipe.
 */
export function getMockedNgDefOf<T>(type: Type<T>, ngType: 'm'): Type<MockedModule<T>>;
export function getMockedNgDefOf<T>(type: Type<T>, ngType: 'c'): Type<MockedComponent<T>>;
export function getMockedNgDefOf<T>(type: Type<T>, ngType: 'd'): Type<MockedDirective<T>>;
export function getMockedNgDefOf<T>(type: Type<T>, ngType: 'p'): Type<MockedPipe<T>>;
export function getMockedNgDefOf(type: Type<any>): Type<any>;
export function getMockedNgDefOf(type: any, ngType?: any): any {
  const source = type.mockOf ? type.mockOf : type;
  const mocks = getNgMocksFromTestBed();

  let mock: any;

  // If mocks exists, we are in the MockBuilder env and it's enough for the check.
  if (mocks && mocks.has(source)) {
    mock = mocks.get(source);
  } else if (mocks) {
    throw new Error(`There is no mock for ${source.name}`);
  }

  // If we are not in the MockBuilder env we can rely on the current cache.
  if (!mock && source !== type) {
    mock = type;
  } else if (!mock && ngMocksUniverse.cache.has(source)) {
    mock = ngMocksUniverse.cache.get(source);
  }

  if (!ngType) {
    return mock;
  }
  if (ngType && isMockedNgDefOf(mock, type, ngType)) {
    return mock;
  }

  // Looks like the def hasn't been mocked.
  throw new Error(`There is no mock for ${source.name}`);
}
