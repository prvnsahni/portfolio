import type { MDXComponents } from "mdx/types";
import { MemoDemo } from "@/components/demos/memo-demo";

const components: MDXComponents = {
  MemoDemo,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
