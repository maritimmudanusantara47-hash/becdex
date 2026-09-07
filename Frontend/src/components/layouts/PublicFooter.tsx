"use client";

import Link from "next/link";
import { useTranslation } from "@/store/lang";
import { Mail } from "lucide-react";
import Image from "next/image";

export function PublicFooter() {
  const { t } = useTranslation();

  return (
    <footer className="footer bg-[#f6f9ff] text-gray-700 text-sm mt-12">
      {/* Top Footer Section with World Map background */}
      <div className="bg-white border-t border-b border-[#e1ecff] py-16 bg-[url('/footer-bg.png')] bg-no-repeat bg-top-right bg-size-[auto_100%] md:bg-contain">
        <div className="container-custom grid lg:grid-cols-12 gap-8 items-start">
          {/* Column 1: Info */}
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-2 select-none">
              <Image src="/logo.webp" alt="BECdex Logo" width={32} height={32} className="object-contain" />
              <span className="font-extrabold text-[#012970] text-3xl tracking-tight">BECdex</span>
            </Link>
            <p className="text-[#444444] text-[14px] leading-relaxed text-justify font-sans">
              {t.footer_copyright}
            </p>
          </div>

          {/* Column 2: Our Services */}
          <div className="lg:col-span-3 lg:col-start-7 space-y-4">
            <h4 className="text-[16px] font-bold text-[#012970] uppercase tracking-wide relative pb-2 border-b-2 border-transparent select-none">
              {t.footer_services}
            </h4>
            <ul className="text-[14px] space-y-3 pt-1">
              <li className="flex items-center gap-1 text-[#013289] font-semibold">
                <span className="text-[#d0d4fc] text-xs font-mono select-none">&gt;</span>
                <Link href="/" className="hover:text-[#4154f1] transition-colors">
                  {t.footer_cert}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-[16px] font-bold text-[#012970] uppercase tracking-wide select-none">
              {t.footer_contact}
            </h4>
            <div className="text-[14px] text-[#444444] leading-relaxed space-y-1 pt-1 font-sans">
              <p>
                <strong className="text-[#012970] font-bold">{t.footer_operation}</strong>
              </p>
              <p>Indonesia Blue Economy Center (IBEC)</p>
              <p>{t.contact_campus}</p>
              <p>Jalan Pratekan No. 9A, Rawamangun</p>
              <p>Jakarta, Indonesia 13220</p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3.5 pt-2">
              <a
                href="mailto:maritimepreneur@gmail.com"
                className="text-[#012970]/50 hover:text-[#012970] transition-colors"
                title="Email Us"
              >
                <Mail size={22} className="stroke-[1.75]" />
              </a>
              <a
                href="https://www.instagram.com/maritimepreneur/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#012970]/50 hover:text-[#012970] transition-colors"
                title="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/maritimepreneur"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#012970]/50 hover:text-[#012970] transition-colors"
                title="LinkedIn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a
                href="https://www.f6s.com/maritimepreneur"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-50 hover:opacity-100 transition-opacity flex items-center"
                title="F6S"
              >
                <Image src="/f6s.png" alt="F6S Logo" width={20} height={20} className="object-contain" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
