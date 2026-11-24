import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { createRequire } from 'node:module';
import App from '@/App.vue';
import NavChapter from '@/components/navChapter.vue';
import { createContext, mockAlert } from './helpers.js';

const require = createRequire(import.meta.url);
const backendApp = require('../backEnd/server.js');

afterEach(() => {
  vi.unstubAllGlobals();
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
    const chapters = [{ id: 1, chapter: 'Root Of Equation' }];
    App.methods.handleChapterArray.call(ctx, chapters);
    expect(ctx.chaptersArray).toBe(chapters);
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

  it('starts with five chapter method buckets', () => {
    const ctx = createContext(App);
    expect(ctx.methodC1).toEqual([]);
    expect(ctx.methodC2).toEqual([]);
    expect(ctx.methodC3).toEqual([]);
    expect(ctx.methodC4).toEqual([]);
    expect(ctx.methodC5).toEqual([]);
  });
});

describe('navChapter.vue selection', () => {
  beforeEach(() => {
    mockAlert();
  });

  it('emits the selected index and the chapter list', () => {
    const chapters = [
      { id: 1, chapter: 'Root Of Equation' },
      { id: 2, chapter: 'Linear Algebra' },
    ];
    const ctx = createContext(NavChapter, {
      chaptersDB: chapters,
      $emit: vi.fn(),
    });

    NavChapter.methods.selection.call(ctx, 1);

    expect(ctx.select).toBe(1);
    expect(ctx.solution).toBeNull();
    expect(ctx.$emit).toHaveBeenNthCalledWith(1, 'chapter-selected', 1);
    expect(ctx.$emit).toHaveBeenNthCalledWith(2, 'chapter-array', chapters);
  });
});

describe('backEnd/server.js API', () => {
  let server;
  let baseUrl;

  beforeAll(async () => {
    await new Promise((resolve) => {
      server = backendApp.listen(0, resolve);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  afterAll(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it('GET /api/chapters returns the five chapters from the JSON store', async () => {
    const response = await fetch(`${baseUrl}/api/chapters`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(body).toEqual([
      { id: 1, chapter: 'Root Of Equation' },
      { id: 2, chapter: 'Linear Algebra' },
      { id: 3, chapter: 'InterPolation' },
      { id: 4, chapter: 'Least Square Regression' },
      { id: 5, chapter: 'Intergration' },
    ]);
  });

  it('GET /api/methods returns all 27 methods grouped by chapter', async () => {
    const response = await fetch(`${baseUrl}/api/methods`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(27);
    expect(body[0]).toEqual({ method: 'Bisection Method', chapter: 1 });
    expect(body.at(-1)).toEqual({ method: 'Gauss Quadrature', chapter: 5 });

    const countsByChapter = body.reduce((counts, item) => {
      counts[item.chapter] = (counts[item.chapter] || 0) + 1;
      return counts;
    }, {});

    expect(countsByChapter).toEqual({ 1: 5, 2: 9, 3: 3, 4: 3, 5: 7 });
    expect(body.every((item) => typeof item.method === 'string' && item.method.length > 0)).toBe(true);
  });

  it('returns 404 for an unknown route', async () => {
    const response = await fetch(`${baseUrl}/api/unknown`);
    expect(response.status).toBe(404);
  });
});
