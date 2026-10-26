import React from 'react';
import { isEqualWith } from 'lodash-es';

/**
 * Custom version of isEqual to handle function comparison
 */
function isEqual(a: unknown, b: unknown): boolean {
  return isEqualWith(a, b, (x: unknown, y: unknown): boolean | undefined => {
    // Deal with the function comparison case
    if (typeof x === 'function' && typeof y === 'function') {
      return x.toString() === y.toString();
    }

    // Fallback on the method
    return undefined;
  });
}

function useDeepCompareMemoize(value: React.DependencyList): React.DependencyList | undefined {
  const ref = React.useRef<React.DependencyList>();

  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
}

/**
 * Accepts a function that contains imperative, possibly effectful code.
 *
 * This is the deepCompare version of the `React.useEffect` hooks (that is shallowed compare)
 *
 * @param effect Imperative function that can return a cleanup function
 * @param deps If present, effect will only activate if the values in the list change.
 *
 * @see https://gist.github.com/kentcdodds/fb8540a05c43faf636dd68647747b074#gistcomment-2830503
 */
export function useDeepCompareEffect(effect: React.EffectCallback, deps: React.DependencyList): void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(effect, useDeepCompareMemoize(deps));
}
