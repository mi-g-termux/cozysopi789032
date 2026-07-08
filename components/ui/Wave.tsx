// Decorative "melting cream" wave divider used across the storefront.
// Pure presentational SVG \u2014 no client JS needed.

type WaveProps = {
  /** Fill color of the wave (the color that is "pouring" in). */
  color?: string;
  /** Flip so the wave hangs from the top of the next block. */
  flip?: boolean;
  className?: string;
};

export function Wave({
  color = "#F5E6C3",
  flip = false,
  className,
}: WaveProps) {
  return (
    <div
      aria-hidden
      className={className}
      style={{ lineHeight: 0, transform: flip ? "rotate(180deg)" : undefined }}
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="h-[70px] w-full md:h-[110px]"
      >
        <path
          fill={color}
          d="M0,40 C120,90 240,90 360,64 C480,38 600,-14 720,10 C840,34 960,104 1080,104 C1200,104 1320,44 1440,26 L1440,120 L0,120 Z"
        />
      </svg>
    </div>
  );
}
