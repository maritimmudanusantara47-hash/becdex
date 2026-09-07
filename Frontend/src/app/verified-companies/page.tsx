"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { PublicHeader } from "@/components/layouts/PublicHeader";
import { PublicFooter } from "@/components/layouts/PublicFooter";
import { LoadingSpinner } from "@/components/ui/index";
import { MapPin, FileText, Globe, CheckCircle2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { MdCheckCircle } from "react-icons/md";
import { useTranslation } from "@/store/lang";


interface Company {
  id: number;
  mmic: string;
  user?: {
    id: number;
    name: string;
    image?: string;
    company?: {
      company_name?: string;
      company_country?: string;
      company_field?: { name: string };
      becdex_category?: { name: string };
    };
  };
  certificate?: {
    name: string;
  };
}

export default function VerifiedCompaniesPage() {
  const { t } = useTranslation();
  const [selectedState, setSelectedState] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = useCallback(() => {
    setPage(1);
    setSearchQuery(searchInput);
  }, [searchInput]);

  // Fetch Lookups (Countries, Sectors)
  const { data: lookupsData } = useQuery({
    queryKey: ["public-lookups"],
    queryFn: async () => {
      const res = await api.get("/public/lookups");
      return res.data.data;
    },
  });

  const { data: companiesData, isLoading } = useQuery({
    queryKey: ["verified-companies", page, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (searchQuery) params.set("search", searchQuery);
      const res = await api.get(`/public/verified-companies?${params}`);
      return res.data as { data: Company[]; meta: { current_page: number; last_page: number; total: number } };
    },
    placeholderData: (prev) => prev,
  });

  const coastalStates = lookupsData?.countries || [];
  const sectors = lookupsData?.company_fields || [];
  
  // BECdex Categories: Standard, Good, Excellent
  const becdexCategories = [
    { id: "Standard", name: t.cat_standard || "Standard" },
    { id: "Good", name: t.cat_good || "Good" },
    { id: "Excellent", name: t.cat_excellent || "Excellent" },
  ];

  // Handle Sector Checkbox
  const handleSectorChange = (sectorName: string) => {
    setSelectedSectors(prev => 
      prev.includes(sectorName) 
        ? prev.filter(s => s !== sectorName)
        : [...prev, sectorName]
    );
  };

  const filteredCompanies = useMemo(() => {
    const items = companiesData?.data ?? [];
    return items.filter((cert: Company) => {
      // Filter by Coastal State (country ISO)
      if (selectedState !== "All" && cert.user?.company?.company_country !== selectedState) return false;
      // Filter by Category (case-insensitive substring match)
      if (selectedCategory !== "All") {
        const catName = (cert.user?.company?.becdex_category?.name || cert.certificate?.name || "").toLowerCase();
        if (!catName.includes(selectedCategory.toLowerCase())) return false;
      }
      // Filter by Sectors
      if (selectedSectors.length > 0 && !selectedSectors.includes(cert.user?.company?.company_field?.name || "")) return false;
      return true;
    });
  }, [companiesData, selectedState, selectedCategory, selectedSectors]);


  const meta = companiesData?.meta;

  // Helper to map country ISO to Name
  const getCountryName = (iso?: string) => {
    if (!iso) return "Unknown";
    const country = coastalStates.find((c: { id: number; iso: string; name: string }) => c.iso === iso);
    return country ? country.name : iso;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafbfc]">
      <PublicHeader />
      
      <main className="flex-1 max-w-300 w-full mx-auto px-4 py-8 lg:py-12 flex flex-col md:flex-row gap-6 lg:gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-70 shrink-0">
          <div className="bg-white border border-gray-200 rounded overflow-hidden">
            {/* Header */}
            <div className="bg-[#0d6efd] text-white px-4 py-3 font-semibold text-[15px]">
              Filter
            </div>
            
            <div className="p-4 space-y-6">
              {/* Coastal States */}
              <div>
                <label className="flex items-center gap-1.5 text-[13px] font-medium text-gray-700 mb-2">
                  <Globe size={14} className="text-[#0d6efd]" />
                  Coastal States
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-[13px] text-gray-700 focus:outline-none focus:border-[#0d6efd] bg-white"
                >
                  <option value="All">All States</option>
                  {coastalStates.map((c: { id: number; iso: string; name: string }) => (
                    <option key={c.id} value={c.iso}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* BECdex Categories */}
              <div>
                <label className="flex items-center gap-1.5 text-[13px] font-medium text-gray-700 mb-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  BECdex Categories
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-[13px] text-gray-700 focus:outline-none focus:border-[#0d6efd] bg-white"
                >
                  <option value="All">{t.filter_all_categories || "All Categories"}</option>
                  {becdexCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

              </div>

              {/* Sectors */}
              <div>
                <label className="flex items-center gap-1.5 text-[13px] font-medium text-gray-700 mb-3">
                  <div className="w-3.5 h-3.5 bg-gray-700 text-white rounded-xs flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold">!!</span>
                  </div>
                  Sectors
                </label>
                <div className="space-y-2.5 max-h-100 overflow-y-auto pr-1">
                  {sectors.map((sector: { id: number; name: string }) => (
                    <label key={sector.id} className="flex items-start gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedSectors.includes(sector.name)}
                        onChange={() => handleSectorChange(sector.name)}
                        className="mt-0.5 w-3.5 h-3.5 rounded-sm border-gray-300 text-[#0d6efd] focus:ring-[#0d6efd] cursor-pointer"
                      />
                      <span className="text-[13px] text-gray-600 group-hover:text-gray-900 leading-tight">
                        {sector.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Search Bar */}
              <div className="mb-4 flex gap-2">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSearch()}
                    placeholder="Search company name..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0d6efd] transition-colors"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-[#0d6efd] text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>

              <div className="mb-3">
                <p className="text-gray-600 text-[15px]">
                  Showing {filteredCompanies.length} Result(s){meta?.total ? ` of ${meta.total}` : ""}
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {filteredCompanies.map((cert: Company) => {
                  const companyName = cert.user?.company?.company_name || cert.user?.name || "Unknown Company";
                  const countryName = getCountryName(cert.user?.company?.company_country);
                  const sectorName = cert.user?.company?.company_field?.name || "Marine Sector";
                  const catName = cert.certificate?.name || cert.user?.company?.becdex_category?.name || "Standard";
                  
                  return (
                    <div 
                      key={cert.id} 
                      className="bg-white border border-gray-200 rounded p-4 flex flex-col sm:flex-row items-center sm:items-start gap-5 hover:shadow-md transition-shadow"
                    >
                      {/* Logo */}
                      <div className="w-32 h-32 shrink-0 relative flex items-center justify-center bg-transparent">
                      {cert.user?.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={cert.user.image.startsWith("http") ? cert.user.image : `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api\/?$/, '')}/storage/${cert.user.image}`}
                          alt={companyName}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                          <div className="w-20 h-20 bg-gray-50 text-gray-300 flex items-center justify-center rounded-full border border-gray-100">
                            <span className="text-2xl font-bold">{companyName.charAt(0)}</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 py-2 text-center sm:text-left">
                        <h3 className="text-[#4154f1] font-semibold text-[17px] leading-tight mb-3">
                          {companyName}
                        </h3>
                        
                        <div className="space-y-2 inline-flex flex-col items-start mx-auto sm:mx-0">
                          <div className="flex items-start gap-1.5 text-[13px] text-gray-500 text-left">
                            <MapPin size={15} className="shrink-0 mt-0.5 text-gray-400" />
                            <span className="leading-snug">{countryName}</span>
                          </div>
                          
                          <div className="flex items-start gap-1.5 text-[13px] text-gray-500 text-left">
                            <FileText size={15} className="shrink-0 mt-0.5 text-gray-400" />
                            <span className="leading-snug line-clamp-2">
                              {sectorName}
                            </span>
                          </div>

                          <div className="flex items-start gap-1.5 text-[13px] text-gray-600 font-medium mt-1">
                            <MdCheckCircle size={16} className="text-[#0d6efd] shrink-0 mt-0.5" />
                            <span className="leading-snug">Certified {catName} Blue Economy Company</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredCompanies.length === 0 && (
                <div className="text-center py-20 bg-white border border-gray-200 rounded-md">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search size={20} className="text-gray-400" />
                  </div>
                  <h3 className="text-gray-800 font-medium">No Results Found</h3>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your filters to see more companies.</p>
                </div>
              )}

              {/* Pagination Controls */}
              {meta && meta.last_page > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    Page {meta.current_page} of {meta.last_page} ({meta.total} companies)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={meta.current_page <= 1}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={14} /> Prev
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                      disabled={meta.current_page >= meta.last_page}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </main>
      
      <PublicFooter />
    </div>
  );
}
