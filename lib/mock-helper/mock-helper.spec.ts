import { Component, Directive, EventEmitter, Input, Output } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { MockDirective, MockedDirective } from '../mock-directive';
import { MockRender } from '../mock-render';

import { ngMocks } from './mock-helper';

@Directive({
  exportAs: 'foo',
  selector: '[exampleDirective]',
})
export class ExampleDirective {
  @Input() exampleDirective: string;
  @Output() someOutput = new EventEmitter<boolean>();
  @Input('bah') something: string;

  performAction(s: string) {
    return this;
  }
}

@Directive({
  selector: '[exampleStructuralDirective]',
})
export class ExampleStructuralDirective {
  @Input() exampleStructuralDirective = true;
}

@Component({
  selector: 'component-a',
  template: 'body-a',
})
export class AComponent {}

@Component({
  selector: 'component-b',
  template: 'body-b',
})
export class BComponent {}

describe('MockHelper:getDirective', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MockDirective(ExampleDirective),
        MockDirective(ExampleStructuralDirective),
        AComponent,
        BComponent,
      ],
    });
  }));

  it('should return right attribute directive', () => {
    const fixture = MockRender(`
      <div exampleDirective></div>
    `);

    // Looking for original.
    const debugElement = fixture.debugElement.query(By.directive(ExampleDirective));
    const element = debugElement.injector.get(ExampleDirective);

    // Using helper.
    const elementFromHelper = ngMocks.get(fixture.debugElement.query(By.css('div')), ExampleDirective);

    // Verification.
    expect(elementFromHelper).toBe(element);
  });

  it('should return right structural directive via getDirective', () => {
    const fixture = MockRender(`
      <div id="example-structural-directive" *exampleStructuralDirective="false">hi</div>
    `);

    // we need to render mocked structural directives manually
    ngMocks
      .findInstances(fixture.debugElement, ExampleStructuralDirective)
      .forEach((item: MockedDirective<ExampleStructuralDirective>) => {
        item.__render();
      });
    fixture.detectChanges();

    // Using helper.
    const elementFromHelper = ngMocks.get(fixture.debugElement.query(By.css('div')), ExampleStructuralDirective);
    expect(elementFromHelper).toBeTruthy();
    if (!elementFromHelper) {
      return;
    }

    // Verification.
    expect(elementFromHelper.exampleStructuralDirective).toEqual(false);
  });

  it('should return right structural directive via getDirectiveOrFail', () => {
    const fixture = MockRender(`
      <div id="example-structural-directive" *exampleStructuralDirective="false">hi</div>
    `);

    // we need to render mocked structural directives manually
    ngMocks
      .findInstances(fixture.debugElement, ExampleStructuralDirective)
      .forEach((item: MockedDirective<ExampleStructuralDirective>) => {
        item.__render();
      });
    fixture.detectChanges();

    // Using helper.
    const elementFromHelper = ngMocks.get(fixture.debugElement.query(By.css('div')), ExampleStructuralDirective);

    // Verification.
    expect(elementFromHelper.exampleStructuralDirective).toEqual(false);
  });

  it('find selector: T', () => {
    const fixture = MockRender(`<component-a></component-a>`);
    const componentA = ngMocks.find(fixture.debugElement, AComponent);
    expect(componentA.componentInstance).toEqual(jasmine.any(AComponent));

    expect(() => ngMocks.find(componentA, BComponent)).toThrowError('Cannot find an element via ngMocks.find');
  });

  it('find selector: string', () => {
    const fixture = MockRender(`<component-b></component-b>`);
    const componentB = ngMocks.find(fixture.debugElement, 'component-b');
    expect(componentB.componentInstance).toEqual(jasmine.any(BComponent));

    expect(() => ngMocks.find(componentB, AComponent)).toThrowError('Cannot find an element via ngMocks.find');
  });

  it('find selector: T', () => {
    const fixture = MockRender(`<component-a></component-a>`);
    const componentA = ngMocks.find(fixture.debugElement, AComponent);
    expect(componentA.componentInstance).toEqual(jasmine.any(AComponent));

    const componentB = ngMocks.find(fixture.debugElement, BComponent, null); // tslint:disable-line:no-null-keyword
    expect(componentB).toBe(null); // tslint:disable-line:no-null-keyword
  });

  it('find selector: string', () => {
    const fixture = MockRender(`<component-b></component-b>`);
    const componentB = ngMocks.find(fixture.debugElement, 'component-b');
    expect(componentB.componentInstance).toEqual(jasmine.any(BComponent));

    const componentA = ngMocks.find(fixture.debugElement, 'component-a', null); // tslint:disable-line:no-null-keyword
    expect(componentA).toBe(null); // tslint:disable-line:no-null-keyword
  });

  it('findAll selector: T', () => {
    const fixture = MockRender(`<component-a></component-a><component-a></component-a>`);
    const componentA = ngMocks.findAll(fixture.debugElement, AComponent);
    expect(componentA.length).toBe(2);
    expect(componentA[0].componentInstance).toEqual(jasmine.any(AComponent));
    expect(componentA[1].componentInstance).toEqual(jasmine.any(AComponent));

    const componentB = ngMocks.findAll(fixture.debugElement, BComponent);
    expect(componentB.length).toBe(0);
  });

  it('findAll selector: string', () => {
    const fixture = MockRender(`<component-b></component-b><component-b></component-b>`);
    const componentB = ngMocks.findAll(fixture.debugElement, 'component-b');
    expect(componentB.length).toEqual(2);
    expect(componentB[0].componentInstance).toEqual(jasmine.any(BComponent));
    expect(componentB[0].componentInstance).toEqual(jasmine.any(BComponent));

    const componentA = ngMocks.findAll(fixture.debugElement, 'component-a');
    expect(componentA.length).toBe(0);
  });
});
