'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

// ─── Pill Grid Selector ───────────────────────────────────────────────────────

export type PillOption = {
  value: string;
  label: string;
  sublabel?: string;
};

export function PillGrid({
  value,
  onChange,
  options,
  allowDeselect = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: PillOption[];
  allowDeselect?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map(opt => {
        const sel = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(allowDeselect && sel ? '' : opt.value)}
            className={`px-3 py-2.5 rounded-xl border transition-all text-left ${
              sel
                ? 'border-violet-400/40 text-violet-200'
                : 'bg-[#1a2235] border-white/[0.07] text-slate-500 hover:border-white/[0.15] hover:text-slate-300'
            }`}
            style={
              sel
                ? {
                    background:
                      'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(99,102,241,0.08))',
                  }
                : undefined
            }
          >
            <span className="block text-xs font-semibold leading-tight">{opt.label}</span>
            {opt.sublabel && (
              <span
                className={`block text-[10px] mt-0.5 ${sel ? 'text-violet-400/60' : 'text-slate-700'}`}
              >
                {opt.sublabel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Date Picker ──────────────────────────────────────────────────────────────

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export function DatePicker({
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [calPos, setCalPos] = useState({ top: 0, left: 0, width: 280 });
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const btnRef = useRef<HTMLButtonElement>(null);
  const calRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        !btnRef.current?.contains(e.target as Node) &&
        !calRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const openCalendar = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const calH = 310;
    const top = spaceBelow < calH && rect.top > calH ? rect.top - calH - 6 : rect.bottom + 6;
    setCalPos({ top, left: rect.left, width: Math.max(rect.width, 288) });
    if (value) {
      setViewYear(parseInt(value.slice(0, 4)));
      setViewMonth(parseInt(value.slice(5, 7)) - 1);
    }
    setOpen(true);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectDay = (day: number) => {
    onChange(
      `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    );
    setOpen(false);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startOffset = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

  const selected = value ? new Date(value + 'T12:00:00') : null;
  const today = new Date();

  const isSelected = (day: number) =>
    !!selected &&
    selected.getDate() === day &&
    selected.getMonth() === viewMonth &&
    selected.getFullYear() === viewYear;

  const isToday = (day: number) =>
    today.getDate() === day &&
    today.getMonth() === viewMonth &&
    today.getFullYear() === viewYear;

  const displayValue = value
    ? new Date(value + 'T12:00:00').toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const popup = (
    <div
      ref={calRef}
      style={{
        position: 'fixed',
        top: calPos.top,
        left: calPos.left,
        width: calPos.width,
        zIndex: 9999,
        background: '#131c2e',
      }}
      className="rounded-2xl border border-white/[0.12] shadow-2xl shadow-black/70 p-4"
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <span className="text-white font-bold text-sm">{MONTHS[viewMonth]}</span>
          <span className="text-slate-500 text-sm ml-1.5">{viewYear}</span>
        </div>
        <button
          type="button"
          onClick={nextMonth}
          className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[10px] text-slate-600 font-semibold py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array(startOffset)
          .fill(null)
          .map((_, i) => (
            <div key={`b${i}`} />
          ))}
        {Array(daysInMonth)
          .fill(null)
          .map((_, i) => {
            const day = i + 1;
            const sel = isSelected(day);
            const tod = isToday(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => selectDay(day)}
                className={`h-8 w-full rounded-lg text-xs font-medium transition-all ${
                  sel
                    ? 'text-white font-bold'
                    : tod
                    ? 'bg-white/[0.07] text-violet-300 font-semibold'
                    : 'text-slate-500 hover:bg-white/[0.06] hover:text-white'
                }`}
                style={
                  sel
                    ? { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }
                    : undefined
                }
              >
                {day}
              </button>
            );
          })}
      </div>

      {/* Clear */}
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            setOpen(false);
          }}
          className="mt-3 w-full text-xs text-slate-700 hover:text-slate-400 py-1.5 transition-colors border-t border-white/[0.05] text-center"
        >
          Limpiar fecha
        </button>
      )}
    </div>
  );

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={openCalendar}
        className={`w-full bg-[#1a2235] border rounded-xl px-3 py-2.5 text-sm flex items-center justify-between gap-2 transition-all hover:border-white/[0.15] ${
          open
            ? 'border-violet-500/40 ring-2 ring-violet-500/20'
            : 'border-white/[0.08]'
        }`}
      >
        <span className={value ? 'text-white' : 'text-slate-700'}>{displayValue || placeholder}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-4 h-4 text-slate-600 shrink-0"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>
      {open && mounted && createPortal(popup, document.body)}
    </>
  );
}
