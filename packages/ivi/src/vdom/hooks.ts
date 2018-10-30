import { Component } from "./component";
import { getContext } from "./context";
import { dirtyCheckCounter } from "./scheduler";

function addHook<T extends Function>(hooks: null | T | T[], hook: T): T | T[] {
  if (hooks === null) {
    return hook;
  }
  if (typeof hooks === "function") {
    return [hooks, hook];
  }
  hooks.push(hook);
  return hooks;
}

/**
 * useSelect creates a selector hook.
 *
 * @example
 *
 *     const C = component<number>((h) => {
 *       const selector = useSelect<string, number, { data: string[] }>((prev, id, context) => context.data[id]);
 *
 *       return (id) => div().t(selector(id));
 *     });
 *
 * @param c - ComponentHandle.
 * @param selector - Selector function.
 * @returns Selector hook.
 */
export function useSelect<T>(
  c: Component,
  selector: (prev: T | undefined) => T,
): () => T;

/**
 * useSelect creates a selector hook.
 *
 * @example
 *
 *     const C = component<number>((h) => {
 *       const selector = useSelect<string, number, { data: string[] }>((prev, id, context) => context.data[id]);
 *
 *       return (id) => div().t(selector(id));
 *     });
 *
 * @param c - ComponentHandle.
 * @param selector - Selector function.
 * @returns Selector hook.
 */
export function useSelect<T, P>(
  c: Component,
  selector: undefined extends P ? (prev: T | undefined, props?: P) => T : (prev: T | null, props: P) => T,
  shouldUpdate?: undefined extends P ? undefined : (prev: P, next: P) => boolean,
): undefined extends P ? () => T : (props: P) => T;

/**
 * useSelect creates a selector hook.
 *
 * @example
 *
 *     const C = component<number>((h) => {
 *       const selector = useSelect<string, number, { data: string[] }>((prev, id, context) => context.data[id]);
 *
 *       return (id) => div().t(selector(id));
 *     });
 *
 * @param c - ComponentHandle.
 * @param selector - Selector function.
 * @returns Selector hook.
 */
export function useSelect<T, P, C>(
  c: Component,
  selector: (prev: T | undefined, props: P, context: C) => T,
  shouldUpdate?: undefined extends P ? undefined : (prev: P, next: P) => boolean,
): undefined extends P ? () => T : (props: P) => T;

/**
 * useSelect creates a selector hook.
 *
 * @example
 *
 *     const C = component<number>((c) => {
 *       const selector = useSelect<string, number, { data: string[] }>(c, (prev, id, context) => context.data[id]);
 *
 *       return (id) => div().t(selector(id));
 *     });
 *
 * @param c - ComponentHandle.
 * @param selector - Selector function.
 * @returns Selector hook.
 */
export function useSelect<T, P, C extends {}>(
  c: Component,
  selector: (prev: T | undefined, props: P, context: C) => T,
  shouldUpdate?: (prev: P, next: P) => boolean,
): (props: P) => T {
  const prevSelector = c.select;
  let lastChecked = 0;
  let prevState: T;
  let prevProps: P;

  c.select = (context: {}) => {
    if (prevSelector !== null) {
      if (prevSelector(context) === true) {
        return true;
      }
    }
    if (prevState !== void 0) {
      const nextState = selector(prevState, prevProps, context as C);
      lastChecked = dirtyCheckCounter();
      if (prevState !== nextState) {
        prevState = nextState;
        return true;
      }
    }
    return false;
  };

  return (nextProps: P) => {
    if (
      lastChecked < dirtyCheckCounter() ||
      (shouldUpdate !== void 0 && shouldUpdate(prevProps, nextProps) === true) ||
      prevProps !== nextProps
    ) {
      prevState = selector(prevState, nextProps, getContext() as C);
    }
    prevProps = nextProps;
    return prevState;
  };
}

/**
 * useDetached creates a detached hook.
 *
 * @example
 *
 *     const C = component((h) => {
 *       useDetached(h, () => {
 *         console.log("detached");
 *       });
 *
 *       return () => div();
 *     });
 *
 * @param c - ComponentHandle.
 * @param hook - Detached hook.
 */
export function useDetached(c: Component, hook: () => void): void {
  c.detached = addHook(c.detached, hook);
}

const INIT_SENTINEL = {};

export function useEffect<P>(
  c: Component,
  hook: (props: P) => (() => void) | void,
  shouldUpdate?: (prev: P, next: P) => boolean,
): (props: P) => void {
  let reset: (() => void) | void;
  let prevProps: P | undefined = INIT_SENTINEL as P;
  let detached = false;

  return (nextProps: P) => {
    if (
      prevProps === INIT_SENTINEL ||
      (shouldUpdate !== void 0 && shouldUpdate(prevProps as P, nextProps) === true) ||
      prevProps !== nextProps
    ) {
      prevProps = nextProps;
      if (reset !== void 0) {
        reset();
      }
      reset = hook(nextProps);

      if (reset !== void 0 && !detached) {
        detached = true;
        useDetached(c, () => {
          if (reset !== void 0) {
            reset();
          }
        });
      }
    }
  };
}
