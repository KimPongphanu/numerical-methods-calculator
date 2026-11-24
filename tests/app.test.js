import { describe, it, expect, afterEach, vi } from 'vitest';
import App from '@/App.vue';
import NavChapter from '@/components/navChapter.vue';
import { chapters, methods } from '@/data/methods.js';
import { createContext } from './helpers.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('bundled frontend data', () => {
  it('contains the five chapters', () => {
    expect(chapters).toEqual([
      { id: 1, chapter: 'Root Of Equation' },
      { id: 2, chapter: 'Linear Algebra' },
      { id: 3, chapter: 'InterPolation' },
      { id: 4, chapter: 'Least Square Regression' },
      { id: 5, chapter: 'Intergration' },
    ]);
  });

  it('contains all 27 methods grouped by chapter', () => {
    expect(methods).toHaveLength(27);

    const countsByChapter = methods.reduce((counts, item) => {
      counts[item.chapter] = (counts[item.chapter] || 0) + 1;
      return counts;
    }, {});

    expect(countsByChapter).toEqual({ 1: 5, 2: 9, 3: 3, 4: 3, 5: 7 });
    expect(methods[0]).toEqual({ method: 'Bisection Method', chapter: 1 });
    expect(methods.at(-1)).toEqual({ method: 'Gauss Quadrature', chapter: 5 });
  });
});

describe('App.vue data loading', () => {
  it('created distributes the bundled methods into chapter buckets', () => {
    const ctx = createContext(App);
    App.created.call(ctx);

    expect(ctx.methodC1).toHaveLength(5);
    expect(ctx.methodC2).toHaveLength(9);
    expect(ctx.methodC3).toHaveLength(3);
    expect(ctx.methodC4).toHaveLength(3);
    expect(ctx.methodC5).toHaveLength(7);
    expect(ctx.methodC1[0].method).toBe('Bisection Method');
    expect(ctx.methodC5.at(-1).method).toBe('Gauss Quadrature');
    expect(ctx.chapterLists[0]).toBe(ctx.methodC1);
  });
});

describe('App.vue methods', () => {
  it('handleChapterSelected stores the chapter index and resets the method menu', () => {
    const ctx = createContext(App, {
      CurrentdropdownMenu: 4,
      solution: 'old value',
    });

    App.methods.handleChapterSelected.call(ctx, 3);

    expect(ctx.selectedChapterIndex).toBe(3);
    expect(ctx.CurrentdropdownMenu).toBe(0);
    expect(ctx.solution).toBeNull();
  });

  it('handleChapterArray stores the chapter array', () => {
    const ctx = createContext(App);
    const chapterList = [{ id: 1, chapter: 'Root Of Equation' }];
    App.methods.handleChapterArray.call(ctx, chapterList);
    expect(ctx.chaptersArray).toBe(chapterList);
  });

  it('dropdown toggles the dropdown state', () => {
    const ctx = createContext(App);
    expect(ctx.isDropdownOpen).toBe(true);
    App.methods.dropdown.call(ctx);
    expect(ctx.isDropdownOpen).toBe(false);
    App.methods.dropdown.call(ctx);
    expect(ctx.isDropdownOpen).toBe(true);
  });

  it('ClickedDropdownMenu updates the menu index and clears the solution', () => {
    const ctx = createContext(App, { solution: 'old value' });
    App.methods.ClickedDropdownMenu.call(ctx, 4);
    expect(ctx.CurrentdropdownMenu).toBe(4);
    expect(ctx.solution).toBeNull();
  });

  it('getItemStyle divides the container width equally', () => {
    const ctx = createContext(App);
    expect(App.methods.getItemStyle.call(ctx, 5)).toEqual({ width: '266px' });
    expect(App.methods.getItemStyle.call(ctx, 4)).toEqual({ width: '332.5px' });
    expect(App.methods.getItemStyle.call(ctx, 1)).toEqual({ width: '1330px' });
  });

  it('starts with five empty chapter method buckets', () => {
    const ctx = createContext(App);
    expect(ctx.methodC1).toEqual([]);
    expect(ctx.methodC2).toEqual([]);
    expect(ctx.methodC3).toEqual([]);
    expect(ctx.methodC4).toEqual([]);
    expect(ctx.methodC5).toEqual([]);
  });
});

describe('navChapter.vue', () => {
  it('created loads the bundled chapters without a backend', () => {
    const ctx = createContext(NavChapter);
    NavChapter.created.call(ctx);

    expect(ctx.chaptersDB).toBe(chapters);
    expect(ctx.chaptersDB).toHaveLength(5);
  });

  it('selection emits the selected index and the chapter list', () => {
    const chapterList = [
      { id: 1, chapter: 'Root Of Equation' },
      { id: 2, chapter: 'Linear Algebra' },
    ];
    const ctx = createContext(NavChapter, {
      chaptersDB: chapterList,
      $emit: vi.fn(),
    });

    NavChapter.methods.selection.call(ctx, 1);

    expect(ctx.select).toBe(1);
    expect(ctx.solution).toBeNull();
    expect(ctx.$emit).toHaveBeenNthCalledWith(1, 'chapter-selected', 1);
    expect(ctx.$emit).toHaveBeenNthCalledWith(2, 'chapter-array', chapterList);
  });
});
