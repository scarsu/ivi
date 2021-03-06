import { useResetDOM, useDOMElement, useIVI, useHTML, useSVG, useTest } from "ivi-jest";
import { Op } from "ivi";
import { useDOMOpsCounters } from "./jest";

useResetDOM();
const root = useDOMElement();
const domOps = useDOMOpsCounters();
const t = useTest();

describe("element", () => {
  describe("HTML", () => {
    const h = useHTML();
    const r = (op: Op) => t.render<HTMLElement>(op, root()).domNode!;

    describe("mount", () => {
      test("div", () => {
        const n = r(h.div());
        expect(n).toMatchSnapshot();
        expect(domOps()).toMatchSnapshot();
      });
    });

    describe("update", () => {
      test("div to span", () => {
        r(h.span());
        const n = r(h.div());
        expect(n).toMatchSnapshot();
        expect(domOps()).toMatchSnapshot();
      });

      test("div to text", () => {
        r(h.span());
        const n = r(123);
        expect(n).toMatchSnapshot();
        expect(domOps()).toMatchSnapshot();
      });
    });
  });

  describe("SVG", () => {
    const ivi = useIVI();
    const s = useSVG();
    const r = (op: Op) => t.render<SVGElement>(op, root()).domNode!;

    describe("mount", () => {
      test("circle", () => {
        const n = r(s.circle());
        expect(n.namespaceURI).toBe(ivi.SVG_NAMESPACE);
        expect(n).toMatchSnapshot();
        expect(domOps()).toMatchSnapshot();
      });
    });
  });
});
