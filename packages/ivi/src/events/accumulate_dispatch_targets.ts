import { DispatchTarget } from "./dispatch_target";
import { EventHandler } from "./event_handler";
import { VNodeFlags } from "../vdom/flags";
import { VNode } from "../vdom/vnode";
import { ROOTS } from "../vdom/root";

/**
 * accumulateDispatchTargets traverses the DOM tree from the `target` Element to the document top and accumulates
 * matching Event Handlers in `result` array.
 *
 * @param result Accumulated Dispatch Targets.
 * @param target Target DOM Element.
 * @param match Matching function.
 */
export function accumulateDispatchTargets(
  result: DispatchTarget[],
  target: Element,
  match: (h: EventHandler) => boolean,
): void {
  for (const { container, current } of ROOTS) {
    if (container.contains(target)) {
      visitUp(result, match, target, container, current!);
      break;
    }
  }
}

function visitUp(
  result: DispatchTarget[],
  match: (h: EventHandler) => boolean,
  element: Element,
  root: Element,
  vnode: VNode | null,
): VNode | null {
  const parent = element.parentNode! as Element;
  if (parent !== root) {
    vnode = visitUp(result, match, parent, root, vnode);

    if (vnode !== null &&
      (vnode._f & (
        VNodeFlags.Children |
        VNodeFlags.StatelessComponent |
        VNodeFlags.StatefulComponent |
        VNodeFlags.Connect |
        VNodeFlags.UpdateContext
      )) !== 0) {
      let child = vnode._c;
      while (child !== null) {
        const r = visitDown(result, match, element, child as VNode);
        if (r) {
          return r;
        }
        child = (child as VNode)._r;
      }
    }
    return null;
  }

  return visitDown(result, match, element, vnode!);
}

function visitDown(
  result: DispatchTarget[],
  match: (h: EventHandler) => boolean,
  element: Element,
  vnode: VNode,
): VNode | null {
  const flags = vnode._f;
  let r;
  if (flags & VNodeFlags.Element) {
    if (vnode._i === element) {
      accumulateDispatchTargetsFromVNode(result, vnode, match);
      return vnode;
    }
  } else if (flags & (
    VNodeFlags.StatelessComponent |
    VNodeFlags.StatefulComponent |
    VNodeFlags.Connect |
    VNodeFlags.UpdateContext
  )) {
    r = visitDown(result, match, element, vnode._c as VNode);
    if (r) {
      accumulateDispatchTargetsFromVNode(result, vnode, match);
      return r;
    }
  }

  return null;
}

/**
 * accumulateDispatchTargetsFromElement accumulates matching Event Handlers in `result` array from the `target` Element.
 *
 * @param result Accumulated Dispatch Targets.
 * @param target Target Element.
 * @param match Matching function.
 */
function accumulateDispatchTargetsFromVNode(
  result: DispatchTarget[],
  target: VNode,
  match: (h: EventHandler) => boolean,
): void {
  const events = target._e;
  if (events) {
    let handlers: EventHandler[] | EventHandler | undefined;
    if (events instanceof Array) {
      let count = 0;
      for (const h of events) {
        if (h !== null && match(h) === true) {
          if (count === 0) {
            handlers = h;
          } else if (count === 1) {
            handlers = [handlers as EventHandler, h];
          } else {
            (handlers as EventHandler[]).push(h);
          }
          ++count;
        }
      }
    } else {
      if (match(events) === true) {
        handlers = events;
      }
    }
    if (handlers !== void 0) {
      result.push({ target, handlers });
    }
  }
}
