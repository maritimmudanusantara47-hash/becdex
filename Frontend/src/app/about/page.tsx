"use client";

import { useTranslation } from "@/store/lang";
import { PublicHeader } from "@/components/layouts/PublicHeader";
import { PublicFooter } from "@/components/layouts/PublicFooter";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function AboutPage() {
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
        {/* Section 1: What is BECdex */}
        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h3 className="text-[#012970] text-3xl font-extrabold">{t.about_what_is_title}</h3>
            <div
              className="text-[#444444] text-[16px] leading-6"
              dangerouslySetInnerHTML={{ __html: t.about_what_is_p1 || '' }}
            />
            <p className="text-gray-600 text-sm md:text-base leading-relaxed text-justify">
              {t.about_what_is_p2}
            </p>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed text-justify">
              {t.about_what_is_p3}{" "}
              <a href="https://stei.ac.id/" target="_blank" className="text-[#4154f1] font-semibold hover:underline">
                {t.about_what_is_stei}
              </a>{" "}
              {t.about_what_is_stei_desc},{" "}
              <a href="https://maritimmuda.id" target="_blank" className="text-[#4154f1] font-semibold hover:underline">
                {t.about_what_is_mmn}
              </a>{" "}
              {t.about_what_is_mmn_desc} {t.label_and || "and"}{" "}
              <a href="https://maritim.go.id/" target="_blank" className="text-[#4154f1] font-semibold hover:underline">
                {t.about_what_is_kemenko}
              </a>.
            </p>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed text-justify">
              <a href="https://ijisrt.com/designing-and-mapping-the-blue-economy-company-index-becdex-to-the-sustainable-development-goals-sdgs-for-maritime-companies-in-the-coastal-states" target="_blank" className="text-[#4154f1] font-semibold hover:underline">
                {t.about_what_is_p4_link}
              </a>{" "}
              {t.about_what_is_p4}
            </p>
          </div>
          <div className="flex justify-center">
            <Image src="/logo.webp" alt="BECdex Logo" width={320} height={320} className="object-contain max-w-60 md:max-w-xs" />
          </div>
        </section>

        {/* Section 2: How to be certified */}
        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="flex justify-center order-2 lg:order-1">
            <Image src="/alur-lengkap.webp" alt="Flow Diagram" width={400} height={400} className="object-contain rounded-2xl" />
          </div>
          <div className="space-y-6 order-1 lg:order-2">
            <div className="space-y-4">
              <h3 className="text-[#012970] text-3xl font-extrabold">{t.about_how_certified}</h3>
              <div
                className="text-[#444444] text-[16px] leading-6"
                dangerouslySetInnerHTML={{ __html: t.about_how_certified_desc || '' }}
              />
              <div className="bg-blue-50 border-l-4 border-[#4154f1] p-4 rounded-r-xl">
                <span className="text-gray-800 text-sm md:text-base font-bold">
                  {t.hero_certify_link}{" "}
                  <Link href="/register" className="text-[#4154f1] underline font-extrabold hover:text-[#2e3fe6]">
                    {t.hero_click_here}
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: What is Blue Economy */}
        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h3 className="text-[#012970] text-3xl font-extrabold">{t.about_what_blue}</h3>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed text-justify">
              {t.about_what_blue_p}
            </p>
          </div>
          <div className="flex justify-center">
            <Image src="/31366.webp" alt="Blue Economy Visual" width={400} height={300} className="object-cover rounded-2xl shadow-md" />
          </div>
        </section>

        {/* Section 4: What are the principles */}
        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="flex justify-center order-2 lg:order-1">
            <Image src="/2147.webp" alt="Principles Visual" width={400} height={300} className="object-cover rounded-2xl shadow-md" />
          </div>
          <div className="space-y-4 order-1 lg:order-2">
            <h3 className="text-[#012970] text-3xl font-extrabold">{t.about_principles}</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-gray-600 font-medium">
              <li>{t.about_principle_1}</li>
              <li>{t.about_principle_2}</li>
              <li>{t.about_principle_3}</li>
              <li>{t.about_principle_4}</li>
              <li>{t.about_principle_5}</li>
              <li>{t.about_principle_6}</li>
              <li>{t.about_principle_7}</li>
              <li>{t.about_principle_8}</li>
              <li>{t.about_principle_9}</li>
              <li>{t.about_principle_10}</li>
            </ol>
          </div>
        </section>

        {/* Section 5: What are the sectors */}
        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h3 className="text-[#012970] text-3xl font-extrabold">{t.about_sectors}</h3>
            <ol className="list-decimal list-inside space-y-1.5 text-sm md:text-base text-gray-600 font-medium">
              {t.about_sector_list.map((item, index) => (
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
