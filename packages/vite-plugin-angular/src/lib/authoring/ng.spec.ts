import { compileNgFile } from './ng';

const COMPONENT_CONTENT = `
<script lang="ts">
import { signal } from '@angular/core';

defineMetadata({
  exposes: [Math]
});

let test: string;

setTimeout(() => {
  test = 'test';
}, 1000)

const counter = signal(0);
const [a, b, , c = 4] = [1, 2, 3];
</script>

<template>
  <div>Component</div>
  <p>{{ counter() }}</p>
  <p>{ a }</p>
  <p>{ b }</p>
  <p>{ c }</p>
  <p>{{ test }}</p>
</template>

<style>
  div {
    color: red;
  }

  p {
    color: blue;
  }
</style>
`;

const DIRECTIVE_CONTENT = `
<script lang="ts">
import { inject, ElementRef,afterNextRender } from '@angular/core';

defineMetadata({
  selector: 'input[directive]',
})

const elRef = inject(ElementRef);

afterNextRender(() => {
  elRef.nativeElement.focus();
});

onInit(() => {
  console.log('init code');
});

effect(() => {
  console.log('just some effect');
});
</script>
`;

describe('authoring ng file', () => {
  it('should process component as ng file', () => {
    const source = compileNgFile('virtual.ng.ts', COMPONENT_CONTENT);
    expect(source).toContain('Component');
    expect(source).toMatchSnapshot();
  });

  it('should process directive as ng file', () => {
    const source = compileNgFile('virtual.ng.ts', DIRECTIVE_CONTENT);
    expect(source).toContain('Directive');
    expect(source).toMatchSnapshot();
  });

  it('should process host properties on the component template tag', () => {
    const source = compileNgFile(
      'virtual.ng.ts',
      `<template [attr.data-test]="test">Hi</template>`
    );
    expect(source).toContain('host: {"[attr.data-test]": "test"}');
    expect(source).toMatchSnapshot();
  });

  it('should process multi-line host properties on the component template tag', () => {
    const source = compileNgFile(
      'virtual.ng.ts',
      `<template
 [attr.data-test]="test"
 class="foo bar"
 >Hi</template>`
    );
    expect(source).toContain(
      'host: {"[attr.data-test]": "test", "class": "foo bar"}'
    );
    expect(source).toMatchSnapshot();
  });

  it('should ignore and warn about structural directives on the component template tag', () => {
    vi.spyOn(console, 'warn');
    const source = compileNgFile(
      'virtual.ng.ts',
      `<template *ngIf="0">Hi</template>`
    );
    expect(source).not.toContain('host:');
    expect(console.warn).toHaveBeenCalled();
    expect(source).toMatchSnapshot();
  });
});
