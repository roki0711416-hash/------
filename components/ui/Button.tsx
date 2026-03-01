import type { ReactNode, AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  full?: boolean;
};

type AsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type AsLink = CommonProps & {
  href: string;
  external?: boolean;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

type Props = AsButton | AsLink;

const base =
  "inline-flex items-center justify-center gap-2 font-bold transition-all duration-300 rounded-2xl text-sm sm:text-base";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-cta-from to-cta-to text-white shadow-lg shadow-orange-500/20 hover:scale-[1.03] hover:shadow-xl hover:shadow-orange-500/35 active:scale-[0.98] px-6 py-3.5",
  secondary:
    "border border-white/15 bg-white/5 text-white/90 backdrop-blur-sm hover:border-white/25 hover:bg-white/10 px-6 py-3.5",
  ghost:
    "text-muted hover:text-txt underline underline-offset-2 px-2 py-1",
};

function isLink(props: Props): props is AsLink {
  return "href" in props && typeof props.href === "string";
}

export default function Button(props: Props) {
  const {
    children,
    variant = "primary",
    className = "",
    full = false,
    ...rest
  } = props;

  const cls = `${base} ${variants[variant]} ${full ? "w-full" : ""} ${className}`;

  if (isLink(props)) {
    const { href, external, ...linkRest } = props;
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cls}
          {...(linkRest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
