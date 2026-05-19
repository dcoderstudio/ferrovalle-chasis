'use client';

import { useState, useEffect } from 'react';
import type { Chassis, ChassisStatus, ChassisSize, ChassisCondition } from '../types';
import { SIZE_LABELS, CONDITION_LABELS } from '../services-catalog';
import ChassisModal from './ChassisModal';

type ColumnConfig = {
  id: ChassisStatus;
  label: string;
  bg: string;
  border: string;
  headerText: string;
  dot: string;
  badgeCls: string;
  cardAccent: string;
};

const COLUMNS: ColumnConfig[] = [
  {
    id: 'recibido',
    label: 'Recibido',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    headerText: 'text-amber-700',
    dot: 'bg-amber-500',
    badgeCls: 'bg-amber-100 text-amber-700',
    cardAccent: 'bg-amber-500',
  },
  {
    id: 'diagnostico',
    label: 'Diagnóstico',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    headerText: 'text-blue-700',
    dot: 'bg-blue-500',
    badgeCls: 'bg-blue-100 text-blue-700',
    cardAccent: 'bg-blue-500',
  },
  {
    id: 'en-reparacion',
    label: 'En Reparación',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    headerText: 'text-orange-700',
    dot: 'bg-orange-500',
    badgeCls: 'bg-orange-100 text-orange-700',
    cardAccent: 'bg-orange-500',
  },
  {
    id: 'acabados',
    label: 'Acabados',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    headerText: 'text-violet-700',
    dot: 'bg-violet-500',
    badgeCls: 'bg-violet-100 text-violet-700',
    cardAccent: 'bg-violet-500',
  },
  {
    id: 'inspeccion',
    label: 'Insp. Final',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    headerText: 'text-cyan-700',
    dot: 'bg-cyan-500',
    badgeCls: 'bg-cyan-100 text-cyan-700',
    cardAccent: 'bg-cyan-500',
  },
  {
    id: 'entregado',
    label: 'Entregado',
    bg: 'bg-green-50',
    border: 'border-green-200',
    headerText: 'text-green-700',
    dot: 'bg-green-500',
    badgeCls: 'bg-green-100 text-green-700',
    cardAccent: 'bg-green-500',
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
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-[#0f2746] shadow-lg shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm select-none">FV</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Ferrovalle</h1>
            <p className="text-blue-300 text-xs">Gestión de Chasis de Grúas</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-5 text-xs">
            <span className="text-slate-400">
              <strong className="text-white text-sm">{chassisList.length}</strong> total
            </span>
            <span className="text-slate-400">
              <strong className="text-orange-400 text-sm">{active}</strong> activos
            </span>
            <span className="text-slate-400">
              <strong className="text-green-400 text-sm">{delivered}</strong> entregados
            </span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            <span className="text-base leading-none">+</span>
            <span>Agregar Chasis</span>
          </button>
        </div>
      </header>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <div className="flex gap-3 h-full" style={{ minWidth: 'max-content' }}>
          {COLUMNS.map(col => {
            const items = chassisList.filter(c => c.status === col.id);
            const isOver = dragOverCol === col.id;
            return (
              <div
                key={col.id}
                className={`flex flex-col w-72 rounded-xl border-2 transition-colors ${
                  isOver
                    ? 'border-orange-400 bg-orange-50'
                    : `${col.border} ${col.bg}`
                }`}
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
                  className={`flex items-center justify-between px-4 py-3 border-b-2 ${col.border} rounded-t-xl bg-white/60 shrink-0`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                    <span className={`font-bold text-sm ${col.headerText}`}>{col.label}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badgeCls}`}>
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
                      accent={col.cardAccent}
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
                      className={`flex-1 flex items-center justify-center py-10 rounded-lg border-2 border-dashed ${col.border} mt-1`}
                    >
                      <p className={`text-xs ${col.headerText} opacity-40`}>Sin chasis</p>
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

// ─── Chassis Card ─────────────────────────────────────────────────────────────

function ChassisCard({
  chassis,
  isDragging,
  accent,
  onDragStart,
  onDragEnd,
  onClick,
}: {
  chassis: Chassis;
  isDragging: boolean;
  accent: string;
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
      className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer select-none overflow-hidden ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <div className={`h-1 ${accent}`} />
      <div className="p-3.5">
        {/* Number + client */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <p className="font-bold text-slate-800 text-sm leading-tight">
              #{chassis.chassisNumber || '—'}
            </p>
            {chassis.clientName && (
              <p className="text-slate-500 text-xs mt-0.5 truncate">{chassis.clientName}</p>
            )}
          </div>
          {chassis.purchaseOrder && (
            <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono shrink-0 max-w-[80px] truncate">
              {chassis.purchaseOrder}
            </span>
          )}
        </div>

        {/* Commitment date */}
        {chassis.commitmentDate && (
          <div
            className={`flex items-center gap-1 text-xs mb-2 ${
              isOverdue ? 'text-red-500 font-medium' : 'text-slate-500'
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
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-400">
            {SIZE_LABELS[chassis.size]?.split(' ')[0] ?? chassis.size}
          </span>
          {totalServices > 0 && (
            <span className="text-xs bg-orange-50 text-orange-600 font-medium px-2 py-0.5 rounded-full">
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
  'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors bg-white';

function AddChassisModal({
  onAdd,
  onClose,
}: {
  onAdd: (data: Omit<Chassis, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    chassisNumber: '',
    clientName: '',
    purchaseOrder: '',
    size: 'mediano' as ChassisSize,
    condition: 'moderado' as ChassisCondition,
    commitmentDate: '',
    notes: '',
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.chassisNumber.trim()) return;
    onAdd({
      ...form,
      status: 'recibido',
      photosBefore: [],
      photosDetail: [],
      photosAfter: [],
      selectedServices: [],
      finalPrice: null,
      deliveryDate: '',
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-[#0f2746] rounded-t-2xl">
          <h2 className="text-white font-bold text-lg">Registrar nuevo chasis</h2>
          <p className="text-blue-300 text-xs mt-0.5">Ingresa la información básica del chasis</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Número de Chasis <span className="text-red-400">*</span>
              </label>
              <input
                className={inp}
                value={form.chassisNumber}
                onChange={e => set('chassisNumber', e.target.value)}
                placeholder="ej. CH-2024-001"
                required
                autoFocus
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Cliente
              </label>
              <input
                className={inp}
                value={form.clientName}
                onChange={e => set('clientName', e.target.value)}
                placeholder="Nombre del cliente"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Orden de Compra
              </label>
              <input
                className={inp}
                value={form.purchaseOrder}
                onChange={e => set('purchaseOrder', e.target.value)}
                placeholder="OC-XXXX"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Fecha de Entrega
              </label>
              <input
                type="date"
                className={inp}
                value={form.commitmentDate}
                onChange={e => set('commitmentDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Tamaño
              </label>
              <select
                className={inp}
                value={form.size}
                onChange={e => set('size', e.target.value as ChassisSize)}
              >
                {Object.entries(SIZE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Condición
              </label>
              <select
                className={inp}
                value={form.condition}
                onChange={e => set('condition', e.target.value as ChassisCondition)}
              >
                {Object.entries(CONDITION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Notas
              </label>
              <textarea
                className={`${inp} resize-none`}
                rows={2}
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Observaciones iniciales..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Registrar Chasis
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
