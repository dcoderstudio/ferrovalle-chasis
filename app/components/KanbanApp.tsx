'use client';

import { useState, useEffect } from 'react';
import type { Chassis, ChassisStatus, ChassisSize, ChassisCondition } from '../types';
import Image from 'next/image';
import { SIZE_LABELS } from '../services-catalog';
import ChassisModal from './ChassisModal';
import { PillGrid, DatePicker, type PillOption } from './FormControls';

const SIZE_OPTIONS: PillOption[] = [
  { value: 'pequeño', label: '20 ft', sublabel: 'Chasis estándar' },
  { value: 'grande', label: '40 ft', sublabel: 'Chasis extendido' },
];

const CONDITION_OPTIONS: PillOption[] = [
  { value: 'bueno', label: 'Buenas condiciones', sublabel: 'Factor ×1.0' },
  { value: 'moderado', label: 'Desgaste moderado', sublabel: 'Factor ×1.3' },
  { value: 'severo', label: 'Deterioro severo', sublabel: 'Factor ×1.7' },
  { value: 'critico', label: 'Estado crítico', sublabel: 'Factor ×2.2' },
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
    label: 'Recibido',
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
    label: 'Acabados',
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

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ferrovalle-chassis');
      if (stored) setChassislist(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('ferrovalle-chassis', JSON.stringify(chassisList));
    } catch {}
  }, [chassisList]);

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
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #f97316, #c2410c)' }}
          >
            <span className="text-base leading-none font-light">+</span>
            <span>Agregar Chasis</span>
          </button>
        </div>
      </header>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-5">
        <div className="flex gap-4 h-full" style={{ minWidth: 'max-content' }}>
          {COLUMNS.map(col => {
            const items = chassisList.filter(c => c.status === col.id);
            const isOver = dragOverCol === col.id;
            return (
              <div
                key={col.id}
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
                  {items.map(chassis => (
                    <ChassisCard
                      key={chassis.id}
                      chassis={chassis}
                      isDragging={draggedId === chassis.id}
                      bar={col.bar}
                      onDragStart={() => setDraggedId(chassis.id)}
                      onDragEnd={() => {
                        setDraggedId(null);
                        setDragOverCol(null);
                      }}
                      onClick={() => setSelectedChassis(chassis)}
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
        />
      )}
      {showAddModal && (
        <AddChassisModal onAdd={handleAddChassis} onClose={() => setShowAddModal(false)} />
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
  onDragStart,
  onDragEnd,
  onClick,
}: {
  chassis: Chassis;
  isDragging: boolean;
  bar: string;
  onDragStart: () => void;
  onDragEnd: () => void;
  onClick: () => void;
}) {
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

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`rounded-xl border border-white/[0.07] overflow-hidden cursor-pointer select-none transition-all ${
        isDragging
          ? 'opacity-40 scale-95'
          : 'hover:border-white/[0.15] hover:bg-[#1a2235]'
      }`}
      style={{ background: '#141b2d' }}
    >
      <div className={`h-[3px] ${bar}`} />
      <div className="p-3.5">
        {/* Number + PO */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <p className="font-bold text-white text-sm leading-tight">
              #{chassis.chassisNumber || '—'}
            </p>
            {chassis.clientName && (
              <p className="text-slate-500 text-xs mt-0.5 truncate">{chassis.clientName}</p>
            )}
          </div>
          {chassis.purchaseOrder && (
            <span className="text-xs bg-white/[0.06] text-slate-500 px-1.5 py-0.5 rounded-md font-mono shrink-0 max-w-[80px] truncate">
              {chassis.purchaseOrder}
            </span>
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

        {/* Footer */}
        <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.05]">
          <span className="text-xs text-slate-700">
            {SIZE_LABELS[chassis.size]?.split(' ')[0] ?? chassis.size}
          </span>
          {totalServices > 0 && (
            <span className="text-xs bg-orange-500/15 text-orange-400 font-medium px-2 py-0.5 rounded-full">
              {totalServices} servicio{totalServices !== 1 ? 's' : ''}
            </span>
          )}
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
  const [notes, setNotes] = useState('');
  const [photoBefore, setPhotoBefore] = useState<string>('');

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhotoBefore(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chassisNumber.trim()) return;
    onAdd({
      chassisNumber,
      size,
      condition,
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
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-md border border-white/[0.08] overflow-hidden"
        style={{ background: '#0e1420' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="px-6 py-5 border-b border-white/[0.06]"
          style={{ background: 'linear-gradient(135deg, #1e0a3c 0%, #0c1e4a 100%)' }}
        >
          <h2 className="text-white font-bold text-lg tracking-tight">Registrar nuevo chasis</h2>
          <p className="text-purple-300/50 text-xs mt-0.5">Información inicial del chasis</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Número */}
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

          {/* Tamaño */}
          <div>
            <Label text="Tamaño" />
            <PillGrid
              value={size}
              onChange={v => setSize(v as ChassisSize)}
              options={SIZE_OPTIONS}
            />
          </div>

          {/* Condición */}
          <div>
            <Label text="Condición general" />
            <PillGrid
              value={condition}
              onChange={v => setCondition(v as ChassisCondition)}
              options={CONDITION_OPTIONS}
            />
          </div>

          {/* Notas */}
          <div>
            <Label text="Notas" />
            <textarea
              className={`${inp} resize-none`}
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Observaciones iniciales..."
            />
          </div>

          {/* Foto del antes */}
          <div>
            <Label text="Foto del antes" />
            {photoBefore ? (
              <div className="relative group rounded-xl overflow-hidden border border-white/[0.08] aspect-video">
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
              <label
                className="flex flex-col items-center justify-center border-2 border-dashed border-cyan-400/25 rounded-xl py-8 cursor-pointer hover:border-cyan-400/50 hover:bg-cyan-400/[0.03] transition-all"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-cyan-400/40 mb-2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <p className="text-sm text-slate-500">Click para subir foto del antes</p>
                <p className="text-xs text-slate-700 mt-0.5">JPG, PNG</p>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </label>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-500 hover:text-white font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #f97316, #c2410c)' }}
            >
              Registrar Chasis
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
