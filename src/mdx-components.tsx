import type { MDXComponents } from "mdx/types";
import { ConfigFormDemo } from "@/components/demos/config-form-demo";
import { MemoDemo } from "@/components/demos/memo-demo";

const components: MDXComponents = {
  MemoDemo,
  ConfigFormDemo,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
