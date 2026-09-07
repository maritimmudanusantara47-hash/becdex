"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Save, Eye, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useTranslation } from "@/store/lang";

type TemplateConfig = {
  [key: string]: {
    x: number;
    y: number;
    fontSize: number;
    color: string;
    textAlign: "left" | "center" | "right";
    fontFamily: string;
    fontWeight?: string;
    width: string;
    text?: string;
  };
};

const DEFAULT_CONFIG: TemplateConfig = {
  mmic_code: { x: 74, y: 12.3, fontSize: 12, color: "#000000", textAlign: "right", fontFamily: "Helvetica", fontWeight: "bold", width: "auto", text: "BICCID002072026" },
  company_name: { x: 17, y: 28.5, fontSize: 20, color: "#000000", textAlign: "left", fontFamily: "Helvetica", fontWeight: "bold", width: "80%", text: "PT Eco Karya Teknologi (Crustea Indonesia)" },
  company_address: { x: 17, y: 31, fontSize: 10, color: "#000000", textAlign: "left", fontFamily: "Helvetica", fontWeight: "bold", width: "80%", text: "Jl. Griya Lestari No.19 Blok D3, Gondoriyo, Ngaliyan, Semarang" },
  company_sector: { x: 39, y: 62.5, fontSize: 13, color: "#000000", textAlign: "left", fontFamily: "Helvetica", fontWeight: "bold", width: "auto", text: "Perikanan Tangkap dan Budidaya" },
  company_sector_en: { x: 39, y: 64.5, fontSize: 13, color: "#000000", textAlign: "left", fontFamily: "Helvetica", fontWeight: "bold", width: "auto", text: "Marine Fisheries and Aquaculture" },
  published_date_1: { x: 23, y: 92.5, fontSize: 9, color: "#000000", textAlign: "center", fontFamily: "Helvetica", fontWeight: "bold", width: "auto", text: "29 Agustus 2026" },
  valid_until: { x: 40, y: 92.5, fontSize: 9, color: "#000000", textAlign: "center", fontFamily: "Helvetica", fontWeight: "bold", width: "auto", text: "sampai 28 Agustus 2029" },
  published_date_2: { x: 30, y: 95.8, fontSize: 9, color: "#000000", textAlign: "center", fontFamily: "Helvetica", fontWeight: "bold", width: "auto", text: "29 Agustus 2026" },
  published_date_1_en: { x: 23, y: 94, fontSize: 9, color: "#000000", textAlign: "center", fontFamily: "Helvetica", fontWeight: "bold", width: "auto", text: "29 August 2026" },
  valid_until_en: { x: 40, y: 94, fontSize: 9, color: "#000000", textAlign: "center", fontFamily: "Helvetica", fontWeight: "bold", width: "auto", text: "until 28 August 2029" },
  published_date_2_en: { x: 30, y: 97.4, fontSize: 9, color: "#000000", textAlign: "center", fontFamily: "Helvetica", fontWeight: "bold", width: "auto", text: "29 August 2026" },
  qr_code: { x: 70, y: 78.5, fontSize: 75, color: "#000000", textAlign: "center", fontFamily: "Helvetica", fontWeight: "bold", width: "auto", text: "[QR CODE]" },
};

interface Template {
  id: number;
  background_path?: string;
  config?: TemplateConfig;
}

export default function CertificateDesignerPage() {
  const { t } = useTranslation();
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  
  // Canvas state
  const canvasRef = useRef<HTMLDivElement>(null);
  const [bgCategory, setBgCategory] = useState<string>("excellent");
  const bgImage = activeTemplate?.background_path
    ? `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api\/?$/, '')}/storage/${activeTemplate.background_path}?v=20260812_3`
    : `/certificate/${bgCategory}.jpg?v=20260812_3`;

  // Config state
  const [config, setConfig] = useState<TemplateConfig>(DEFAULT_CONFIG);

  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // Fetch active template on load
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await api.get("/admin/certificate-templates");
        const templates = res.data.data;
        if (templates && templates.length > 0) {
          const active = templates.find((t: {is_active: boolean}) => t.is_active) || templates[0];
          if (active) {
            setActiveTemplate(active);
            if (active.config) {
              setConfig(prev => {
                const merged: TemplateConfig = { ...prev };
                Object.keys(active.config).forEach((k) => {
                  merged[k] = {
                    ...prev[k],
                    ...active.config[k],
                    text: active.config[k]?.text || prev[k]?.text || k,
                  };
                });
                return merged;
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to load templates", err);
      }
    };
    fetchTemplates();
  }, []);

  // Keyboard arrow key navigation for selected element
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedElement) return;
    // Don't intercept if user is typing in an input/select/textarea
    const tag = (e.target as HTMLElement).tagName.toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea') return;

    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (!arrowKeys.includes(e.key)) return;

    e.preventDefault(); // prevent page scroll
    const step = e.shiftKey ? 1 : 0.1;

    setConfig(prev => {
      const el = prev[selectedElement];
      let { x, y } = el;
      if (e.key === 'ArrowUp')    y = Math.round((y - step) * 10) / 10;
      if (e.key === 'ArrowDown')  y = Math.round((y + step) * 10) / 10;
      if (e.key === 'ArrowLeft')  x = Math.round((x - step) * 10) / 10;
      if (e.key === 'ArrowRight') x = Math.round((x + step) * 10) / 10;
      return { ...prev, [selectedElement]: { ...el, x, y } };
    });
  }, [selectedElement]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", "Default Certificate Design");
      formData.append("config", JSON.stringify(config));
      formData.append("is_active", "1");

      if (activeTemplate) {
        formData.append("_method", "PUT");
        const res = await api.post(`/admin/certificate-templates/${activeTemplate.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setActiveTemplate(res.data.data);
        toast.success(t.dash_admin_cert_designer_toast_update_success || "Desain sertifikat berhasil diperbarui.");
      } else {
        const res = await api.post("/admin/certificate-templates", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setActiveTemplate(res.data.data);
        toast.success(t.dash_admin_cert_designer_toast_create_success || "Desain sertifikat baru berhasil dibuat.");
      }
    } catch (err) {
      console.error(err);
      toast.error(t.dash_admin_cert_designer_toast_save_error || "Gagal menyimpan desain sertifikat.");
    }
  };

  const handlePreview = async () => {
    if (!activeTemplate) {
      toast.error(t.dash_admin_cert_designer_toast_save_first || "Harap simpan desain terlebih dahulu untuk melihat pratinjau PDF.");
      return;
    }
    
    try {
      const toastId = toast.loading(t.dash_admin_cert_designer_toast_loading_pdf || "Memuat pratinjau PDF...");
      const response = await api.get(`/admin/certificate-templates/${activeTemplate.id}/preview`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      toast.dismiss(toastId);
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error(t.dash_admin_cert_designer_toast_pdf_error || "Gagal memuat pratinjau PDF.");
    }
  };

  const handleResetDefault = () => {
    if (confirm(t.dash_admin_cert_designer_reset_confirm || "Apakah Anda yakin ingin mereset layout elemen ke posisi & teks standar terbaru?")) {
      setConfig(DEFAULT_CONFIG);
      toast.info(t.dash_admin_cert_designer_reset_info || "Layout berhasil di-reset ke standar. Klik 'Simpan Desain' untuk menerapkan ke database.");
    }
  };

  return (
    <AppLayout title={t.dash_admin_cert_designer_title || "Certificate Designer"}>
      <div className="flex flex-col md:flex-row gap-6 h-full min-h-[80vh]">
        
        {/* Canvas Area (A4 Landscape aspect ratio = 1.414) */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-extrabold text-slate-800 dark:text-white">{t.dash_admin_cert_designer_visual_editor || "Visual Editor"}</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500">{t.dash_admin_cert_designer_preview_bg || "Preview Latar:"}</span>
              <select 
                value={bgCategory}
                onChange={(e) => setBgCategory(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg text-xs font-bold border border-slate-200 shadow-sm text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="standard">Standard</option>
              </select>
            </div>
          </div>

          <div 
            className="w-full relative bg-white shadow-xl mx-auto shrink-0"
            style={{ aspectRatio: "210/297", maxWidth: "600px", containerType: 'inline-size' }}
            ref={canvasRef}
          >
            {bgImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bgImage} alt="Background" className="absolute inset-0 w-full h-full object-fill pointer-events-none" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold border-2 border-dashed border-slate-300 bg-slate-50">
                {t.dash_admin_cert_designer_upload_bg || "Upload A4 Landscape Background"}
              </div>
            )}

            {Object.entries(config).map(([key, style]) => (
              <div
                key={key}
                onClick={() => setSelectedElement(key)}
                className={`absolute cursor-pointer select-none ${selectedElement === key ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-1 hover:ring-slate-400'}`}
                style={{
                  left: `${style.x}%`,
                  top: `${style.y}%`,
                  fontSize: `${(style.fontSize / 794) * 100}cqw`, // Accurate A4 width scaling (794px)
                  color: style.color,
                  textAlign: style.textAlign,
                  fontFamily: style.fontFamily,
                  fontWeight: style.fontWeight || "normal",
                  width: key === 'qr_code' ? `${(style.fontSize / 794) * 100}cqw` : (style.width === 'auto' ? 'max-content' : style.width),
                  height: key === 'qr_code' ? `${(style.fontSize / 794) * 100}cqw` : 'auto',
                  lineHeight: 1.2,
                  margin: 0,
                  padding: 0
                }}
              >
                {key === 'qr_code' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2Fbecdex.com%2Fverified-companies" style={{width:'100%', height:'100%'}} alt="QR Code" />
                ) : style.text}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-xs text-slate-500">
            {t.dash_admin_cert_designer_instructions || "Klik elemen untuk memilihnya · Geser dengan ←↑↓→ · Tahan Shift untuk langkah lebih besar"}
          </div>
        </div>

        {/* Properties Sidebar */}
        <div className="w-full md:w-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col shadow-2xs">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 border-b pb-2">{t.dash_admin_cert_designer_properties || "Properti"}</h3>
          
          {selectedElement ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">{t.dash_admin_cert_designer_editing_element || "Elemen Dipilih:"}</label>
                <div className="font-mono text-sm font-bold text-blue-600 bg-blue-50 py-1 px-2 rounded">{selectedElement}</div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">{t.dash_admin_cert_designer_font_size || "Ukuran Font (px)"}</label>
                <input 
                  type="number" 
                  value={config[selectedElement].fontSize}
                  onChange={(e) => setConfig(prev => ({...prev, [selectedElement]: {...prev[selectedElement], fontSize: Number(e.target.value)}}))}
                  className="w-full px-3 py-1.5 rounded-lg border text-sm bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">{t.dash_admin_cert_designer_text_color || "Warna Teks"}</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="color" 
                    value={config[selectedElement].color}
                    onChange={(e) => setConfig(prev => ({...prev, [selectedElement]: {...prev[selectedElement], color: e.target.value}}))}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={config[selectedElement].color}
                    onChange={(e) => setConfig(prev => ({...prev, [selectedElement]: {...prev[selectedElement], color: e.target.value}}))}
                    className="w-full px-3 py-1.5 rounded-lg border text-sm bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">{t.dash_admin_cert_designer_text_align || "Rataan Teks"}</label>
                <select 
                  value={config[selectedElement].textAlign}
                  onChange={(e) => setConfig(prev => ({...prev, [selectedElement]: {...prev[selectedElement], textAlign: e.target.value as "left" | "center" | "right"}}))}
                  className="w-full px-3 py-1.5 rounded-lg border text-sm bg-slate-50"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">{t.dash_admin_cert_designer_font_weight || "Ketebalan Font"}</label>
                <select 
                  value={config[selectedElement].fontWeight || "normal"}
                  onChange={(e) => setConfig(prev => ({...prev, [selectedElement]: {...prev[selectedElement], fontWeight: e.target.value}}))}
                  className="w-full px-3 py-1.5 rounded-lg border text-sm bg-slate-50"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="800">Extra Bold</option>
                  <option value="900">Black</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 block mb-1">{t.dash_admin_cert_designer_pos_x || "Posisi X (%)"}</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={config[selectedElement].x}
                    onChange={(e) => setConfig(prev => ({...prev, [selectedElement]: {...prev[selectedElement], x: Number(e.target.value)}}))}
                    className="w-full px-3 py-1.5 rounded-lg border text-sm bg-slate-50"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 block mb-1">{t.dash_admin_cert_designer_pos_y || "Posisi Y (%)"}</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={config[selectedElement].y}
                    onChange={(e) => setConfig(prev => ({...prev, [selectedElement]: {...prev[selectedElement], y: Number(e.target.value)}}))}
                    className="w-full px-3 py-1.5 rounded-lg border text-sm bg-slate-50"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-400 text-center">
              {t.dash_admin_cert_designer_select_prompt || "Klik salah satu elemen di canvas untuk mengatur properti."}
            </div>
          )}

          <div className="mt-auto pt-6 space-y-2">
            <button 
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 bg-[#0c2340] hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all text-sm cursor-pointer"
            >
              <Save size={16} /> {t.dash_admin_cert_designer_save || "Simpan Desain"}
            </button>
            <button 
              onClick={handlePreview}
              className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2.5 rounded-xl transition-all text-sm border border-emerald-200 cursor-pointer"
            >
              <Eye size={16} /> {t.dash_admin_cert_designer_preview_pdf || "Preview PDF Asli"}
            </button>
            <button 
              onClick={handleResetDefault}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2 rounded-xl transition-all text-xs border border-slate-300 dark:border-slate-700 cursor-pointer"
            >
              <RotateCcw size={14} /> {t.dash_admin_cert_designer_reset || "Reset ke Standar Terbaru"}
            </button>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

