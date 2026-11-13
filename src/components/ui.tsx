import type { ComponentProps } from 'react';

export const Surface = ({
  inset = false,
  className = '',
  ...p
}: ComponentProps<'div'> & { inset?: boolean }) => (
  <div
    className={`min-w-0 [:where(&)]:rounded-card [:where(&)]:text-foreground ${
      inset
        ? '[:where(&)]:bg-well [:where(&)]:border [:where(&)]:border-well-border'
        : '[:where(&)]:bg-surface [:where(&)]:border [:where(&)]:border-border [:where(&)]:shadow-surface'
    } ${className}`}
    {...p}
  />
);

const tones = {
  primary: 'cta-purple-btn [:where(&)]:text-primary-foreground',
  quiet:
    '[:where(&)]:border [:where(&)]:border-border [:where(&)]:bg-surface-band [:where(&)]:text-foreground hover:border-primary/40',
  ghost:
    '[:where(&)]:bg-transparent [:where(&)]:text-muted hover:text-foreground',
};

export const Button = ({
  tone = 'primary',
  type = 'button',
  className = '',
  ...p
}: ComponentProps<'button'> & { tone?: keyof typeof tones }) => (
  <button
    type={type}
    className={`[:where(&)]:inline-flex [:where(&)]:min-h-11 [:where(&)]:items-center [:where(&)]:justify-center [:where(&)]:gap-2 whitespace-nowrap [:where(&)]:rounded-control [:where(&)]:px-4 [:where(&)]:font-semibold transition-[transform,opacity,filter,border-color,color,background-color] duration-150 ease-out active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}
    {...p}
  />
);

export const Field = ({
  label,
  icon,
  htmlFor,
  children,
  className = '',
}: {
  label: string;
  icon?: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`min-w-0 ${className}`}>
    <label
      htmlFor={htmlFor}
      className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold tracking-[0.08em] text-muted uppercase select-none"
    >
      {icon && <span className="shrink-0 text-accent-icon">{icon}</span>}
      <span>{label}</span>
    </label>
    {children}
  </div>
);
