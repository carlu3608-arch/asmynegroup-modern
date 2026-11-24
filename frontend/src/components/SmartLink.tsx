import Link from "next/link";
import type { ComponentProps } from "react";

/** Routes served by the external Marketplace Global app (via redirect in src/proxy.ts)
 *  must use a full page load instead of client-side navigation. */
export const isExternalRoute = (href: string) => /^\/(services\/marketplace-global|marketplace)(\/|$|\?)/.test(href);

export default function SmartLink({ href, prefetch, ...rest }: ComponentProps<typeof Link> & { href: string }) {
  if (isExternalRoute(href)) return <a href={href} {...(rest as ComponentProps<"a">)} />;
  return <Link href={href} prefetch={prefetch} {...rest} />;
}
