'use client';

import { useState } from 'react';
import type { Chassis, ChassisStatus, ChassisSize, ChassisCondition } from '../types';
import {
  SERVICES,
  SIZE_MULTIPLIERS,
  CONDITION_MULTIPLIERS,
  SIZE_LABELS,
  CONDITION_LABELS,
} from '../services-catalog';

type Tab = 'info' | 'fotos' | 'cotizacion';

const STATUS_OPTIONS: Array<{ id: ChassisStatus; label: string; cls: string; activeCls: string }> = [
  { id: 'recibido', label: 'Recibido', cls: 'border-amber-300 text-amber-700 hover:bg-amber-50', activeCls: 'bg-amber-100 border-amber-400 text-amber-800 font-bold' },
  { id: 'diagnostico', label: 'Diagnóstico', cls: 'border-blue-300 text-blue-700 hover:bg-blue-50', activeCls: 'bg-blue-100 border-blue-400 text-blue-800 font-bold' },
  { id: 'en-reparacion', label: 'En Reparación', cls: 'border-orange-300 text-orange-700 hover:bg-orange-50', activeCls: 'bg-orange-100 border-orange-400 text-orange-800 font-bold' },
  { id: 'acabados', label: 'Acabados', cls: 'border-violet-300 text-violet-700 hover:bg-violet-50', activeCls: 'bg-violet-100 border-violet-400 text-violet-800 font-bold' },
  { id: 'inspeccion', label: 'Insp. Final', cls: 'border-cyan-300 text-cyan-700 hover:bg-cyan-50', activeCls: 'bg-cyan-100 border-cyan-400 text-cyan-800 font-bold' },
  { id: 'entregado', label: 'Entregado', cls: 'border-green-300 text-green-700 hover:bg-green-50', activeCls: 'bg-green-100 border-green-400 text-green-800 font-bold' },
];

const inp =
  'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors bg-white';

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
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#0f2746] rounded-t-2xl shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-white font-bold text-xl leading-tight">
                Chasis #{data.chassisNumber || '—'}
              </h2>
              <p className="text-blue-300 text-sm mt-0.5">
                {data.clientName || 'Sin cliente asignado'}
                {data.purchaseOrder ? ` · OC: ${data.purchaseOrder}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <button
                  onClick={handleSave}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold"
                >
                  Guardar
                </button>
              )}
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Status selector */}
        <div className="flex gap-2 px-6 py-3 bg-slate-50 border-b border-slate-200 overflow-x-auto shrink-0">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => update({ status: opt.id })}
              className={`px-3 py-1 rounded-full text-xs border whitespace-nowrap transition-all ${
                data.status === opt.id ? opt.activeCls : `bg-white ${opt.cls}`
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
              {tab.id === 'cotizacion' && quotedTotal > 0 && (
                <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">
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
            <FotosTab
              data={data}
              onPhotoUpload={handlePhotoUpload}
              onRemovePhoto={removePhoto}
            />
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl shrink-0">
          <button
            onClick={() => onDelete(chassis.id)}
            className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
          >
            Eliminar chasis
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium"
            >
              Cerrar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors"
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
        <select
          className={inp}
          value={data.size}
          onChange={e => update({ size: e.target.value as ChassisSize })}
        >
          {Object.entries(SIZE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Condición General">
        <select
          className={inp}
          value={data.condition}
          onChange={e => update({ condition: e.target.value as ChassisCondition })}
        >
          {Object.entries(CONDITION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Fecha Compromiso de Entrega">
        <input
          type="date"
          className={inp}
          value={data.commitmentDate}
          onChange={e => update({ commitmentDate: e.target.value })}
        />
      </Field>
      <Field label="Fecha de Entrega Real">
        <input
          type="date"
          className={inp}
          value={data.deliveryDate}
          onChange={e => update({ deliveryDate: e.target.value })}
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
    emptyBg: string;
  }> = [
    {
      key: 'photosBefore',
      label: 'Fotos Antes',
      hint: 'Estado inicial del chasis al recibirlo',
      emptyBorder: 'border-blue-300',
      emptyBg: 'bg-blue-50',
    },
    {
      key: 'photosDetail',
      label: 'Fotos de Detalles',
      hint: 'Áreas específicas de daño o trabajo requerido',
      emptyBorder: 'border-amber-300',
      emptyBg: 'bg-amber-50',
    },
    {
      key: 'photosAfter',
      label: 'Fotos Después',
      hint: 'Estado final tras completar la reparación',
      emptyBorder: 'border-green-300',
      emptyBg: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-8">
      {sections.map(sec => (
        <div key={sec.key}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-slate-700">{sec.label}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{sec.hint}</p>
            </div>
            {data[sec.key].length > 0 && (
              <label className="cursor-pointer flex items-center gap-1.5 text-sm bg-white border border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg transition-colors">
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
                  className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm"
                >
                  <img
                    src={src}
                    alt={`${sec.label} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => onRemovePhoto(sec.key, i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <label
              className={`flex flex-col items-center justify-center border-2 border-dashed ${sec.emptyBorder} ${sec.emptyBg} rounded-xl py-10 cursor-pointer hover:opacity-75 transition-opacity`}
            >
              <span className="text-4xl mb-2">📷</span>
              <p className="text-sm text-slate-500">Click para subir fotos</p>
              <p className="text-xs text-slate-400 mt-0.5">PNG, JPG — máx 6 fotos</p>
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
  const combinedMultiplier = Math.round(sizeMultiplier * conditionMultiplier * 100) / 100;

  return (
    <div className="space-y-6">
      {/* Multipliers panel */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-700 text-sm mb-3">Factores de ajuste de precio</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
            <p className="text-xs text-slate-500 mb-1">Tamaño</p>
            <p className="font-semibold text-slate-800 text-sm">{SIZE_LABELS[data.size]?.split(' ')[0]}</p>
            <p className="text-sm text-orange-600 font-mono mt-1">×{sizeMultiplier}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
            <p className="text-xs text-slate-500 mb-1">Condición</p>
            <p className="font-semibold text-slate-800 text-sm">
              {CONDITION_LABELS[data.condition]?.split(' ')[0]}
            </p>
            <p className="text-sm text-orange-600 font-mono mt-1">×{conditionMultiplier}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200 text-center">
            <p className="text-xs text-orange-600 mb-1">Factor combinado</p>
            <p className="font-bold text-orange-700 text-xl mt-1">×{combinedMultiplier}</p>
          </div>
        </div>
      </div>

      {/* Services list */}
      <div>
        <h3 className="font-semibold text-slate-700 text-sm mb-3">Servicios</h3>
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
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!sel}
                  onChange={() => toggleService(svc.id)}
                  className="w-4 h-4 accent-orange-500 shrink-0 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${sel ? 'text-orange-800' : 'text-slate-700'}`}>
                    {svc.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{svc.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-slate-500 whitespace-nowrap">
                      {formatCurrency(unitPrice)}/{svc.unit}
                    </p>
                    {sel && (
                      <p className="text-sm font-bold text-orange-600">{formatCurrency(subtotal)}</p>
                    )}
                  </div>
                  {sel && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQty(svc.id, sel.quantity - 1)}
                        className="w-7 h-7 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-50 font-bold leading-none"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-mono font-bold">
                        {sel.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(svc.id, sel.quantity + 1)}
                        className="w-7 h-7 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-50 font-bold leading-none"
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

      {/* Total summary */}
      {quotedTotal > 0 && (
        <div className="bg-white border-2 border-orange-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Total cotizado</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {data.selectedServices.length} servicio
                {data.selectedServices.length !== 1 ? 's' : ''} seleccionado
                {data.selectedServices.length !== 1 ? 's' : ''}
              </p>
            </div>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(quotedTotal)}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Precio final acordado (sobreescribe la cotización)
            </label>
            <input
              type="number"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
              value={data.finalPrice ?? ''}
              onChange={e =>
                update({ finalPrice: e.target.value ? Number(e.target.value) : null })
              }
              placeholder={`Cotización calculada: ${formatCurrency(quotedTotal)}`}
              min={0}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Field helper ─────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
