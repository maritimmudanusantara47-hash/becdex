"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import api from "@/lib/api";

const registerSchema = z
  .object({
    name: z.string().min(2, "Company Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    company_country: z.string().min(1, "Country is required"),
    company_field_id: z.string().min(1, "Sector is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string(),
    pic_name: z.string().min(2, "PIC Name is required"),
    pic_email: z.string().email("Invalid PIC email"),
    pic_phone: z.string().min(8, "PIC Phone is required"),
    pic_position: z.string().min(2, "PIC Position is required"),
    terms_accepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the Certification Agreement",
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const COUNTRIES = [
  { iso: "AL", name: "Albania" },
  { iso: "DZ", name: "Algeria" },
  { iso: "AO", name: "Angola" },
  { iso: "AG", name: "Antigua and Barbuda" },
  { iso: "AR", name: "Argentina" },
  { iso: "AU", name: "Australia" },
  { iso: "AZ", name: "Azerbaijan" },
  { iso: "BH", name: "Bahrain" },
  { iso: "BD", name: "Bangladesh" },
  { iso: "BY", name: "Belarus" },
  { iso: "BE", name: "Belgium" },
  { iso: "BZ", name: "Belize" },
  { iso: "BJ", name: "Benin" },
  { iso: "BA", name: "Bosnia and Herzegovina" },
  { iso: "BR", name: "Brazil" },
  { iso: "BN", name: "Brunei Darussalam" },
  { iso: "BG", name: "Bulgaria" },
  { iso: "CV", name: "Cabo Verde" },
  { iso: "KH", name: "Cambodia" },
  { iso: "CM", name: "Cameroon" },
  { iso: "CA", name: "Canada" },
  { iso: "CL", name: "Chile" },
  { iso: "CN", name: "China" },
  { iso: "CO", name: "Colombia" },
  { iso: "KM", name: "Comoros" },
  { iso: "CR", name: "Costa Rica" },
  { iso: "HR", name: "Croatia" },
  { iso: "CU", name: "Cuba" },
  { iso: "CY", name: "Cyprus" },
  { iso: "DK", name: "Denmark" },
  { iso: "DJ", name: "Djibouti" },
  { iso: "DM", name: "Dominica" },
  { iso: "DO", name: "Dominican Republic" },
  { iso: "EC", name: "Ecuador" },
  { iso: "EG", name: "Egypt" },
  { iso: "SV", name: "El Salvador" },
  { iso: "GQ", name: "Equatorial Guinea" },
  { iso: "ER", name: "Eritrea" },
  { iso: "EE", name: "Estonia" },
  { iso: "FJ", name: "Fiji" },
  { iso: "FI", name: "Finland" },
  { iso: "FR", name: "France" },
  { iso: "GA", name: "Gabon" },
  { iso: "GE", name: "Georgia" },
  { iso: "DE", name: "Germany" },
  { iso: "GH", name: "Ghana" },
  { iso: "GR", name: "Greece" },
  { iso: "GD", name: "Grenada" },
  { iso: "GT", name: "Guatemala" },
  { iso: "GN", name: "Guinea" },
  { iso: "GY", name: "Guyana" },
  { iso: "HT", name: "Haiti" },
  { iso: "HN", name: "Honduras" },
  { iso: "IS", name: "Iceland" },
  { iso: "IN", name: "India" },
  { iso: "ID", name: "Indonesia" },
  { iso: "IR", name: "Iran" },
  { iso: "IQ", name: "Iraq" },
  { iso: "IE", name: "Ireland" },
  { iso: "IL", name: "Israel" },
  { iso: "IT", name: "Italy" },
  { iso: "JM", name: "Jamaica" },
  { iso: "JP", name: "Japan" },
  { iso: "JO", name: "Jordan" },
  { iso: "KE", name: "Kenya" },
  { iso: "KI", name: "Kiribati" },
  { iso: "KW", name: "Kuwait" },
  { iso: "LV", name: "Latvia" },
  { iso: "LB", name: "Lebanon" },
  { iso: "LR", name: "Liberia" },
  { iso: "LY", name: "Libya" },
  { iso: "LT", name: "Lithuania" },
  { iso: "MG", name: "Madagascar" },
  { iso: "MY", name: "Malaysia" },
  { iso: "MV", name: "Maldives" },
  { iso: "MT", name: "Malta" },
  { iso: "MR", name: "Mauritania" },
  { iso: "MU", name: "Mauritius" },
  { iso: "MX", name: "Mexico" },
  { iso: "MC", name: "Monaco" },
  { iso: "ME", name: "Montenegro" },
  { iso: "MA", name: "Morocco" },
  { iso: "MZ", name: "Mozambique" },
  { iso: "MM", name: "Myanmar" },
  { iso: "NA", name: "Namibia" },
  { iso: "NR", name: "Nauru" },
  { iso: "NP", name: "Netherlands" },
  { iso: "NZ", name: "New Zealand" },
  { iso: "NI", name: "Nicaragua" },
  { iso: "NG", name: "Nigeria" },
  { iso: "NO", name: "Norway" },
  { iso: "OM", name: "Oman" },
  { iso: "PK", name: "Pakistan" },
  { iso: "PW", name: "Palau" },
  { iso: "PA", name: "Panama" },
  { iso: "PG", name: "Papua New Guinea" },
  { iso: "PE", name: "Peru" },
  { iso: "PH", name: "Philippines" },
  { iso: "PL", name: "Poland" },
  { iso: "PT", name: "Portugal" },
  { iso: "QA", name: "Qatar" },
  { iso: "RO", name: "Romania" },
  { iso: "RU", name: "Russian Federation" },
  { iso: "WS", name: "Samoa" },
  { iso: "SA", name: "Saudi Arabia" },
  { iso: "SN", name: "Senegal" },
  { iso: "SC", name: "Seychelles" },
  { iso: "SL", name: "Sierra Leone" },
  { iso: "SG", name: "Singapore" },
  { iso: "SI", name: "Slovenia" },
  { iso: "ZA", name: "South Africa" },
  { iso: "ES", name: "Spain" },
  { iso: "LK", name: "Sri Lanka" },
  { iso: "SE", name: "Sweden" },
  { iso: "TH", name: "Thailand" },
  { iso: "TL", name: "Timor-Leste" },
  { iso: "TO", name: "Tonga" },
  { iso: "TR", name: "Türkiye" },
  { iso: "UA", name: "Ukraine" },
  { iso: "AE", name: "United Arab Emirates" },
  { iso: "GB", name: "United Kingdom" },
  { iso: "US", name: "United States of America" },
  { iso: "UY", name: "Uruguay" },
  { iso: "VU", name: "Vanuatu" },
  { iso: "VE", name: "Venezuela" },
  { iso: "VN", name: "Viet Nam" },
  { iso: "YE", name: "Yemen" },
];

const SECTORS = [
  { id: 1, name: "Marine Fisheries and Aquaculture" },
  { id: 2, name: "Maritime Transport, Shipping, and Ports" },
  { id: 3, name: "Marine Tourism and Cruise Ships" },
  { id: 4, name: "Biotechnology and Marine Bioproducts Processing" },
  { id: 5, name: "Seawater Desalination" },
  { id: 6, name: "Deep Sea Mining, Oil, and Gas" },
  { id: 7, name: "Marine Renewable Energy" },
  { id: 8, name: "Ship and Boat Building" },
  { id: 9, name: "Ocean Building" },
  { id: 10, name: "Marine Defense and Security" },
  { id: 11, name: "Maritime Research and Education" },
];

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      company_country: "",
      company_field_id: "",
      password: "",
      password_confirmation: "",
      pic_name: "",
      pic_email: "",
      pic_phone: "",
      pic_position: "",
      terms_accepted: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const payload = {
        ...data,
        company_field_id: Number(data.company_field_id),
      };
      await api.post("/auth/register", payload);
      toast.success("Registrasi berhasil! Silakan tunggu admin mengaktifkan akun Anda sebelum login.");
      router.push("/login");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
      const errs = err.response?.data?.errors;
      if (errs) {
        const firstError = Object.values(errs)[0] as string[];
        toast.error(firstError[0]);
      } else {
        toast.error(err.response?.data?.message || "Registrasi gagal.");
      }
    }
  };

  return (
    <section className="min-h-screen bg-[url('/b.svg')] bg-cover bg-center flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-5xl bg-[#f8f9fa] rounded-2xl shadow-2xl overflow-hidden grid lg:grid-cols-12">
        
        {/* Left Column: Registration Form */}
        <div className="lg:col-span-7 p-6 md:p-10 relative flex flex-col justify-center bg-[#f8f9fa]">
          {/* Back button */}
          <Link href="/" className="absolute top-6 left-6 text-[#0d6efd] hover:text-blue-700 transition-colors">
            <ArrowLeft size={24} />
          </Link>

          <div className="text-center mb-4 mt-4">
            <Image
              src="/logo.webp"
              alt="BECdex Logo"
              width={70}
              height={70}
              className="mx-auto object-contain mb-3"
            />
            <h4 className="text-black text-xl font-bold font-sans">
              Blue Economy Company
            </h4>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 font-sans text-sm">
            <p className="text-center text-gray-700 font-semibold mb-2">Registration Form</p>

            <div className="grid md:grid-cols-2 gap-3">
              {/* Company Name */}
              <div>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="Company Name"
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#0d6efd]/20 focus:border-[#0d6efd]"
                />
                {errors.name && (
                  <p className="text-red-500 text-[10px] mt-0.5">{errors.name.message}</p>
                )}
              </div>

              {/* Country Select */}
              <div>
                <select
                  {...register("company_country")}
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#0d6efd]/20 focus:border-[#0d6efd] text-gray-700"
                >
                  <option value="">Country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.iso} value={c.iso}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.company_country && (
                  <p className="text-red-500 text-[10px] mt-0.5">{errors.company_country.message}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Email Address"
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#0d6efd]/20 focus:border-[#0d6efd]"
                />
                {errors.email && (
                  <p className="text-red-500 text-[10px] mt-0.5">{errors.email.message}</p>
                )}
              </div>

              {/* Sectors Select */}
              <div>
                <select
                  {...register("company_field_id")}
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#0d6efd]/20 focus:border-[#0d6efd] text-gray-700"
                >
                  <option value="">Blue Economic Sector</option>
                  {SECTORS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {errors.company_field_id && (
                  <p className="text-red-500 text-[10px] mt-0.5">{errors.company_field_id.message}</p>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <input
                {...register("password")}
                type="password"
                placeholder="Password"
                className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#0d6efd]/20 focus:border-[#0d6efd]"
              />
              {errors.password && (
                <p className="text-red-500 text-[10px] mt-0.5">{errors.password.message}</p>
              )}
            </div>

            {/* Repeat Password */}
            <div>
              <input
                {...register("password_confirmation")}
                type="password"
                placeholder="Repeat Password"
                className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#0d6efd]/20 focus:border-[#0d6efd]"
              />
              {errors.password_confirmation && (
                <p className="text-red-500 text-[10px] mt-0.5">{errors.password_confirmation.message}</p>
              )}
            </div>

            {/* PIC Name */}
            <div>
              <input
                {...register("pic_name")}
                type="text"
                placeholder="PIC Name"
                className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#0d6efd]/20 focus:border-[#0d6efd]"
              />
              {errors.pic_name && (
                <p className="text-red-500 text-[10px] mt-0.5">{errors.pic_name.message}</p>
              )}
            </div>

            {/* PIC Email */}
            <div>
              <input
                {...register("pic_email")}
                type="email"
                placeholder="PIC Email"
                className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#0d6efd]/20 focus:border-[#0d6efd]"
              />
              {errors.pic_email && (
                <p className="text-red-500 text-[10px] mt-0.5">{errors.pic_email.message}</p>
              )}
            </div>

            {/* PIC Phone */}
            <div>
              <input
                {...register("pic_phone")}
                type="text"
                placeholder="PIC Phone"
                className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#0d6efd]/20 focus:border-[#0d6efd]"
              />
              {errors.pic_phone && (
                <p className="text-red-500 text-[10px] mt-0.5">{errors.pic_phone.message}</p>
              )}
            </div>

            {/* PIC Position */}
            <div>
              <input
                {...register("pic_position")}
                type="text"
                placeholder="PIC Position"
                className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#0d6efd]/20 focus:border-[#0d6efd]"
              />
              {errors.pic_position && (
                <p className="text-red-500 text-[10px] mt-0.5">{errors.pic_position.message}</p>
              )}
            </div>

            {/* Terms and Conditions text */}
            <div className="text-gray-900 text-[12px] text-justify leading-normal space-y-2 border-t border-gray-200 pt-3 font-sans">
              <p>
                <span className="text-red-500 font-bold">*</span> Companies must meet the Blue Economy Company Index (BECdex){" "}
                <Link
                  href="/agreement.pdf"
                  target="_blank"
                  className="text-[#0d6efd] font-bold hover:underline"
                >
                  Certification Agreement
                </Link>{" "}
                and are willing to provide access or information needed by the Maritimepreneur International Certification Center (MICC) in certification activities.
              </p>

              <div className="flex items-center justify-center gap-2 pt-1">
                <input
                  {...register("terms_accepted")}
                  type="checkbox"
                  id="accept-terms"
                  className="h-4 w-4 rounded border-gray-300 text-[#0d6efd] focus:ring-[#0d6efd]"
                />
                <label htmlFor="accept-terms" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Accept
                </label>
              </div>
              {errors.terms_accepted && (
                <p className="text-red-500 text-center text-[10px] mt-0.5">{errors.terms_accepted.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0d6efd] hover:bg-blue-700 text-white text-sm font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Register"
                )}
              </button>
            </div>

            {/* Already have account */}
            <div className="flex items-center justify-center gap-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-700">Already have an account?</p>
              <Link
                href="/login"
                className="border border-[#0d6efd] text-[#0d6efd] hover:bg-blue-50 text-xs font-bold px-4 py-1.5 rounded-lg transition-colors"
              >
                Log in
              </Link>
            </div>
          </form>
        </div>

        {/* Right Column: Gradient & Illustration */}
        <div className="hidden lg:col-span-5 lg:flex flex-col items-center justify-center p-10 text-center bg-linear-to-r from-[#0B3954] via-[#0D6AA8] to-[#0B3954] text-white">
          <Image
            src="/bg-home-perahu.webp"
            alt="Boat Illustration"
            width={500}
            height={500}
            priority
            className="object-contain mb-8 animate-pulse duration-4000"
            style={{ width: "100%", height: "auto", maxWidth: "320px" }}
          />
          <div className="max-w-xs space-y-3">
            <h4 className="text-lg font-bold font-sans leading-snug">
              Become a blue economy company now!
            </h4>
            <p className="text-xs text-blue-100/90 leading-relaxed text-justify font-sans">
              Blue Economy Company is a certified company in the maritime sectors, whose business meets 70% or more of 50 indicators of the Blue Economy Company Index (BECdex) to support the achievement of the Sustainable Development Goals (SDGs) in the coastal states.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
