"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { PublicHeader } from "@/components/layouts/PublicHeader";
import { PublicFooter } from "@/components/layouts/PublicFooter";
import { LoadingSpinner } from "@/components/ui/index";
import Image from "next/image";

interface Country {
  id: number;
  iso: string;
  name: string;
}

export default function StatesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  const { data: lookupsData, isLoading } = useQuery({
    queryKey: ["public-lookups"],
    queryFn: async () => {
      const res = await api.get("/public/lookups");
      return res.data.data;
    },
  });

  const countries: Country[] = lookupsData?.countries || [];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f6f9ff] flex flex-col">
      <PublicHeader />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-12 flex items-center justify-center">
        
        <div className="bg-white rounded-2xl shadow-[0_0_30px_rgba(1,41,112,0.08)] p-8 md:p-12 w-full">
          
          <div className="flex flex-col lg:flex-row gap-12 relative">
            
            {/* Left Side: List of States */}
            <div className="flex-1 z-10">
              <h2 className="text-[#012970] text-3xl font-bold mb-4">
                List of Coastal States
              </h2>
              <p className="text-gray-600 mb-8">
                Coastal state is a state with a sea-coastline. There are 153 of 193 member states of United Nations are coastal states in 2021.
              </p>
              
              {isLoading ? (
                <div className="py-20 flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="columns-1 sm:columns-2 gap-x-8 lg:gap-x-12 text-[15px] text-gray-700 leading-loose">
                  {countries.map((country, index) => (
                    <div key={country.id} className="break-inside-avoid flex gap-2">
                      <span className="w-6 text-right shrink-0">{index + 1}.</span>
                      <span>{country.name}</span>
                    </div>
                  ))}
                  
                  {countries.length === 0 && (
                    <p className="text-gray-500 italic">No coastal states data available.</p>
                  )}
                </div>
              )}
            </div>

            {/* Right Side: Illustration */}
            <div className="lg:w-[45%] flex justify-center items-start pt-10 z-0">
              <div className="relative w-full max-w-125 aspect-square opacity-90">
                {/* Assuming /2147.webp or similar is the coastal states illustration */}
                <Image 
                  src="/2147.webp" 
                  alt="Coastal States Map Illustration" 
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            
          </div>
        </div>
        
      </main>
      
      <PublicFooter />
    </div>
  );
}
