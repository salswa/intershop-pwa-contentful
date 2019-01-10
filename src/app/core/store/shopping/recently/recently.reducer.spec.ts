import { AddToRecently, ClearRecently, RecentlyAction } from './recently.actions';
import { initialState, recentlyReducer } from './recently.reducer';

describe('Recently Reducer', () => {
  it('should return initial state when falsy state is reduced', () => {
    expect(recentlyReducer(undefined, {} as RecentlyAction)).toEqual(initialState);
  });

  it('should return previous state when unknown action is reduced', () => {
    const state = { ...initialState, products: ['A'] };
    expect(recentlyReducer(state, {} as RecentlyAction)).toEqual(state);
  });

  it('should add products when AddToRecently is reduced', () => {
    const result = recentlyReducer(initialState, new AddToRecently({ sku: 'A' }));
    expect(result.products).toEqual(['A']);
  });

  it('should remove duplicates when when AddToRecently is reduced', () => {
    let result = recentlyReducer(initialState, new AddToRecently({ sku: 'A' }));
    result = recentlyReducer(result, new AddToRecently({ sku: 'A' }));
    result = recentlyReducer(result, new AddToRecently({ sku: 'A' }));
    result = recentlyReducer(result, new AddToRecently({ sku: 'B' }));
    result = recentlyReducer(result, new AddToRecently({ sku: 'B' }));
    result = recentlyReducer(result, new AddToRecently({ sku: 'A' }));
    result = recentlyReducer(result, new AddToRecently({ sku: 'A' }));
    expect(result.products).toEqual(['A', 'B']);
  });

  it('should clear state when ClearRecently is reduced', () => {
    const state = { ...initialState, products: ['A'] };
    expect(recentlyReducer(state, new ClearRecently())).toEqual(initialState);
  });
});
