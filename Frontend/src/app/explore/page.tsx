"use client";

import { useTranslation } from "@/store/lang";
import { PublicHeader } from "@/components/layouts/PublicHeader";
import { PublicFooter } from "@/components/layouts/PublicFooter";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function ExplorePage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <div className="container-custom py-12 space-y-24">
        {/* Section 1: Catalog */}
        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h3 className="text-3xl font-extrabold">
              <Link href="/verified-companies" className="text-[#4154f1] hover:underline">
                {t.explore_catalog_title}
              </Link>
            </h3>

            <p className="text-gray-600 text-sm md:text-base leading-relaxed text-justify">
              {t.explore_catalog_desc}
            </p>
          </div>
          <div className="flex justify-center">
            <Image src="/image2.webp" alt="Catalog Visual" width={400} height={300} className="object-contain" />
          </div>
        </section>

        {/* Section 2: List of Coastal States */}
        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="flex justify-center order-2 lg:order-1">
            <Image src="/2147.webp" alt="Coastal States Visual" width={400} height={300} className="object-cover rounded-2xl" />
          </div>
          <div className="space-y-4 order-1 lg:order-2">
            <h3 className="text-3xl font-extrabold">
              <Link href="/states" className="text-[#4154f1] hover:underline">
                {t.explore_coastal_title}
              </Link>
            </h3>
              <div 
                className="text-slate-600 text-lg md:text-xl leading-relaxed mb-6"
                dangerouslySetInnerHTML={{ __html: t.explore_coastal_desc || '' }} 
              />
            <p className="text-gray-800 font-bold text-sm md:text-base">
              {t.explore_coastal_sub}
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-gray-600 font-medium">
              <li>{t.explore_coastal_1}</li>
              <li>{t.explore_coastal_2}</li>
              <li>{t.explore_coastal_3}</li>
            </ol>
          </div>
        </section>

        {/* Section 3: Legal Basis */}
        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h3 className="text-[#012970] text-3xl font-extrabold">{t.explore_legal_title}</h3>
            <ol className="list-decimal list-inside space-y-2 text-xs md:text-sm text-gray-600 font-medium text-justify">
              {t.explore_legal_list.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ol>
          </div>
          <div className="flex justify-center">
            <Image src="/vasab.webp" alt="Sectors Visual" width={400} height={300} className="object-contain rounded-2xl" />
          </div>
        </section>
      </div>

      <PublicFooter />
    </div>
  );
}
