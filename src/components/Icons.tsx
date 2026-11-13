import type { SVGProps } from 'react';

export function WebsiteLogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M5 4.5v8.8a6.7 6.7 0 0 0 13.4 0V4.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="11.7" cy="11.2" r="2.1" fill="var(--color-accent-icon)" />
    </svg>
  );
}

export function MenuGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.5 6.75h15M4.5 12h15M4.5 17.25h15"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function WandSparklesGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      {/* Wand shaft */}
      <path
        d="M4.2 19.8L16.3 7.7"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M14.1 9.9L17.6 6.4"
        stroke="#e8b4ff"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Top-left 4-point sparkle */}
      <path
        d="M8.5 3.5L9.2 5.3L11 6L9.2 6.7L8.5 8.5L7.8 6.7L6 6L7.8 5.3L8.5 3.5Z"
        fill="currentColor"
      />
      {/* Bottom-right 4-point sparkle */}
      <path
        d="M18 12.2L18.7 14L20.5 14.7L18.7 15.4L18 17.2L17.3 15.4L15.5 14.7L17.3 14L18 12.2Z"
        fill="currentColor"
      />
      {/* Tip sparkle */}
      <path
        d="M18.8 3.2L19.3 4.5L20.6 5L19.3 5.5L18.8 6.8L18.3 5.5L17 5L18.3 4.5L18.8 3.2Z"
        fill="#e8b4ff"
      />
    </svg>
  );
}

export function MoonGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M19.4 14.8A7.8 7.8 0 0 1 9.2 4.6a7.9 7.9 0 1 0 10.2 10.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SunGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M4.7 4.7l1.6 1.6M17.7 17.7l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.7 19.3l1.6-1.6M17.7 6.3l1.6-1.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BoltGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M11.4 1.8L4.2 11.1h5.1l-1 7.1 7.5-9.3h-5.2l.8-7.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function OpenBoxGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2.2 6.4L6 3.5h8l3.8 2.9-3.1 2.1H5.3L2.2 6.4Z"
        fill="currentColor"
        opacity="0.88"
      />
      <path
        d="M3.6 9.3h12.8v6.1a1.8 1.8 0 0 1-1.8 1.8H5.4a1.8 1.8 0 0 1-1.8-1.8V9.3Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function HourglassGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.5 2.5h11v1.6H14v1.3c0 1.8-1.2 3.4-2.8 4.1l-.3.2.3.2c1.6.7 2.8 2.3 2.8 4.1v1.3h1.5v1.6h-11v-1.6H6v-1.3c0-1.8 1.2-3.4 2.8-4.1l.3-.2-.3-.2C7.2 8.8 6 7.2 6 5.4V4.1H4.5V2.5Zm3.2 2v.8c0 1.2.8 2.3 2.3 2.9 1.5-.6 2.3-1.7 2.3-2.9v-.8H7.7Zm2.3 6.8c-1.1.5-1.9 1.3-2.2 2.3h4.4c-.3-1-1.1-1.8-2.2-2.3Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PyramidBlocksGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      {/* Top 1 cube */}
      <rect x="8.1" y="3" width="3.8" height="3.8" rx="0.9" fill="currentColor" />
      {/* Middle 2 cubes */}
      <rect x="5.5" y="8.1" width="3.8" height="3.8" rx="0.9" fill="currentColor" />
      <rect x="10.7" y="8.1" width="3.8" height="3.8" rx="0.9" fill="currentColor" />
      {/* Bottom 3 cubes */}
      <rect x="2.9" y="13.2" width="3.8" height="3.8" rx="0.9" fill="currentColor" />
      <rect x="8.1" y="13.2" width="3.8" height="3.8" rx="0.9" fill="currentColor" />
      <rect x="13.3" y="13.2" width="3.8" height="3.8" rx="0.9" fill="currentColor" />
    </svg>
  );
}

export function CaretDownGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden="true" {...props}>
      <path d="M3.2 5.2L7 9.4l3.8-4.2H3.2Z" fill="currentColor" />
    </svg>
  );
}

export function MinusGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.2 9h9.6"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PlusGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" {...props}>
      <path
        d="M9 4.2v9.6M4.2 9h9.6"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CodeBracketsGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6.2 3.5L2 8l4.2 4.5M13.8 3.5L18 8l-4.2 4.5M11.4 2.2L8.6 13.8"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeartGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M8 13.8s-5.6-3.4-5.6-7.3A3.2 3.2 0 0 1 8 4.4a3.2 3.2 0 0 1 5.6 2.1c0 3.9-5.6 7.3-5.6 7.3Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function InfinityModsWatermark() {
  return (
    <svg
      viewBox="0 0 520 56"
      className="mx-auto mt-1 h-auto w-full max-w-[360px] select-none pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="infinityWatermarkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor="var(--watermark-top)"
            stopOpacity="var(--watermark-op-top)"
          />
          <stop
            offset="65%"
            stopColor="var(--watermark-mid)"
            stopOpacity="var(--watermark-op-mid)"
          />
          <stop
            offset="100%"
            stopColor="var(--watermark-bot)"
            stopOpacity="0.06"
          />
        </linearGradient>
      </defs>
      <text
        x="260"
        y="39"
        textAnchor="middle"
        fill="url(#infinityWatermarkGrad)"
        style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 700,
          fontSize: '42px',
          letterSpacing: '0.09em',
        }}
      >
        INFINITY MODS
      </text>
    </svg>
  );
}
