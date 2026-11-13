import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Box,
  Download,
  KeyRound,
  Settings,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import type { AppView } from '../types/license';

interface NavigationDrawerProps {
  open: boolean;
  activeView: AppView;
  balanceCents: number;
  totalKeysCount: number;
  onSelectView: (view: AppView) => void;
  onExportAll: () => void;
  onClose: () => void;
}

export function NavigationDrawer({
  open,
  activeView,
  totalKeysCount,
  onSelectView,
  onExportAll,
  onClose,
}: NavigationDrawerProps) {
  const firstItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    firstItemRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const viewItems: {
    id: AppView;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'generator',
      label: 'Key Generator',
      icon: <Box className="h-[17px] w-[17px]" strokeWidth={1.9} />,
    },
    {
      id: 'keys',
      label: 'Manage Keys',
      icon: <KeyRound className="h-[17px] w-[17px]" strokeWidth={1.9} />,
    },
    {
      id: 'validator',
      label: 'Verify & HWID',
      icon: <ShieldCheck className="h-[17px] w-[17px]" strokeWidth={1.9} />,
    },
    {
      id: 'wallet',
      label: 'Reseller Wallet',
      icon: <Wallet className="h-[17px] w-[17px]" strokeWidth={1.9} />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-[17px] w-[17px]" strokeWidth={1.9} />,
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Platform navigation"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/65"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.nav
            aria-label="Main menu"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-[560px] rounded-t-[20px] border-t border-x border-border bg-surface px-3 pt-2.5 pb-6 text-foreground shadow-surface"
          >
            <div
              aria-hidden="true"
              className="mx-auto mb-2.5 h-1 w-9 rounded-full bg-border"
            />

            <div className="space-y-0.5">
              {viewItems.map((item, idx) => {
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    ref={idx === 0 ? firstItemRef : undefined}
                    type="button"
                    onClick={() => {
                      onSelectView(item.id);
                      onClose();
                    }}
                    className={`flex min-h-[42px] w-full items-center justify-between gap-3 rounded-[10px] px-3.5 py-2 text-left text-[14.5px] transition-colors duration-120 cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-foreground/[0.09] font-semibold text-foreground'
                        : 'font-normal text-foreground/90 hover:bg-foreground/[0.05]'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={
                          active ? 'text-foreground' : 'text-muted'
                        }
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  onExportAll();
                  onClose();
                }}
                disabled={totalKeysCount === 0}
                className="flex min-h-[42px] w-full items-center justify-between gap-3 rounded-[10px] px-3.5 py-2 text-left text-[14.5px] font-normal text-foreground/90 transition-colors duration-120 hover:bg-foreground/[0.05] cursor-pointer whitespace-nowrap disabled:opacity-45 disabled:cursor-not-allowed"
              >
                <span className="flex items-center gap-3">
                  <span className="text-muted">
                    <Download
                      className="h-[17px] w-[17px]"
                      strokeWidth={1.9}
                    />
                  </span>
                  <span>Export All Keys (.TXT)</span>
                </span>
              </button>
            </div>
          </motion.nav>
        </div>
      )}
    </AnimatePresence>
  );
}
