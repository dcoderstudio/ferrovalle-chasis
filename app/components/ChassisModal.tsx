'use client';

import { useState } from 'react';
import type { Chassis, ChassisStatus, ChassisSize, ChassisCondition } from '../types';
// ChassisSize and ChassisCondition used in cast expressions below
import {
  SERVICES,
  SIZE_MULTIPLIERS,
  CONDITION_MULTIPLIERS,
  SIZE_LABELS,
  CONDITION_LABELS,
} from '../services-catalog';
import { PillGrid, DatePicker, type PillOption } from './FormControls';

const SIZE_OPTIONS: PillOption[] = [
  { value: 'pequeño', label: 'Pequeño', sublabel: '< 6m' },
  { value: 'mediano', label: 'Mediano', sublabel: '6–10m' },
  { value: 'grande', label: 'Grande', sublabel: '10–15m' },
  { value: 'extra-grande', label: 'Extra Grande', sublabel: '> 15m' },
];

const CONDITION_OPTIONS: PillOption[] = [
  { value: 'bueno', label: 'Buenas condiciones', sublabel: 'Factor ×1.0' },
  { value: 'moderado', label: 'Desgaste moderado', sublabel: 'Factor ×1.3' },
  { value: 'severo', label: 'Deterioro severo', sublabel: 'Factor ×1.7' },
  { value: 'critico', label: 'Estado crítico', sublabel: 'Factor ×2.2' },
];

type Tab = 'info' | 'fotos' | 'cotizacion';

const STATUS_OPTIONS: Array<{
  id: ChassisStatus;
  label: string;
  inactive: string;
  active: string;
}> = [
  {
    id: 'recibido',
    label: 'Recibido',
    inactive: 'border-white/[0.08] text-slate-500 hover:border-cyan-400/30 hover:text-cyan-400',
    active: 'bg-cyan-400/15 border-cyan-400/50 text-cyan-300 font-semibold',
  },
  {
    id: 'diagnostico',
    label: 'Diagnóstico',
    inactive: 'border-white/[0.08] text-slate-500 hover:border-blue-400/30 hover:text-blue-400',
    active: 'bg-blue-400/15 border-blue-400/50 text-blue-300 font-semibold',
  },
  {
    id: 'en-reparacion',
    label: 'En Reparación',
    inactive: 'border-white/[0.08] text-slate-500 hover:border-orange-400/30 hover:text-orange-400',
    active: 'bg-orange-400/15 border-orange-400/50 text-orange-300 font-semibold',
  },
  {
    id: 'acabados',
    label: 'Acabados',
    inactive: 'border-white/[0.08] text-slate-500 hover:border-purple-400/30 hover:text-purple-400',
    active: 'bg-purple-400/15 border-purple-400/50 text-purple-300 font-semibold',
  },
  {
    id: 'inspeccion',
    label: 'Insp. Final',
    inactive: 'border-white/[0.08] text-slate-500 hover:border-pink-400/30 hover:text-pink-400',
    active: 'bg-pink-400/15 border-pink-400/50 text-pink-300 font-semibold',
  },
  {
    id: 'entregado',
    label: 'Entregado',
    inactive: 'border-white/[0.08] text-slate-500 hover:border-emerald-400/30 hover:text-emerald-400',
    active: 'bg-emerald-400/15 border-emerald-400/50 text-emerald-300 font-semibold',
  },
];

const inp =
  'w-full bg-[#1a2235] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all [color-scheme:dark]';

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(n);
}

export default function ChassisModal({
  chassis,
  onUpdate,
  onDelete,
  onClose,
}: {
  chassis: Chassis;
  onUpdate: (c: Chassis) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const [data, setData] = useState<Chassis>({ ...chassis });
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [hasChanges, setHasChanges] = useState(false);

  const update = (fields: Partial<Chassis>) => {
    setData(prev => ({ ...prev, ...fields }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(data);
    setHasChanges(false);
  };

  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'photosBefore' | 'photosDetail' | 'photosAfter'
  ) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    const promises = Array.from(files).map(
      file =>
        new Promise<string>(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        })
    );
    Promise.all(promises).then(newPhotos => {
      update({ [field]: [...data[field], ...newPhotos].slice(0, 6) });
    });
    e.target.value = '';
  };

  const removePhoto = (field: 'photosBefore' | 'photosDetail' | 'photosAfter', idx: number) => {
    update({ [field]: data[field].filter((_, i) => i !== idx) });
  };

  const toggleService = (serviceId: string) => {
    const exists = data.selectedServices.some(s => s.serviceId === serviceId);
    if (exists) {
      update({ selectedServices: data.selectedServices.filter(s => s.serviceId !== serviceId) });
    } else {
      update({ selectedServices: [...data.selectedServices, { serviceId, quantity: 1 }] });
    }
  };

  const updateQty = (serviceId: string, qty: number) => {
    update({
      selectedServices: data.selectedServices.map(s =>
        s.serviceId === serviceId ? { ...s, quantity: Math.max(1, qty) } : s
      ),
    });
  };

  const sizeMultiplier = SIZE_MULTIPLIERS[data.size] ?? 1;
  const conditionMultiplier = CONDITION_MULTIPLIERS[data.condition] ?? 1;
  const serviceUnitPrice = (basePrice: number) =>
    Math.round(basePrice * sizeMultiplier * conditionMultiplier);

  const quotedTotal = data.selectedServices.reduce((sum, sel) => {
    const svc = SERVICES.find(s => s.id === sel.serviceId);
    return svc ? sum + serviceUnitPrice(svc.basePrice) * sel.quantity : sum;
  }, 0);

  const TABS: Array<{ id: Tab; label: string }> = [
    { id: 'info', label: 'Información' },
    { id: 'fotos', label: 'Fotos' },
    { id: 'cotizacion', label: 'Cotización' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-white/[0.08] overflow-hidden"
        style={{ background: '#0e1420' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-5 shrink-0 border-b border-white/[0.06]"
          style={{ background: 'linear-gradient(135deg, #1e0a3c 0%, #0c1e4a 100%)' }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-white font-bold text-xl tracking-tight">
                Chasis #{data.chassisNumber || '—'}
              </h2>
              <p className="text-purple-300/60 text-sm mt-0.5">
                {data.clientName || 'Sin cliente asignado'}
                {data.purchaseOrder ? ` · OC: ${data.purchaseOrder}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <button
                  onClick={handleSave}
                  className="text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #f97316, #c2410c)' }}
                >
                  Guardar
                </button>
              )}
              <button
                onClick={onClose}
                className="text-white/30 hover:text-white transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Status selector */}
        <div className="flex gap-2 px-6 py-3 border-b border-white/[0.06] overflow-x-auto shrink-0 bg-[#0a0f1a]">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => update({ status: opt.id })}
              className={`px-3 py-1 rounded-full text-xs border whitespace-nowrap transition-all ${
                data.status === opt.id ? opt.active : `bg-transparent ${opt.inactive}`
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.06] px-6 shrink-0 bg-[#0a0f1a]">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-violet-400 text-violet-300'
                  : 'border-transparent text-slate-600 hover:text-slate-300'
              }`}
            >
              {tab.label}
              {tab.id === 'cotizacion' && quotedTotal > 0 && (
                <span className="ml-2 text-xs bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full">
                  {formatCurrency(quotedTotal)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && <InfoTab data={data} update={update} />}
          {activeTab === 'fotos' && (
            <FotosTab data={data} onPhotoUpload={handlePhotoUpload} onRemovePhoto={removePhoto} />
          )}
          {activeTab === 'cotizacion' && (
            <CotizacionTab
              data={data}
              update={update}
              toggleService={toggleService}
              updateQty={updateQty}
              serviceUnitPrice={serviceUnitPrice}
              quotedTotal={quotedTotal}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06] shrink-0 bg-[#0a0f1a]">
          <button
            onClick={() => onDelete(chassis.id)}
            className="text-red-500/70 hover:text-red-400 text-sm font-medium transition-colors"
          >
            Eliminar chasis
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-500 hover:text-white font-medium transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #f97316, #c2410c)' }}
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Info Tab ─────────────────────────────────────────────────────────────────

function InfoTab({ data, update }: { data: Chassis; update: (f: Partial<Chassis>) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Field label="Número de Chasis">
        <input
          className={inp}
          value={data.chassisNumber}
          onChange={e => update({ chassisNumber: e.target.value })}
          placeholder="ej. CH-2024-001"
        />
      </Field>
      <Field label="Cliente">
        <input
          className={inp}
          value={data.clientName}
          onChange={e => update({ clientName: e.target.value })}
          placeholder="Nombre del cliente"
        />
      </Field>
      <Field label="Orden de Compra">
        <input
          className={inp}
          value={data.purchaseOrder}
          onChange={e => update({ purchaseOrder: e.target.value })}
          placeholder="OC-XXXX"
        />
      </Field>
      <Field label="Precio Final Acordado (MXN)">
        <input
          type="number"
          className={inp}
          value={data.finalPrice ?? ''}
          onChange={e => update({ finalPrice: e.target.value ? Number(e.target.value) : null })}
          placeholder="Precio pactado con el cliente"
          min={0}
        />
      </Field>
      <Field label="Tamaño del Chasis">
        <PillGrid
          value={data.size}
          onChange={v => update({ size: v as ChassisSize })}
          options={SIZE_OPTIONS}
        />
      </Field>
      <Field label="Condición General">
        <PillGrid
          value={data.condition}
          onChange={v => update({ condition: v as ChassisCondition })}
          options={CONDITION_OPTIONS}
        />
      </Field>
      <Field label="Fecha Compromiso de Entrega">
        <DatePicker
          value={data.commitmentDate}
          onChange={v => update({ commitmentDate: v })}
          placeholder="Seleccionar fecha límite"
        />
      </Field>
      <Field label="Fecha de Entrega Real">
        <DatePicker
          value={data.deliveryDate}
          onChange={v => update({ deliveryDate: v })}
          placeholder="Fecha en que se entregó"
        />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Notas y Observaciones">
          <textarea
            className={`${inp} resize-none`}
            rows={4}
            value={data.notes}
            onChange={e => update({ notes: e.target.value })}
            placeholder="Detalles del estado, observaciones, instrucciones especiales..."
          />
        </Field>
      </div>
    </div>
  );
}

// ─── Fotos Tab ────────────────────────────────────────────────────────────────

function FotosTab({
  data,
  onPhotoUpload,
  onRemovePhoto,
}: {
  data: Chassis;
  onPhotoUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    f: 'photosBefore' | 'photosDetail' | 'photosAfter'
  ) => void;
  onRemovePhoto: (f: 'photosBefore' | 'photosDetail' | 'photosAfter', i: number) => void;
}) {
  const sections: Array<{
    key: 'photosBefore' | 'photosDetail' | 'photosAfter';
    label: string;
    hint: string;
    emptyBorder: string;
    emptyText: string;
  }> = [
    {
      key: 'photosBefore',
      label: 'Fotos Antes',
      hint: 'Estado inicial del chasis al recibirlo',
      emptyBorder: 'border-cyan-400/30',
      emptyText: 'text-cyan-400',
    },
    {
      key: 'photosDetail',
      label: 'Fotos de Detalles',
      hint: 'Áreas específicas de daño o trabajo requerido',
      emptyBorder: 'border-amber-400/30',
      emptyText: 'text-amber-400',
    },
    {
      key: 'photosAfter',
      label: 'Fotos Después',
      hint: 'Estado final tras completar la reparación',
      emptyBorder: 'border-emerald-400/30',
      emptyText: 'text-emerald-400',
    },
  ];

  return (
    <div className="space-y-8">
      {sections.map(sec => (
        <div key={sec.key}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-white text-sm">{sec.label}</h3>
              <p className="text-xs text-slate-600 mt-0.5">{sec.hint}</p>
            </div>
            {data[sec.key].length > 0 && (
              <label className="cursor-pointer flex items-center gap-1.5 text-xs bg-white/[0.05] border border-white/[0.08] hover:border-white/20 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg transition-all">
                <span>+</span> Agregar fotos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => onPhotoUpload(e, sec.key)}
                />
              </label>
            )}
          </div>

          {data[sec.key].length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {data[sec.key].map((src, i) => (
                <div
                  key={i}
                  className="relative group aspect-square rounded-xl overflow-hidden border border-white/[0.08]"
                >
                  <img
                    src={src}
                    alt={`${sec.label} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                  <button
                    onClick={() => onRemovePhoto(sec.key, i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <label
              className={`flex flex-col items-center justify-center border-2 border-dashed ${sec.emptyBorder} rounded-xl py-10 cursor-pointer hover:opacity-75 transition-opacity`}
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <span className="text-3xl mb-2 opacity-40">📷</span>
              <p className={`text-sm ${sec.emptyText} opacity-60`}>Click para subir fotos</p>
              <p className="text-xs text-slate-700 mt-0.5">PNG, JPG — máx 6 fotos</p>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => onPhotoUpload(e, sec.key)}
              />
            </label>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Cotización Tab ───────────────────────────────────────────────────────────

function CotizacionTab({
  data,
  update,
  toggleService,
  updateQty,
  serviceUnitPrice,
  quotedTotal,
}: {
  data: Chassis;
  update: (f: Partial<Chassis>) => void;
  toggleService: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  serviceUnitPrice: (base: number) => number;
  quotedTotal: number;
}) {
  const sizeMultiplier = SIZE_MULTIPLIERS[data.size] ?? 1;
  const conditionMultiplier = CONDITION_MULTIPLIERS[data.condition] ?? 1;
  const combined = Math.round(sizeMultiplier * conditionMultiplier * 100) / 100;

  return (
    <div className="space-y-6">
      {/* Multiplier cards */}
      <div
        className="rounded-xl border border-white/[0.06] p-4"
        style={{ background: '#141b2d' }}
      >
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Factores de ajuste de precio
        </p>
        <div className="grid grid-cols-3 gap-3">
          <MultiplierCard
            label="Tamaño"
            value={SIZE_LABELS[data.size]?.split(' ')[0] ?? data.size}
            multiplier={`×${sizeMultiplier}`}
          />
          <MultiplierCard
            label="Condición"
            value={CONDITION_LABELS[data.condition]?.split(' ')[0] ?? data.condition}
            multiplier={`×${conditionMultiplier}`}
          />
          <div
            className="rounded-xl p-3 border border-orange-400/20 text-center"
            style={{ background: 'rgba(249,115,22,0.08)' }}
          >
            <p className="text-xs text-orange-400/70 mb-1">Factor total</p>
            <p className="font-bold text-orange-300 text-2xl">×{combined}</p>
          </div>
        </div>
      </div>

      {/* Services */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Servicios
        </p>
        <div className="space-y-2">
          {SERVICES.map(svc => {
            const sel = data.selectedServices.find(s => s.serviceId === svc.id);
            const unitPrice = serviceUnitPrice(svc.basePrice);
            const subtotal = sel ? unitPrice * sel.quantity : 0;
            return (
              <div
                key={svc.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  sel
                    ? 'border-orange-400/25 bg-orange-400/[0.06]'
                    : 'border-white/[0.06] hover:border-white/[0.10]'
                }`}
                style={!sel ? { background: '#141b2d' } : undefined}
              >
                <input
                  type="checkbox"
                  checked={!!sel}
                  onChange={() => toggleService(svc.id)}
                  className="w-4 h-4 accent-orange-500 shrink-0 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${sel ? 'text-orange-200' : 'text-slate-300'}`}
                  >
                    {svc.name}
                  </p>
                  <p className="text-xs text-slate-600 truncate">{svc.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-slate-600 whitespace-nowrap">
                      {formatCurrency(unitPrice)}/{svc.unit}
                    </p>
                    {sel && (
                      <p className="text-sm font-bold text-orange-400">
                        {formatCurrency(subtotal)}
                      </p>
                    )}
                  </div>
                  {sel && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQty(svc.id, sel.quantity - 1)}
                        className="w-7 h-7 bg-white/[0.05] border border-white/[0.08] hover:bg-white/10 rounded-lg text-sm text-white font-bold leading-none"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-mono font-bold text-white">
                        {sel.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(svc.id, sel.quantity + 1)}
                        className="w-7 h-7 bg-white/[0.05] border border-white/[0.08] hover:bg-white/10 rounded-lg text-sm text-white font-bold leading-none"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total */}
      {quotedTotal > 0 && (
        <div
          className="rounded-xl border-2 border-orange-400/20 p-5"
          style={{ background: 'rgba(249,115,22,0.06)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Total cotizado</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {data.selectedServices.length} servicio
                {data.selectedServices.length !== 1 ? 's' : ''}
              </p>
            </div>
            <p className="text-3xl font-bold text-orange-400">{formatCurrency(quotedTotal)}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Precio final acordado (sobreescribe la cotización)
            </label>
            <input
              type="number"
              className="w-full bg-[#1a2235] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 transition-all [color-scheme:dark]"
              value={data.finalPrice ?? ''}
              onChange={e =>
                update({ finalPrice: e.target.value ? Number(e.target.value) : null })
              }
              placeholder={`Cotización: ${formatCurrency(quotedTotal)}`}
              min={0}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function MultiplierCard({
  label,
  value,
  multiplier,
}: {
  label: string;
  value: string;
  multiplier: string;
}) {
  return (
    <div
      className="rounded-xl p-3 border border-white/[0.06] text-center"
      style={{ background: '#1a2235' }}
    >
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="font-semibold text-white text-sm">{value}</p>
      <p className="text-sm text-orange-400 font-mono mt-1">{multiplier}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
