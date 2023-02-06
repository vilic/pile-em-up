import {computed, makeObservable} from 'mobx';

import {createMergedObjectProxy} from '../@utils';
import type {RouteEntry, Route__} from '../route';

import type {IViewEntry, ViewEntry} from './view-entry';

abstract class View<TRoute extends Route__> {
  private _mergedEntryMap = new WeakMap<
    IViewEntry<TRoute>,
    ViewEntry<TRoute>
  >();

  constructor(readonly $routes: TRoute[]) {
    makeObservable(this);
  }

  /** @internal */
  abstract get _entries(): IViewEntry<TRoute>[];

  get $entries(): ViewEntry<TRoute>[] {
    const mergedEntryMap = this._mergedEntryMap;

    return this._entries.map(entry => {
      let mergedEntry = mergedEntryMap.get(entry);

      if (mergedEntry) {
        return mergedEntry;
      }

      mergedEntry = createMergedObjectProxy([
        entry,
        entry._match.entry.mergedState,
      ]) as ViewEntry<TRoute>;

      mergedEntryMap.set(entry, mergedEntry);

      return mergedEntry;
    });
  }

  /** @internal */
  @computed
  get _matches(): ViewRouteMatch<TRoute>[] {
    return this.$routes
      .flatMap((route): (ViewRouteMatch<TRoute> | undefined)[] => {
        const active = route._active;
        const transition = route._transition;

        return [
          active && {route, entry: active},
          transition && {route, entry: transition},
        ];
      })
      .filter((match): match is ViewRouteMatch<TRoute> => match !== undefined);
  }
}

export const AbstractView = View;

export type IView<TRoute extends Route__> = View<TRoute>;

export type IView__ = IView<Route__>;

export interface ViewRouteMatch<TRoute extends Route__> {
  route: TRoute;
  entry: RouteEntry;
}

export type ViewRouteMatch__ = ViewRouteMatch<Route__>;
