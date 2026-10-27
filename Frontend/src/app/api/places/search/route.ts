import { NextRequest, NextResponse } from "next/server";

const STATE_MAP: Record<string, string> = {
  "Java": "DKI Jakarta",
  "West Java": "Jawa Barat",
  "Central Java": "Jawa Tengah",
  "East Java": "Jawa Timur",
  "Banten": "Banten",
  "Special Region of Yogyakarta": "DI Yogyakarta",
  "Yogyakarta": "DI Yogyakarta",
  "Bali": "Bali",
  "North Sumatra": "Sumatera Utara",
  "West Sumatra": "Sumatera Barat",
  "South Sumatra": "Sumatera Selatan",
  "Riau": "Riau",
  "Riau Islands": "Kepulauan Riau",
  "Lampung": "Lampung",
  "South Sulawesi": "Sulawesi Selatan",
  "North Sulawesi": "Sulawesi Utara",
  "Central Sulawesi": "Sulawesi Tengah",
  "Southeast Sulawesi": "Sulawesi Tenggara",
  "East Kalimantan": "Kalimantan Timur",
  "South Kalimantan": "Kalimantan Selatan",
  "West Kalimantan": "Kalimantan Barat",
  "Central Kalimantan": "Kalimantan Tengah",
  "North Kalimantan": "Kalimantan Utara",
  "Aceh": "Aceh",
  "Papua": "Papua",
  "West Papua": "Papua Barat",
  "Maluku": "Maluku",
  "North Maluku": "Maluku Utara",
  "West Nusa Tenggara": "Nusa Tenggara Barat",
  "East Nusa Tenggara": "Nusa Tenggara Timur",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const trimmed = q.trim();

  if (trimmed.length < 3) {
    return NextResponse.json([]);
  }

  // Bersihkan kata blok, nomor, kavling dari query pencarian
  const cleanQuery = trimmed
    .replace(/\b(?:blok|block|kav\.?|kavling|unit|suite|lt\.?|lantai|rt\.?|rw\.?)\s+[a-z0-9\/-]+/gi, "")
    .replace(/\b(?:no\.?|nomor)\s*[0-9\/-]+[a-z]?/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const queryToSearch = cleanQuery.length >= 3 ? cleanQuery : trimmed;

  try {
    // 1. Prioritaskan Photon (Elasticsearch Geocoder berbasis OpenStreetMap - Cepat & Bebas Rate Limit)
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      queryToSearch
    )}&lat=-6.2&lon=106.8&limit=10`;

    const photonRes = await fetch(photonUrl, {
      headers: { "Accept-Language": "id,en" },
    });

    if (photonRes.ok) {
      const data = await photonRes.json();
      const features = Array.isArray(data?.features) ? data.features : [];

      // Filter HANYA hasil resmi di wilayah Indonesia (kecualikan Malaysia / negara lain)
      const idFeatures = features.filter(
        (f: any) =>
          f?.properties?.countrycode === "ID" ||
          f?.properties?.country?.toLowerCase() === "indonesia"
      );

      if (idFeatures.length > 0) {
        const results = idFeatures.map((f: any) => {
          const p = f.properties || {};
          const name = p.name || "";
          const street = p.street || (p.osm_key === "highway" ? p.name : "");
          const district = p.district || p.suburb || p.locality || "";
          let city = p.city || p.county || "";
          if (city.toLowerCase().startsWith("kabupaten ")) {
            city = "Kab. " + city.slice(10);
          }

          let state = p.state || "";
          if (STATE_MAP[state]) {
            state = STATE_MAP[state];
          }

          if (
            city.toLowerCase().includes("jakarta") ||
            district.toLowerCase().includes("priok") ||
            district.toLowerCase().includes("kemayoran") ||
            district.toLowerCase().includes("sunter") ||
            district.toLowerCase().includes("cilincing")
          ) {
            state = "DKI Jakarta";
          }

          const parts = [
            name,
            street && street !== name ? street : null,
            district,
            city,
            state,
            p.postcode,
          ].filter(Boolean);

          return {
            place_id: p.osm_id || Math.floor(Math.random() * 1000000),
            lat: String(f.geometry?.coordinates?.[1] || ""),
            lon: String(f.geometry?.coordinates?.[0] || ""),
            display_name: parts.join(", "),
            address: {
              road: street || name,
              house_number: p.housenumber || "",
              district: district,
              city: city,
              county: p.county || "",
              state: state,
              postcode: p.postcode || "",
              country: p.country || "Indonesia",
            },
          };
        });

        return NextResponse.json(results);
      }
    }
  } catch (err) {
    console.warn("Photon search error, falling back to Nominatim:", err);
  }

  // 2. Fallback ke Nominatim jika Photon tidak menemukan hasil
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&countrycodes=id&accept-language=id&q=${encodeURIComponent(
      queryToSearch
    )}`;

    const resNom = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "BecdexApp/1.0 (info@becdex.com; maritimmuda.id)",
        "Accept-Language": "id,en",
      },
    });

    if (resNom.ok) {
      const nomData = await resNom.json();
      if (Array.isArray(nomData)) {
        return NextResponse.json(nomData);
      }
    }
  } catch (err) {
    console.warn("Nominatim fallback error:", err);
  }

  return NextResponse.json([]);
}
