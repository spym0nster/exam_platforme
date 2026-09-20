export function Logo({ height = 40 }: { height?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/esen-logo.png" alt="ESEN" style={{ height, width: "auto" }} />;
}
