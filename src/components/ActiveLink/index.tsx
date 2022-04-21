import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import { ReactElement, cloneElement } from "react";

interface ActiveLinkprops extends LinkProps {
  children: ReactElement,
  activeClassName: string
}

export function ActiveLink({ children, activeClassName, ...rest}: ActiveLinkprops) {
  const { asPath } = useRouter()

  const className = asPath === rest.href
    ? activeClassName
    : '';

  return (
    <Link {...rest}>
      {cloneElement(children, {
        className,
      })}
    </Link>
  )
}