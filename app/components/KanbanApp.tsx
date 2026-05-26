'use client';

import { useState, useEffect, useRef } from 'react';

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img') as HTMLImageElement;
    const url = URL.createObjectURL(file);
    const timeout = setTimeout(() => {
      URL.revokeObjectURL(url);
      reject(new Error('timeout'));
    }, 15000);
    img.onload = () => {
      clearTimeout(timeout);
      const MAX = 900;
      let { width, height } = img;
      if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; }
      if (height > MAX) { width = Math.round(width * MAX / height); height = MAX; }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.70));
    };
    img.onerror = () => { clearTimeout(timeout); URL.revokeObjectURL(url); reject(new Error('load error')); };
    img.src = url;
  });
}
import type { Chassis, ChassisStatus, ChassisSize, ChassisCondition } from '../types';
import Image from 'next/image';
import { SIZE_LABELS } from '../services-catalog';
import { loadChassis, saveChassis, isConfigured } from '../lib/supabase';
import ChassisModal from './ChassisModal';
import { PillGrid, DatePicker, SelectDropdown, type PillOption } from './FormControls';
import { getSession, clearSession, hashPassword, type Session } from '../lib/auth';
import LoginScreen from './LoginScreen';

const SIZE_OPTIONS: PillOption[] = [
  { value: 'pequeño', label: '20 ft', sublabel: 'Chasis estándar' },
  { value: 'grande', label: '40 ft', sublabel: 'Chasis extendido' },
];

const PATIO_OPTIONS: PillOption[] = [
  { value: 'fiscal',        label: 'Fiscal' },
  { value: 'desaduanizado', label: 'Desaduanizado' },
  { value: 'fi',            label: 'FI' },
];

const CONDITION_OPTIONS: PillOption[] = [
  { value: 'bueno', label: 'Buenas condiciones' },
  { value: 'moderado', label: 'Desgaste moderado' },
  { value: 'severo', label: 'Deterioro severo' },
  { value: 'critico', label: 'Estado crítico' },
];

type ColumnConfig = {
  id: ChassisStatus;
  label: string;
  border: string;
  borderOver: string;
  headerBg: string;
  headerText: string;
  badge: string;
  dot: string;
  bar: string;
  emptyBorder: string;
};

const COLUMNS: ColumnConfig[] = [
  {
    id: 'recibido',
    label: 'Chasis',
    border: 'border-cyan-400/20',
    borderOver: 'border-cyan-400/60',
    headerBg: 'bg-cyan-400/10',
    headerText: 'text-cyan-300',
    badge: 'bg-cyan-400/20 text-cyan-300',
    dot: 'bg-cyan-400',
    bar: 'bg-gradient-to-r from-cyan-400 to-cyan-300',
    emptyBorder: 'border-cyan-400/20',
  },
  {
    id: 'diagnostico',
    label: 'Diagnóstico',
    border: 'border-blue-400/20',
    borderOver: 'border-blue-400/60',
    headerBg: 'bg-blue-400/10',
    headerText: 'text-blue-300',
    badge: 'bg-blue-400/20 text-blue-300',
    dot: 'bg-blue-400',
    bar: 'bg-gradient-to-r from-blue-400 to-indigo-300',
    emptyBorder: 'border-blue-400/20',
  },
  {
    id: 'en-reparacion',
    label: 'En Reparación',
    border: 'border-orange-400/20',
    borderOver: 'border-orange-400/60',
    headerBg: 'bg-orange-400/10',
    headerText: 'text-orange-300',
    badge: 'bg-orange-400/20 text-orange-300',
    dot: 'bg-orange-400',
    bar: 'bg-gradient-to-r from-orange-400 to-amber-300',
    emptyBorder: 'border-orange-400/20',
  },
  {
    id: 'acabados',
    label: 'Pintura y Rotulación',
    border: 'border-purple-400/20',
    borderOver: 'border-purple-400/60',
    headerBg: 'bg-purple-400/10',
    headerText: 'text-purple-300',
    badge: 'bg-purple-400/20 text-purple-300',
    dot: 'bg-purple-400',
    bar: 'bg-gradient-to-r from-purple-400 to-violet-300',
    emptyBorder: 'border-purple-400/20',
  },
  {
    id: 'inspeccion',
    label: 'Insp. Final',
    border: 'border-pink-400/20',
    borderOver: 'border-pink-400/60',
    headerBg: 'bg-pink-400/10',
    headerText: 'text-pink-300',
    badge: 'bg-pink-400/20 text-pink-300',
    dot: 'bg-pink-400',
    bar: 'bg-gradient-to-r from-pink-400 to-rose-300',
    emptyBorder: 'border-pink-400/20',
  },
  {
    id: 'entregado',
    label: 'Entregado',
    border: 'border-emerald-400/20',
    borderOver: 'border-emerald-400/60',
    headerBg: 'bg-emerald-400/10',
    headerText: 'text-emerald-300',
    badge: 'bg-emerald-400/20 text-emerald-300',
    dot: 'bg-emerald-400',
    bar: 'bg-gradient-to-r from-emerald-400 to-green-300',
    emptyBorder: 'border-emerald-400/20',
  },
];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function KanbanApp() {
  const [chassisList, setChassislist] = useState<Chassis[]>([]);
  const [selectedChassis, setSelectedChassis] = useState<Chassis | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ChassisStatus | null>(null);
  const [syncStatus, setSyncStatus] = useState<'local' | 'syncing' | 'synced' | 'error'>('local');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const s = getSession();
    setSession(s);
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    const init = async () => {
      if (!isConfigured()) {
        setSyncStatus('local');
        try {
          const stored = localStorage.getItem('ferrovalle-chassis');
          if (stored) setChassislist(JSON.parse(stored));
        } catch {}
        return;
      }
      setSyncStatus('syncing');
      const cloud = await loadChassis();
      if (cloud !== null) {
        setChassislist(cloud);
        try { localStorage.setItem('ferrovalle-chassis', JSON.stringify(cloud)); } catch {}
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
        try {
          const stored = localStorage.getItem('ferrovalle-chassis');
          if (stored) setChassislist(JSON.parse(stored));
        } catch {}
      }
      setDataLoaded(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (!dataLoaded) return;
    // localStorage: guardar inmediatamente (rápido y local)
    try { localStorage.setItem('ferrovalle-chassis', JSON.stringify(chassisList)); } catch {}
    if (!isConfigured()) return;
    // Supabase: debounce 1.5s para no enviar en cada tecla
    setSyncStatus('syncing');
    const timer = setTimeout(() => {
      saveChassis(chassisList).then(ok => setSyncStatus(ok ? 'synced' : 'error'));
    }, 1500);
    return () => clearTimeout(timer);
  }, [chassisList, dataLoaded]);

  const handleAddChassis = (data: Omit<Chassis, 'id' | 'createdAt'>) => {
    setChassislist(prev => [
      ...prev,
      { ...data, id: generateId(), createdAt: new Date().toISOString() },
    ]);
    setShowAddModal(false);
  };

  const handleUpdateChassis = (updated: Chassis) => {
    setChassislist(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    setSelectedChassis(updated);
  };

  const handleDeleteChassis = (id: string) => {
    if (!confirm('¿Eliminar este chasis? Esta acción no se puede deshacer.')) return;
    setChassislist(prev => prev.filter(c => c.id !== id));
    setSelectedChassis(null);
  };

  const handleTogglePriority = (id: string) => {
    setChassislist(prev =>
      prev.map(c => c.id === id ? { ...c, priority: !c.priority } : c)
    );
  };

  const handleDrop = (col: ChassisStatus) => {
    if (!draggedId) return;
    setChassislist(prev =>
      prev.map(c => {
        if (c.id !== draggedId) return c;
        const updated = { ...c, status: col };
        if (col === 'entregado' && !c.deliveryDate) {
          updated.deliveryDate = new Date().toISOString().split('T')[0];
        }
        return updated;
      })
    );
    setDraggedId(null);
    setDragOverCol(null);
  };

  const active = chassisList.filter(c => c.status !== 'entregado').length;
  const delivered = chassisList.filter(c => c.status === 'entregado').length;

  if (!authChecked) return null;
  if (!session) return <LoginScreen onLogin={() => setSession(getSession())} />;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#080c14]">
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4 shrink-0 z-10 border-b border-white/[0.06]"
        style={{
          background: 'linear-gradient(135deg, #1e0a3c 0%, #0c1e4a 60%, #080c14 100%)',
          boxShadow: '0 1px 30px rgba(139,92,246,0.12)',
        }}
      >
        <div className="flex items-center gap-4">
          <Image
            src="/ferrovalle-logo.svg"
            alt="Ferrovalle"
            width={180}
            height={20}
            priority
            className="shrink-0"
          />
          <div className="w-px h-6 bg-white/10 shrink-0" />
          <p className="text-purple-300/50 text-xs hidden sm:block">Gestión de Chasis de Grúas</p>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-5 text-xs">
            <Stat dot="bg-slate-500" label="total" value={chassisList.length} valueColor="text-white" />
            <Stat dot="bg-orange-400" label="activos" value={active} valueColor="text-orange-300" />
            <Stat dot="bg-emerald-400" label="entregados" value={delivered} valueColor="text-emerald-300" />
            {syncStatus !== 'local' && (
              <span className={`flex items-center gap-1.5 text-xs ${
                syncStatus === 'synced' ? 'text-emerald-400' :
                syncStatus === 'syncing' ? 'text-blue-300' :
                'text-red-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  syncStatus === 'synced' ? 'bg-emerald-400' :
                  syncStatus === 'syncing' ? 'bg-blue-400 animate-pulse' :
                  'bg-red-400'
                }`} />
                {syncStatus === 'synced' ? 'Guardado ✓' :
                 syncStatus === 'syncing' ? 'Guardando...' :
                 'No se pudo guardar'}
              </span>
            )}
          </div>
          {session?.userRole !== 'diagnostico' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #f97316, #c2410c)' }}
            >
              <span className="text-base leading-none font-light">+</span>
              <span>Agregar Chasis</span>
            </button>
          )}

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(v => !v)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm transition-all hover:scale-105 select-none"
              style={{
                background: `linear-gradient(135deg, ${session.userColor}, ${session.userColor}99)`,
                boxShadow: `0 2px 12px ${session.userColor}40`,
              }}
            >
              {session.userInitials}
            </button>
            {showUserMenu && (
              <div
                className="absolute right-0 top-11 w-52 rounded-xl border border-white/[0.08] shadow-2xl z-20 overflow-hidden"
                style={{ background: '#0e1420' }}
              >
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-white text-sm font-semibold">{session.userName}</p>
                  <p className="text-xs mt-0.5 font-medium" style={{ color: session.userRole === 'diagnostico' ? '#0ea5e9' : '#8b5cf6' }}>
                    {session.userRole === 'diagnostico' ? 'Personal de Diagnóstico' : 'Administrador'}
                  </p>
                </div>
                <button
                  onClick={() => { setShowUserMenu(false); setShowChangePassword(true); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  Cambiar contraseña
                </button>
                <button
                  onClick={() => { clearSession(); setSession(null); setShowUserMenu(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:text-red-300 hover:bg-white/[0.04] transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search bar */}
      <div className="shrink-0 px-5 pt-4 pb-2 relative">
        <div className="relative max-w-md">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="w-full bg-[#0e1420] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
            placeholder="Buscar por número de chasis u OC..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white text-sm">✕</button>
          )}
        </div>

        {/* Search results dropdown */}
        {searchOpen && searchQuery.trim() && (() => {
          const q = searchQuery.toLowerCase();
          const results = chassisList.filter(c =>
            c.chassisNumber.toLowerCase().includes(q) ||
            c.purchaseOrder.toLowerCase().includes(q)
          );
          const colLabel = (status: ChassisStatus) =>
            COLUMNS.find(c => c.id === status)?.label ?? status;
          const colBadge = (status: ChassisStatus) =>
            COLUMNS.find(c => c.id === status);
          return (
            <div className="absolute left-0 right-0 top-full mt-1 max-w-md rounded-xl border border-white/[0.10] shadow-2xl shadow-black/60 z-30 overflow-hidden"
              style={{ background: '#0e1420' }}>
              {results.length === 0 ? (
                <div className="px-4 py-4 text-sm text-slate-500 text-center">
                  No se encontró ningún chasis
                </div>
              ) : (
                results.slice(0, 8).map(chassis => {
                  const col = colBadge(chassis.status);
                  return (
                    <button
                      key={chassis.id}
                      onMouseDown={() => { setSelectedChassis(chassis); setSearchQuery(''); setSearchOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors text-left border-b border-white/[0.04] last:border-0"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-semibold text-sm">#{chassis.chassisNumber}</p>
                          {chassis.priority && (
                            <span className="text-orange-400 text-xs">🚩</span>
                          )}
                        </div>
                        {chassis.purchaseOrder && session?.userRole !== 'diagnostico' && (
                          <p className="text-slate-600 text-xs mt-0.5">{chassis.purchaseOrder}</p>
                        )}
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${col?.badge}`}>
                        {colLabel(chassis.status)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          );
        })()}
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-5 pt-2">
        <div className="flex gap-4 h-full" style={{ minWidth: 'max-content' }}>
          {COLUMNS.map(col => {
            const items = chassisList.filter(c => c.status === col.id);
            const isOver = dragOverCol === col.id;
            return (
              <div
                key={col.id}
                data-col-id={col.id}
                className={`flex flex-col w-72 rounded-2xl border-2 transition-all duration-150 ${
                  isOver ? col.borderOver : col.border
                }`}
                style={{ background: '#0e1420' }}
                onDragOver={e => {
                  e.preventDefault();
                  setDragOverCol(col.id);
                }}
                onDrop={() => handleDrop(col.id)}
                onDragLeave={e => {
                  if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDragOverCol(null);
                  }
                }}
              >
                {/* Column header */}
                <div
                  className={`flex items-center justify-between px-4 py-3 rounded-t-2xl border-b-2 ${col.border} ${col.headerBg} shrink-0`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className={`font-bold text-sm ${col.headerText}`}>{col.label}</span>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${col.badge}`}>
                    {items.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
                  {[...items].sort((a, b) => (b.priority ? 1 : 0) - (a.priority ? 1 : 0)).map(chassis => (
                    <ChassisCard
                      key={chassis.id}
                      chassis={chassis}
                      isDragging={draggedId === chassis.id}
                      bar={col.bar}
                      canInteract={session?.userRole !== 'diagnostico'}
                      onDragStart={() => setDraggedId(chassis.id)}
                      onDragEnd={() => { setDraggedId(null); setDragOverCol(null); }}
                      onClick={() => setSelectedChassis(chassis)}
                      onTogglePriority={() => handleTogglePriority(chassis.id)}
                      onTouchDragOver={c => { setDraggedId(chassis.id); setDragOverCol(c); }}
                      onTouchDrop={c => { handleDrop(c); }}
                    />
                  ))}
                  {items.length === 0 && (
                    <div
                      className={`flex-1 flex items-center justify-center py-10 rounded-xl border-2 border-dashed ${col.emptyBorder} mt-1`}
                    >
                      <p className={`text-xs ${col.headerText} opacity-30`}>Sin chasis</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {selectedChassis && (
        <ChassisModal
          chassis={selectedChassis}
          onUpdate={handleUpdateChassis}
          onDelete={handleDeleteChassis}
          onClose={() => setSelectedChassis(null)}
          userRole={session?.userRole ?? 'admin'}
          userName={session?.userName ?? ''}
        />
      )}
      {showAddModal && (
        <AddChassisModal onAdd={handleAddChassis} onClose={() => setShowAddModal(false)} />
      )}
      {showChangePassword && (
        <ChangePasswordModal
          session={session}
          onClose={() => setShowChangePassword(false)}
        />
      )}
    </div>
  );
}

// ─── Stat chip ────────────────────────────────────────────────────────────────

function Stat({
  dot,
  label,
  value,
  valueColor,
}: {
  dot: string;
  label: string;
  value: number;
  valueColor: string;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span className="text-slate-500">
        <strong className={`${valueColor} font-bold`}>{value}</strong> {label}
      </span>
    </span>
  );
}

// ─── Chassis Card ─────────────────────────────────────────────────────────────

function ChassisCard({
  chassis,
  isDragging,
  bar,
  canInteract = true,
  onDragStart,
  onDragEnd,
  onClick,
  onTogglePriority,
  onTouchDragOver,
  onTouchDrop,
}: {
  chassis: Chassis;
  isDragging: boolean;
  bar: string;
  canInteract?: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onClick: () => void;
  onTogglePriority: () => void;
  onTouchDragOver: (col: ChassisStatus | null) => void;
  onTouchDrop: (col: ChassisStatus) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const cbs = useRef({ onDragStart, onDragEnd, onTouchDragOver, onTouchDrop, onClick });
  useEffect(() => { cbs.current = { onDragStart, onDragEnd, onTouchDragOver, onTouchDrop, onClick }; });

  useEffect(() => {
    if (!canInteract || !cardRef.current) return;
    const el = cardRef.current;
    const pressTimer = { id: null as ReturnType<typeof setTimeout> | null };
    const state = { active: false, startX: 0, startY: 0, currentCol: null as ChassisStatus | null };
    let clone: HTMLDivElement | null = null;

    const cleanup = () => {
      if (clone) { clone.remove(); clone = null; }
      state.active = false;
      state.currentCol = null;
      cbs.current.onTouchDragOver(null);
    };

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      state.startX = t.clientX; state.startY = t.clientY;
      pressTimer.id = setTimeout(() => {
        state.active = true;
        cbs.current.onDragStart();
        if (navigator.vibrate) navigator.vibrate(50);
        const rect = el.getBoundingClientRect();
        clone = el.cloneNode(true) as HTMLDivElement;
        Object.assign(clone.style, {
          position: 'fixed', top: rect.top + 'px', left: rect.left + 'px',
          width: rect.width + 'px', pointerEvents: 'none', zIndex: '9999',
          opacity: '0.92', transform: 'scale(1.06) rotate(1.5deg)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7)', borderRadius: '12px',
          transition: 'transform 0.15s',
        });
        document.body.appendChild(clone);
      }, 400);
    };

    const onMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (pressTimer.id && !state.active) {
        if (Math.abs(t.clientX - state.startX) > 8 || Math.abs(t.clientY - state.startY) > 8) {
          clearTimeout(pressTimer.id); pressTimer.id = null;
        }
        return;
      }
      if (!state.active || !clone) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      clone.style.top = (t.clientY - rect.height / 2) + 'px';
      clone.style.left = (t.clientX - rect.width / 2) + 'px';
      clone.style.display = 'none';
      const target = document.elementFromPoint(t.clientX, t.clientY);
      clone.style.display = '';
      const colEl = target?.closest('[data-col-id]') as HTMLElement | null;
      const colId = (colEl?.dataset.colId ?? null) as ChassisStatus | null;
      if (colId !== state.currentCol) {
        state.currentCol = colId;
        cbs.current.onTouchDragOver(colId);
      }
    };

    const onEnd = () => {
      if (pressTimer.id) { clearTimeout(pressTimer.id); pressTimer.id = null; }
      if (!state.active) return;
      if (state.currentCol) cbs.current.onTouchDrop(state.currentCol);
      cbs.current.onDragEnd();
      cleanup();
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    el.addEventListener('touchcancel', onEnd);
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
      cleanup();
    };
  }, [canInteract]);
  const isOverdue =
    chassis.commitmentDate &&
    chassis.status !== 'entregado' &&
    new Date(chassis.commitmentDate + 'T12:00:00') < new Date();

  const formatDate = (d: string) => {
    if (!d) return null;
    return new Date(d + 'T12:00:00').toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
    });
  };

  const totalServices = chassis.selectedServices.length;
  const completedCount = (chassis.completedServices ?? []).filter(id =>
    chassis.selectedServices.some(s => s.serviceId === id)
  ).length;
  const pct = totalServices > 0 ? Math.round((completedCount / totalServices) * 100) : 0;

  return (
    <div
      ref={cardRef}
      draggable={canInteract}
      onDragStart={canInteract ? onDragStart : undefined}
      onDragEnd={canInteract ? onDragEnd : undefined}
      onClick={onClick}
      className={`rounded-xl border overflow-hidden cursor-pointer select-none transition-all ${
        isDragging
          ? 'border-white/[0.20] scale-95'
          : 'border-white/[0.07] hover:border-white/[0.15] hover:bg-[#1a2235]'
      }`}
      style={{ background: '#141b2d' }}
    >
      <div className={`h-[3px] ${bar}`} />
      <div className="p-3.5">
        {/* Number + flag */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <p className="font-bold text-white text-sm leading-tight">
              #{chassis.chassisNumber || '—'}
            </p>
            {chassis.purchaseOrder && (
              <span className="text-xs bg-white/[0.06] text-slate-500 px-1.5 py-0.5 rounded-md font-mono mt-0.5 inline-block truncate max-w-[120px]">
                {chassis.purchaseOrder}
              </span>
            )}
          </div>
          {canInteract && (
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onTogglePriority(); }}
            className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              chassis.priority
                ? 'bg-orange-400/20 text-orange-400'
                : 'text-slate-700 hover:text-slate-400 hover:bg-white/[0.05]'
            }`}
            title={chassis.priority ? 'Quitar prioridad' : 'Marcar como prioridad'}
          >
            <svg viewBox="0 0 14 14" className="w-3.5 h-3.5" fill="currentColor">
              <path d="M1 1v12M1 1h9l-2.5 4L10 9H1V1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill={chassis.priority ? 'currentColor' : 'none'} />
            </svg>
          </button>
          )}
        </div>

        {/* Date */}
        {chassis.commitmentDate && (
          <div
            className={`flex items-center gap-1 text-xs mb-2 ${
              isOverdue ? 'text-red-400 font-medium' : 'text-slate-600'
            }`}
          >
            <span>{isOverdue ? '⚠️' : '📅'}</span>
            <span>
              {isOverdue ? 'Vencía ' : 'Entrega '}
              {formatDate(chassis.commitmentDate)}
            </span>
          </div>
        )}

        {/* Progress bar */}
        {totalServices > 0 && (
          <div className="mb-2.5">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-slate-600">{completedCount} de {totalServices} servicios</span>
              <span className={pct === 100 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>{pct}%</span>
            </div>
            <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: pct === 100 ? '#4ade80' : pct > 50 ? '#f97316' : '#60a5fa' }}
              />
            </div>
          </div>
        )}
        {/* Footer */}
        <div className="flex items-center pt-2.5 border-t border-white/[0.05]">
          <span className="text-xs text-slate-700">
            {SIZE_LABELS[chassis.size]?.split(' ')[0] ?? chassis.size}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Add Chassis Modal ────────────────────────────────────────────────────────

const inp =
  'w-full bg-[#1a2235] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all [color-scheme:dark]';

function AddChassisModal({
  onAdd,
  onClose,
}: {
  onAdd: (data: Omit<Chassis, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}) {
  const [chassisNumber, setChassisNumber] = useState('');
  const [size, setSize] = useState<ChassisSize>('pequeño');
  const [condition, setCondition] = useState<ChassisCondition>('moderado');
  const [patio, setPatio] = useState('');
  const [notes, setNotes] = useState('');
  const [photoBefore, setPhotoBefore] = useState<string>('');

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file).then(setPhotoBefore);
    e.target.value = '';
  };

  const save = () => {
    if (!chassisNumber.trim()) return false;
    onAdd({
      chassisNumber,
      size,
      condition,
      patio,
      notes,
      status: 'recibido',
      clientName: '',
      purchaseOrder: '',
      photosBefore: photoBefore ? [photoBefore] : [],
      photosDetail: [],
      photosAfter: [],
      selectedServices: [],
      finalPrice: null,
      commitmentDate: '',
      deliveryDate: '',
      requestedBy: '',
      pdfPurchaseOrder: '',
      pdfPurchaseOrderName: '',
      pdfQuotation: '',
      pdfQuotationName: '',
      completedServices: [],
      priority: false,
    });
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); save(); };
  const handleBackdrop = () => { if (!save()) onClose(); };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] flex flex-col border border-white/[0.08] overflow-hidden"
        style={{ background: '#0e1420' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="px-5 py-4 border-b border-white/[0.06] shrink-0"
          style={{ background: 'linear-gradient(135deg, #1e0a3c 0%, #0c1e4a 100%)' }}
        >
          <h2 className="text-white font-bold text-base tracking-tight">Registrar nuevo chasis</h2>
          <p className="text-purple-300/50 text-xs mt-0.5">Información inicial del chasis</p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <Label text="Número de Chasis" required />
            <input
              className={inp}
              value={chassisNumber}
              onChange={e => setChassisNumber(e.target.value)}
              placeholder="ej. CH-2024-001"
              required
              autoFocus
            />
          </div>

          <div>
            <Label text="Tamaño" />
            <PillGrid value={size} onChange={v => setSize(v as ChassisSize)} options={SIZE_OPTIONS} />
          </div>

          <div>
            <Label text="Condición general" />
            <PillGrid value={condition} onChange={v => setCondition(v as ChassisCondition)} options={CONDITION_OPTIONS} />
          </div>

          <div>
            <Label text="Patio" />
            <SelectDropdown value={patio} onChange={setPatio} options={PATIO_OPTIONS} placeholder="Seleccionar patio..." />
          </div>

          <div>
            <Label text="Notas" />
            <textarea
              className={`${inp} resize-none`}
              rows={1}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Observaciones iniciales..."
            />
          </div>

          <div>
            <Label text="Foto del antes" />
            {photoBefore ? (
              <div className="relative group rounded-xl overflow-hidden border border-white/[0.08]" style={{ aspectRatio: '16/7' }}>
                <img src={photoBefore} alt="Foto antes" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setPhotoBefore('')}
                    className="opacity-0 group-hover:opacity-100 bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg transition-opacity font-semibold"
                  >
                    Eliminar foto
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex items-center gap-3 border border-dashed border-cyan-400/25 rounded-xl p-3 cursor-pointer hover:border-cyan-400/40 hover:bg-cyan-400/[0.03] transition-all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-cyan-400/40 shrink-0">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Click para subir foto del antes</p>
                  <p className="text-[10px] text-slate-700 mt-0.5">JPG, PNG</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </label>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-500 hover:text-white font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #f97316, #c2410c)' }}
            >
              Guardar y cerrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
      {text} {required && <span className="text-red-400 normal-case">*</span>}
    </label>
  );
}

// ─── Change Password Modal ────────────────────────────────────────────────────

function ChangePasswordModal({ session, onClose }: { session: Session; onClose: () => void }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (next !== confirm) { setError('Las contraseñas nuevas no coinciden'); return; }
    if (next.length < 4) { setError('La contraseña debe tener al menos 4 caracteres'); return; }
    setLoading(true);

    // Verify current password against DB
    const users = await fetch('/api/users').then(r => r.json());
    const me = users.find((u: { id: string; password_hash: string }) => u.id === session.userId);
    if (!me) { setError('Usuario no encontrado'); setLoading(false); return; }

    const currentHash = await hashPassword(current);
    if (currentHash !== me.password_hash) { setError('Contraseña actual incorrecta'); setLoading(false); return; }

    const newHash = await hashPassword(next);
    const res = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: session.userId, newHash }),
    });
    const json = await res.json();
    if (!json.ok) { setError('Error al guardar. Intenta de nuevo.'); setLoading(false); return; }

    setSuccess(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="rounded-2xl w-full max-w-sm p-6 border border-white/[0.08] shadow-2xl" style={{ background: '#0e1420' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm select-none"
            style={{ background: `linear-gradient(135deg, ${session.userColor}, ${session.userColor}99)` }}>
            {session.userInitials}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{session.userName}</p>
            <p className="text-slate-500 text-xs">Cambiar contraseña</p>
          </div>
        </div>
        {success ? (
          <p className="text-emerald-400 text-sm text-center py-4 font-medium">¡Contraseña actualizada! ✓</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="password" className={inp} placeholder="Contraseña actual" value={current} onChange={e => setCurrent(e.target.value)} autoFocus />
            <input type="password" className={inp} placeholder="Nueva contraseña" value={next} onChange={e => setNext(e.target.value)} />
            <input type="password" className={inp} placeholder="Confirmar nueva contraseña" value={confirm} onChange={e => setConfirm(e.target.value)} />
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <button type="submit" disabled={!current || !next || !confirm || loading}
              className="w-full py-2.5 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #f97316, #c2410c)' }}>
              {loading ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
