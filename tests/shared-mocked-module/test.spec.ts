import { MockBuilder, MockComponent, MockRender, ngMocks } from 'ng-mocks';

import { MyComponent, TargetComponent } from './fixtures.components';
import { TargetModule } from './fixtures.modules';

describe('SharedMockedModule:real', () => {
  beforeEach(() => MockBuilder(TargetModule));

  it('should render', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture).toBeDefined();
    const content = fixture.debugElement.nativeElement.innerHTML;
    expect(content).toContain(
      '<child-1-component>child:1 <my-component>real content</my-component></child-1-component>'
    );
    expect(content).toContain(
      '<child-2-component>child:2 <my-component>real content</my-component></child-2-component>'
    );
  });
});

describe('SharedMockedModule:mock', () => {
  beforeEach(async done => {
    await MockBuilder(TargetComponent).keep(TargetModule).mock(MyComponent);
    done();
  });

  // The expectation is to verify that only MyComponent was mocked, even it was deeply nested.
  it('should render', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture).toBeDefined();
    const content = fixture.debugElement.nativeElement.innerHTML;
    const component = ngMocks.find(fixture.debugElement, MockComponent(MyComponent)).componentInstance;
    expect(component).toBeDefined();
    expect(content).toContain('<child-1-component>child:1 <my-component></my-component></child-1-component>');
    expect(content).toContain('<child-2-component>child:2 <my-component></my-component></child-2-component>');
  });
});
