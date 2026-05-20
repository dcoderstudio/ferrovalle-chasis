'use client';

import { useState } from 'react';
import type { Chassis, ChassisStatus, ChassisSize, ChassisCondition } from '../types';
// ChassisSize and ChassisCondition used in cast expressions below
import {
  SERVICES,
  CATEGORIES,
  SIZE_MULTIPLIERS,
  CONDITION_MULTIPLIERS,
  SIZE_LABELS,
  CONDITION_LABELS,
  type Service,
} from '../services-catalog';
import { PillGrid, DatePicker, type PillOption } from './FormControls';

const SIZE_OPTIONS: PillOption[] = [
  { value: 'pequeño', label: '20 ft' },
  { value: 'grande', label: '40 ft' },
];

const CONDITION_OPTIONS: PillOption[] = [
  { value: 'bueno', label: 'Buenas condiciones' },
  { value: 'moderado', label: 'Desgaste moderado' },
  { value: 'severo', label: 'Deterioro severo' },
  { value: 'critico', label: 'Estado crítico' },
];

type Tab = 'info' | 'fotos' | 'avance' | 'diagnostico' | 'cotizacion';

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
  const serviceUnitPrice = (svc: Service) =>
    Math.round(svc.basePrice * (svc.affectedBySize ? sizeMultiplier : 1) * conditionMultiplier);

  const quotedTotal = data.selectedServices.reduce((sum, sel) => {
    const svc = SERVICES.find(s => s.id === sel.serviceId);
    return svc ? sum + serviceUnitPrice(svc) * sel.quantity : sum;
  }, 0);

  const TABS: Array<{ id: Tab; label: string }> = [
    { id: 'info', label: 'Información' },
    { id: 'fotos', label: 'Fotos' },
    { id: 'avance', label: 'Avance' },
    { id: 'diagnostico', label: 'Diagnóstico' },
    { id: 'cotizacion', label: 'Cotización' },
  ];

  const generateDiagnosisPDF = () => {
    const today = new Date().toLocaleDateString('es-MX', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
    const selectedList = data.selectedServices.map(sel => {
      const svc = SERVICES.find(s => s.id === sel.serviceId);
      if (!svc) return null;
      return { name: svc.name, quantity: sel.quantity, total: serviceUnitPrice(svc) * sel.quantity };
    }).filter(Boolean);

    const chassisSVG = `<svg viewBox="0 0 800 210" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="800" height="210" fill="#f8fafc" rx="8"/>
      <rect x="30" y="68" width="740" height="18" rx="3" fill="#1e3a5f"/>
      <rect x="30" y="124" width="740" height="18" rx="3" fill="#1e3a5f"/>
      <rect x="30" y="62" width="20" height="96" rx="3" fill="#0f2746"/>
      <rect x="750" y="62" width="20" height="96" rx="3" fill="#0f2746"/>
      <rect x="50" y="86" width="700" height="48" fill="#e8f0fa" opacity="0.5"/>
      <rect x="143" y="68" width="9" height="74" fill="#2a5080"/>
      <rect x="258" y="68" width="9" height="74" fill="#2a5080"/>
      <rect x="373" y="68" width="9" height="74" fill="#2a5080"/>
      <rect x="488" y="68" width="9" height="74" fill="#2a5080"/>
      <rect x="603" y="68" width="9" height="74" fill="#2a5080"/>
      <rect x="718" y="68" width="9" height="74" fill="#2a5080"/>
      <polygon points="50,62 82,62 50,94" fill="#2a5080" opacity="0.55"/>
      <polygon points="750,62 718,62 750,94" fill="#2a5080" opacity="0.55"/>
      <polygon points="50,158 82,158 50,126" fill="#2a5080" opacity="0.55"/>
      <polygon points="750,158 718,158 750,126" fill="#2a5080" opacity="0.55"/>
      <circle cx="65" cy="76" r="5" fill="#dde6f5"/>
      <circle cx="65" cy="144" r="5" fill="#dde6f5"/>
      <circle cx="735" cy="76" r="5" fill="#dde6f5"/>
      <circle cx="735" cy="144" r="5" fill="#dde6f5"/>
      <rect x="278" y="84" width="244" height="52" rx="6" fill="#0f2746"/>
      <rect x="282" y="88" width="236" height="44" rx="4" fill="#1e3a5f"/>
      <text x="400" y="108" text-anchor="middle" font-family="Montserrat,Arial,sans-serif" font-size="10" fill="#94a3b8" font-weight="600" letter-spacing="3">FERROVALLE</text>
      <text x="400" y="126" text-anchor="middle" font-family="Montserrat,Arial,sans-serif" font-size="18" fill="#f97316" font-weight="800">#${data.chassisNumber || '—'}</text>
      <line x1="30" y1="42" x2="770" y2="42" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,3"/>
      <line x1="30" y1="37" x2="30" y2="47" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="770" y1="37" x2="770" y2="47" stroke="#94a3b8" stroke-width="1.5"/>
      <text x="400" y="38" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" fill="#94a3b8">Longitud total del chasis</text>
      <text x="400" y="200" text-anchor="middle" font-family="Montserrat,Arial,sans-serif" font-size="10" fill="#64748b">${SIZE_LABELS[data.size] ?? data.size} · ${CONDITION_LABELS[data.condition] ?? data.condition}</text>
    </svg>`;

    const servicesRows = selectedList.length > 0
      ? selectedList.map(s => `<tr><td>${s!.name}</td><td style="text-align:center">${s!.quantity}</td><td style="text-align:right;font-weight:600;color:#1e3a5f">${formatCurrency(s!.total)}</td></tr>`).join('')
      : `<tr><td colspan="3" style="color:#94a3b8;font-style:italic;text-align:center">No se han seleccionado servicios aún</td></tr>`;

    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
    <title>Diagnóstico — Chasis #${data.chassisNumber}</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Montserrat',sans-serif;color:#1e293b;background:#fff;padding:40px;font-size:13px}
      .hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:18px;border-bottom:3px solid #1e3a5f}
      .co{font-size:26px;font-weight:800;color:#1e3a5f;letter-spacing:-0.5px}
      .co-sub{font-size:11px;color:#64748b;margin-top:3px}
      .dt h2{font-size:15px;font-weight:700;color:#f97316;text-transform:uppercase;letter-spacing:1px;text-align:right}
      .dt p{font-size:11px;color:#64748b;margin-top:3px;text-align:right}
      .sec{margin-bottom:22px}
      .sec-title{font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid #e2e8f0}
      .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
      .fi label{font-size:9px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:2px}
      .fi span{font-size:14px;font-weight:600;color:#1e293b}
      .drawing{background:#f8fafc;border-radius:10px;padding:16px;border:1px solid #e2e8f0;margin:4px 0}
      .drawing svg{width:100%;height:auto}
      table{width:100%;border-collapse:collapse}
      thead th{background:#1e3a5f;color:#fff;padding:9px 12px;font-size:10px;font-weight:700;text-align:left;text-transform:uppercase;letter-spacing:1px}
      tbody td{padding:9px 12px;border-bottom:1px solid #f1f5f9;font-size:12px}
      tbody tr:nth-child(even){background:#f8fafc}
      .total-bar{display:flex;justify-content:flex-end;align-items:center;gap:20px;padding:12px 14px;background:#1e3a5f;border-radius:0 0 6px 6px;margin-top:0}
      .tl{font-size:12px;font-weight:600;color:#e2e8f0}
      .ta{font-size:22px;font-weight:800;color:#f97316}
      .notes{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;min-height:50px;font-size:13px;color:#475569;line-height:1.6}
      .footer{margin-top:36px;padding-top:18px;border-top:1px solid #e2e8f0;display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
      .sign label{font-size:9px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:22px}
      .sign-line{border-top:1px solid #94a3b8}
      @media print{body{padding:20px}@page{margin:12mm}}
    </style></head><body>
    <div class="hdr">
      <div><div class="co">FERROVALLE</div><div class="co-sub">Mantenimiento y Reparación de Chasis de Grúas</div></div>
      <div class="dt"><h2>Diagnóstico Técnico</h2><p>Fecha: ${today}</p></div>
    </div>
    <div class="sec">
      <div class="sec-title">Información del Chasis</div>
      <div class="grid">
        <div class="fi"><label>Número de Chasis</label><span>#${data.chassisNumber || '—'}</span></div>
        <div class="fi"><label>Tamaño</label><span>${SIZE_LABELS[data.size] ?? data.size}</span></div>
        <div class="fi"><label>Condición</label><span>${CONDITION_LABELS[data.condition] ?? data.condition}</span></div>
        ${data.clientName ? `<div class="fi"><label>Cliente</label><span>${data.clientName}</span></div>` : ''}
        ${data.purchaseOrder ? `<div class="fi"><label>OC</label><span>${data.purchaseOrder}</span></div>` : ''}
        ${data.commitmentDate ? `<div class="fi"><label>Entrega compromiso</label><span>${new Date(data.commitmentDate+'T12:00:00').toLocaleDateString('es-MX',{day:'2-digit',month:'long',year:'numeric'})}</span></div>` : ''}
      </div>
    </div>
    <div class="sec">
      <div class="sec-title">Identificación del Chasis</div>
      <div class="drawing">${chassisSVG}</div>
    </div>
    <div class="sec">
      <div class="sec-title">Servicios Requeridos</div>
      <table><thead><tr><th>Servicio</th><th style="text-align:center">Cantidad</th><th style="text-align:right">Total estimado</th></tr></thead>
      <tbody>${servicesRows}</tbody></table>
      ${selectedList.length > 0 ? `<div class="total-bar"><span class="tl">Total estimado</span><span class="ta">${formatCurrency(quotedTotal)}</span></div>` : ''}
    </div>
    ${data.notes ? `<div class="sec"><div class="sec-title">Observaciones</div><div class="notes">${data.notes}</div></div>` : ''}
    <div class="footer">
      <div class="sign"><label>Técnico responsable</label><div class="sign-line"></div></div>
      <div class="sign"><label>Fecha</label><div class="sign-line"></div></div>
      <div class="sign"><label>Firma / Vo.Bo.</label><div class="sign-line"></div></div>
    </div>
    </body></html>`;

    const win = window.open('', '_blank', 'width=920,height=720');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 900);
  };

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

        {/* Status stepper (read-only) */}
        <StatusStepper status={data.status} />

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
          {activeTab === 'avance' && (
            <AvanceTab data={data} update={update} />
          )}
          {activeTab === 'fotos' && (
            <FotosTab data={data} onPhotoUpload={handlePhotoUpload} onRemovePhoto={removePhoto} />
          )}
          {activeTab === 'diagnostico' && (
            <DiagnosticoTab
              data={data}
              toggleService={toggleService}
              updateQty={updateQty}
              serviceUnitPrice={serviceUnitPrice}
              quotedTotal={quotedTotal}
              onGeneratePDF={generateDiagnosisPDF}
            />
          )}
          {activeTab === 'cotizacion' && (
            <CotizacionTab
              data={data}
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
            rows={3}
            value={data.notes}
            onChange={e => update({ notes: e.target.value })}
            placeholder="Detalles del estado, observaciones, instrucciones especiales..."
          />
        </Field>
      </div>

      {/* Separador documentos */}
      <div className="sm:col-span-2 pt-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Documentos y responsable</p>
        <div className="mt-3 h-px bg-white/[0.06]" />
      </div>

      <div className="sm:col-span-2">
        <Field label="Solicitado / Autorizado por">
          <input
            className={inp}
            value={data.requestedBy ?? ''}
            onChange={e => update({ requestedBy: e.target.value })}
            placeholder="Nombre del responsable o solicitante"
          />
        </Field>
      </div>

      <div>
        <Field label="PDF Orden de Compra">
          <PdfUpload
            dataUrl={data.pdfPurchaseOrder ?? ''}
            name={data.pdfPurchaseOrderName ?? ''}
            onUpload={(url, name) => update({ pdfPurchaseOrder: url, pdfPurchaseOrderName: name })}
            onRemove={() => update({ pdfPurchaseOrder: '', pdfPurchaseOrderName: '' })}
          />
        </Field>
      </div>

      <div>
        <Field label="PDF Cotización Final">
          <PdfUpload
            dataUrl={data.pdfQuotation ?? ''}
            name={data.pdfQuotationName ?? ''}
            onUpload={(url, name) => update({ pdfQuotation: url, pdfQuotationName: name })}
            onRemove={() => update({ pdfQuotation: '', pdfQuotationName: '' })}
          />
        </Field>
      </div>
    </div>
  );
}

// ─── PDF Upload helper ────────────────────────────────────────────────────────

function PdfUpload({
  dataUrl,
  name,
  onUpload,
  onRemove,
}: {
  dataUrl: string;
  name: string;
  onUpload: (url: string, name: string) => void;
  onRemove: () => void;
}) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onUpload(reader.result as string, file.name);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (dataUrl) {
    return (
      <div className="flex items-center gap-3 bg-[#1a2235] border border-white/[0.08] rounded-xl p-3">
        <div className="w-8 h-8 bg-red-500/15 rounded-lg flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-red-400">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <p className="flex-1 text-white text-xs font-medium truncate min-w-0">{name}</p>
        <a
          href={dataUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 font-medium shrink-0 transition-colors"
        >
          Ver
        </a>
        <button
          onClick={onRemove}
          className="text-slate-600 hover:text-red-400 text-xs shrink-0 transition-colors"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <label className="flex items-center gap-3 bg-[#1a2235] border border-dashed border-white/[0.08] hover:border-white/20 rounded-xl p-3 cursor-pointer transition-all">
      <div className="w-8 h-8 bg-white/[0.04] rounded-lg flex items-center justify-center shrink-0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-600">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">Subir archivo PDF</p>
        <p className="text-[10px] text-slate-700 mt-0.5">Máx 10 MB</p>
      </div>
      <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFile} />
    </label>
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

// ─── Diagnóstico Tab ──────────────────────────────────────────────────────────

function DiagnosticoTab({
  data,
  toggleService,
  updateQty,
  serviceUnitPrice,
  quotedTotal,
  onGeneratePDF,
}: {
  data: Chassis;
  toggleService: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  serviceUnitPrice: (svc: Service) => number;
  quotedTotal: number;
  onGeneratePDF: () => void;
}) {
  const [search, setSearch] = useState('');
  const sizeMultiplier = SIZE_MULTIPLIERS[data.size] ?? 1;
  const conditionMultiplier = CONDITION_MULTIPLIERS[data.condition] ?? 1;
  const combined = Math.round(sizeMultiplier * conditionMultiplier * 100) / 100;

  const q = search.toLowerCase();
  const filtered = q
    ? SERVICES.filter(s => s.name.toLowerCase().includes(q))
    : null;

  const renderService = (svc: Service) => {
    const sel = data.selectedServices.find(s => s.serviceId === svc.id);
    const unitPrice = serviceUnitPrice(svc);
    const subtotal = sel ? unitPrice * sel.quantity : 0;
    return (
      <div
        key={svc.id}
        className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
          sel ? 'border-orange-400/25 bg-orange-400/[0.06]' : 'border-white/[0.05] hover:border-white/10'
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
          <p className={`text-xs font-medium leading-tight ${sel ? 'text-orange-200' : 'text-slate-300'}`}>
            {svc.name}
          </p>
          <span
            className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
              svc.affectedBySize
                ? 'bg-blue-500/15 text-blue-400'
                : 'bg-white/[0.06] text-slate-600'
            }`}
          >
            {svc.affectedBySize ? '×Tamaño' : 'Precio fijo'}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <p className="text-xs text-slate-600 whitespace-nowrap">{formatCurrency(unitPrice)}</p>
            {sel && <p className="text-xs font-bold text-orange-400">{formatCurrency(subtotal)}</p>}
          </div>
          {sel && (
            <div className="flex items-center gap-0.5">
              <button onClick={() => updateQty(svc.id, sel.quantity - 1)}
                className="w-6 h-6 bg-white/[0.05] border border-white/[0.08] hover:bg-white/10 rounded-lg text-xs text-white font-bold">−</button>
              <span className="w-7 text-center text-xs font-mono font-bold text-white">{sel.quantity}</span>
              <button onClick={() => updateQty(svc.id, sel.quantity + 1)}
                className="w-6 h-6 bg-white/[0.05] border border-white/[0.08] hover:bg-white/10 rounded-lg text-xs text-white font-bold">+</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Factor panel */}
      <div className="rounded-xl border border-white/[0.06] p-3" style={{ background: '#141b2d' }}>
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Factores de precio</p>
        <div className="grid grid-cols-3 gap-2">
          <MultiplierCard label="Tamaño" value={SIZE_LABELS[data.size] ?? data.size} multiplier={`×${sizeMultiplier}`} />
          <MultiplierCard label="Condición" value={CONDITION_LABELS[data.condition]?.split(' ')[0] ?? data.condition} multiplier={`×${conditionMultiplier}`} />
          <div className="rounded-xl p-2.5 border border-orange-400/20 text-center" style={{ background: 'rgba(249,115,22,0.08)' }}>
            <p className="text-[10px] text-orange-400/70 mb-0.5">Factor total</p>
            <p className="font-bold text-orange-300 text-xl">×{combined}</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-600 mt-2">
          <span className="text-blue-400 font-semibold">●</span> ×Tamaño: el precio varía según 20 ft / 40 ft &nbsp;·&nbsp;
          <span className="text-slate-500 font-semibold">●</span> Precio fijo: el mismo independiente del tamaño
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className="w-full bg-[#1a2235] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          placeholder="Buscar servicio..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white text-sm">✕</button>
        )}
      </div>

      {/* Services list */}
      {filtered ? (
        <div className="space-y-1.5">
          {filtered.length === 0 ? (
            <p className="text-center text-slate-600 text-sm py-6">Sin resultados para &ldquo;{search}&rdquo;</p>
          ) : (
            filtered.map(renderService)
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {CATEGORIES.map(cat => {
            const svcs = SERVICES.filter(s => s.category === cat);
            if (svcs.length === 0) return null;
            return (
              <div key={cat}>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-0.5">{cat}</p>
                <div className="space-y-1.5">{svcs.map(renderService)}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Running total */}
      {quotedTotal > 0 && (
        <div className="sticky bottom-0 flex items-center justify-between rounded-xl border border-orange-400/20 px-4 py-3"
          style={{ background: 'rgba(15,20,32,0.95)', backdropFilter: 'blur(8px)' }}>
          <div>
            <p className="text-xs text-slate-400">{data.selectedServices.length} servicio{data.selectedServices.length !== 1 ? 's' : ''} seleccionado{data.selectedServices.length !== 1 ? 's' : ''}</p>
          </div>
          <p className="text-xl font-bold text-orange-400">{formatCurrency(quotedTotal)}</p>
        </div>
      )}

      {/* PDF Button */}
      <button
        onClick={onGeneratePDF}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.08] text-sm font-semibold text-slate-300 hover:text-white hover:border-white/20 transition-all"
        style={{ background: '#141b2d' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
        Descargar PDF de diagnóstico
      </button>
    </div>
  );
}

// ─── Cotización Tab (solo lectura) ────────────────────────────────────────────

function CotizacionTab({
  data,
  serviceUnitPrice,
  quotedTotal,
}: {
  data: Chassis;
  serviceUnitPrice: (svc: Service) => number;
  quotedTotal: number;
}) {
  if (data.selectedServices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-slate-600">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
            <line x1="9" y1="12" x2="15" y2="12"/>
            <line x1="9" y1="16" x2="12" y2="16"/>
          </svg>
        </div>
        <p className="text-slate-400 text-sm font-medium">Sin servicios seleccionados</p>
        <p className="text-slate-700 text-xs mt-1.5 max-w-xs">
          Ve a la pestaña <strong className="text-slate-500">Diagnóstico</strong> para marcar los servicios que requiere este chasis
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Servicios seleccionados
      </p>

      {data.selectedServices.map(sel => {
        const svc = SERVICES.find(s => s.id === sel.serviceId);
        if (!svc) return null;
        const unitPrice = serviceUnitPrice(svc);
        const subtotal = unitPrice * sel.quantity;
        return (
          <div
            key={sel.serviceId}
            className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06]"
            style={{ background: '#141b2d' }}
          >
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm">{svc.name}</p>
              <p className="text-slate-500 text-xs mt-0.5">
                {sel.quantity} × {formatCurrency(unitPrice)}
              </p>
            </div>
            <p className="text-orange-400 font-bold text-sm shrink-0 ml-4">
              {formatCurrency(subtotal)}
            </p>
          </div>
        );
      })}

      {/* Totales */}
      <div
        className="rounded-xl border-2 border-orange-400/20 p-5 mt-2"
        style={{ background: 'rgba(249,115,22,0.06)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Total cotizado</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {data.selectedServices.length} servicio{data.selectedServices.length !== 1 ? 's' : ''}
            </p>
          </div>
          <p className="text-3xl font-bold text-orange-400">{formatCurrency(quotedTotal)}</p>
        </div>
        {data.finalPrice != null && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
            <p className="text-sm text-slate-400">Precio final acordado</p>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(data.finalPrice)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Status Stepper ───────────────────────────────────────────────────────────

const STEPS: Array<{ id: ChassisStatus; label: string; color: string }> = [
  { id: 'recibido',      label: 'Chasis',        color: '#22d3ee' },
  { id: 'diagnostico',   label: 'Diagnóstico',  color: '#60a5fa' },
  { id: 'en-reparacion', label: 'Reparación',   color: '#fb923c' },
  { id: 'acabados',      label: 'Pintura',       color: '#c084fc' },
  { id: 'inspeccion',    label: 'Insp. Final',  color: '#f472b6' },
  { id: 'entregado',     label: 'Entregado',    color: '#4ade80' },
];

function StatusStepper({ status }: { status: ChassisStatus }) {
  const currentIdx = STEPS.findIndex(s => s.id === status);
  return (
    <div className="flex items-start px-6 py-3 border-b border-white/[0.06] bg-[#0a0f1a] overflow-x-auto shrink-0 gap-0">
      {STEPS.map((step, i) => {
        const isPast = i < currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={step.id} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className="rounded-full transition-all flex items-center justify-center"
                style={{
                  width: isCurrent ? 20 : 12,
                  height: isCurrent ? 20 : 12,
                  background: isCurrent ? step.color : isPast ? step.color + '70' : 'rgba(255,255,255,0.08)',
                  boxShadow: isCurrent ? `0 0 12px ${step.color}60` : undefined,
                }}
              >
                {isPast && (
                  <svg viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="2" style={{ width: 7, height: 7 }}>
                    <polyline points="1 4 3.5 6.5 7 1.5" />
                  </svg>
                )}
              </div>
              <span style={{
                fontSize: 9,
                fontWeight: isCurrent ? 700 : 400,
                color: isCurrent ? 'white' : isPast ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)',
                whiteSpace: 'nowrap',
              }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px mx-1 mb-3" style={{
                background: i < currentIdx ? STEPS[i].color + '50' : 'rgba(255,255,255,0.06)',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Avance Tab ───────────────────────────────────────────────────────────────

function AvanceTab({ data, update }: { data: Chassis; update: (f: Partial<Chassis>) => void }) {
  const selected = data.selectedServices;
  const completed = data.completedServices ?? [];
  const total = selected.length;
  const done = selected.filter(s => completed.includes(s.serviceId)).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const toggle = (serviceId: string) => {
    const already = completed.includes(serviceId);
    update({
      completedServices: already
        ? completed.filter(id => id !== serviceId)
        : [...completed, serviceId],
    });
  };

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-slate-600">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
          </svg>
        </div>
        <p className="text-slate-400 text-sm font-medium">Sin servicios asignados</p>
        <p className="text-slate-700 text-xs mt-1.5">Ve a <strong className="text-slate-500">Diagnóstico</strong> para seleccionar los servicios del chasis</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress circle */}
      <div className="flex flex-col items-center pt-2 pb-2">
        <ProgressCircle pct={pct} done={done} total={total} />
        {pct === 100 && (
          <p className="text-emerald-400 text-sm font-semibold mt-3">¡Todos los servicios completados!</p>
        )}
      </div>

      {/* Service checklist */}
      <div>
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Servicios — toca para marcar como realizado
        </p>
        <div className="space-y-2">
          {selected.map(sel => {
            const svc = SERVICES.find(s => s.id === sel.serviceId);
            if (!svc) return null;
            const isDone = completed.includes(sel.serviceId);
            return (
              <button
                key={sel.serviceId}
                type="button"
                onClick={() => toggle(sel.serviceId)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  isDone ? 'border-emerald-400/30' : 'border-white/[0.06] hover:border-white/[0.12]'
                }`}
                style={{ background: isDone ? 'rgba(74,222,128,0.06)' : '#141b2d' }}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all"
                  style={{
                    background: isDone ? '#4ade80' : 'rgba(255,255,255,0.07)',
                    border: isDone ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {isDone && (
                    <svg viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2.5" className="w-3 h-3">
                      <polyline points="1.5 5 4 7.5 8.5 2" />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm font-medium flex-1 transition-all ${
                    isDone ? 'line-through opacity-50' : ''
                  }`}
                  style={{ color: isDone ? '#4ade80' : '#cbd5e1' }}
                >
                  {svc.name}
                </span>
                {sel.quantity > 1 && (
                  <span className="text-xs text-slate-600 shrink-0">×{sel.quantity}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProgressCircle({ pct, done, total }: { pct: number; done: number; total: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct === 100 ? '#4ade80' : pct > 50 ? '#f97316' : '#60a5fa';
  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-white">{pct}%</span>
        <span className="text-xs text-slate-500 mt-0.5">{done} de {total}</span>
      </div>
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
