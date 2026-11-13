import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check } from 'lucide-react';
import { CaretDownGlyph } from './Icons';

export interface SelectItem {
  value: string;
  label: string;
  sublabel?: string;
}

interface CustomSelectProps {
  id?: string;
  ariaLabel: string;
  value: string;
  options: SelectItem[];
  onChange: (nextValue: string) => void;
}

export function CustomSelect({
  id,
  ariaLabel,
  value,
  options,
  onChange,
}: CustomSelectProps) {
  const generatedId = useId();
  const buttonId = id ?? generatedId;
  const listboxId = `${buttonId}-listbox`;
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(() =>
    Math.max(
      0,
      options.findIndex((o) => o.value === value)
    )
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption =
    options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  const handleToggle = () => {
    const idx = options.findIndex((o) => o.value === value);
    setHighlightedIndex(idx >= 0 ? idx : 0);
    setOpen((prev) => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev + 1) % options.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        setHighlightedIndex(
          (prev) => (prev - 1 + options.length) % options.length
        );
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (open) {
        e.preventDefault();
        const chosen = options[highlightedIndex];
        if (chosen) {
          onChange(chosen.value);
          setOpen(false);
        }
      }
    }
  };

  return (
    <div ref={containerRef} className="relative min-w-0">
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="flex min-h-[42px] w-full items-center justify-between gap-2.5 rounded-[10px] border border-well-border bg-well px-3.5 py-2 text-left text-[14px] font-medium text-foreground transition-[border-color,box-shadow] duration-150 ease-out hover:border-primary/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
      >
        <span className="min-w-0 truncate">{selectedOption?.label}</span>
        <CaretDownGlyph
          className={`h-3 w-3 shrink-0 text-accent-icon transition-transform duration-150 ease-out ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel}
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'top center' }}
            className="glassy-dropdown glassy-scroll absolute left-1/2 -translate-x-1/2 z-40 mt-1.5 w-[216px] max-w-[calc(100%-1rem)] max-h-[246px] overflow-y-auto rounded-2xl py-1.5"
          >
            {options.map((opt, idx) => {
              const isSelected = opt.value === value;
              const isHighlighted = idx === highlightedIndex;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    buttonRef.current?.focus();
                  }}
                  className={`flex min-h-[34px] items-center gap-2 px-3 py-1 text-[13.5px] cursor-pointer transition-colors duration-100 ${
                    isSelected
                      ? 'font-semibold text-foreground bg-foreground/[0.08]'
                      : isHighlighted
                      ? 'text-foreground bg-foreground/[0.06]'
                      : 'text-foreground/90 font-normal'
                  }`}
                >
                  <span className="inline-flex w-3.5 shrink-0 items-center justify-center">
                    {isSelected && (
                      <Check
                        className="h-3.5 w-3.5 text-foreground"
                        strokeWidth={2.5}
                      />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{opt.label}</div>
                    {opt.sublabel && (
                      <div className="text-[11px] text-muted">{opt.sublabel}</div>
                    )}
                  </div>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
