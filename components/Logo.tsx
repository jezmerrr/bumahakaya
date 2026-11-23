/* eslint-disable @next/next/no-img-element */

// Official horizontal wordmark (638 x 205). Height-driven; width auto.
export function Logo({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const src =
    variant === "dark"
      ? "/brand/bumahakaya-horizontal-on-navy.svg"
      : "/brand/bumahakaya-horizontal-fullcolor.svg";
  return (
    <img
      src={src}
      alt="BumahaKaya? by FloodWatch"
      className={className ?? "h-9 w-auto"}
    />
  );
}
