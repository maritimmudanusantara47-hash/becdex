"use client";

import { useTranslation } from "@/store/lang";
import { PublicHeader } from "@/components/layouts/PublicHeader";
import { PublicFooter } from "@/components/layouts/PublicFooter";
import Image from "next/image";
import { useState, useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function DownloadPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const { data: dynamicFiles } = useQuery({
    queryKey: ["public-downloads"],
    queryFn: async () => {
      const res = await api.get("/public/downloads");
      return res.data.data as { id: number; title: string; file_url: string }[];
    },
    enabled: mounted,
  });

  if (!mounted) return null;

  const staticFiles = [
    { title: "Certification Agreement", file_url: "/agreement.pdf" },
    { title: "Blue Economy Company Index - Proposal", file_url: "/proposal.pdf" },
  ];

  const files = dynamicFiles && dynamicFiles.length > 0 ? dynamicFiles : staticFiles;

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <div className="container-custom py-20">
        <section className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Table of downloads */}
          <div className="space-y-6">
            <h3 className="text-[#012970] text-3xl font-black">{t.download_title}</h3>

            <div className="overflow-hidden border border-gray-200 rounded-2xl shadow-xs">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold">
                    <th className="px-4 py-3 w-16">{t.download_no}</th>
                    <th className="px-4 py-3">{t.download_col_title}</th>
                    <th className="px-4 py-3 text-right">{t.download_col_dl}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {files.map((f, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3.5 font-bold text-gray-900">{f.title}</td>
                      <td className="px-4 py-3.5 text-right">
                        <a
                          href={f.file_url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-[#4154f1] hover:text-[#2e3fe6] font-bold underline"
                        >
                          {t.download_link}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Logo illustration */}
          <div className="flex justify-center">
            <Image src="/logo.webp" alt="BECdex Logo" width={320} height={320} className="object-contain max-w-60 md:max-w-xs" />
          </div>
        </section>
      </div>

      <PublicFooter />
    </div>
  );
}
