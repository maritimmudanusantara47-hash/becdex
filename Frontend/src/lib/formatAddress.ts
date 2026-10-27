const KEEP_UPPERCASE = [
  "PT",
  "CV",
  "UD",
  "RT",
  "RW",
  "KAV",
  "NO",
  "KM",
  "TBK",
  "BICC",
  "MMIC",
];

export function formatSmartAddress(address: string): string {
  if (!address || !address.trim()) return "";

  // 1. Bersihkan koma dobel dan spasi berulang
  let clean = address.replace(/,(\s*,)+/g, ",");
  clean = clean.replace(/\s*,\s*/g, ", ");
  clean = clean.replace(/\s+/g, " ");
  clean = clean.replace(/^[\s,]+|[\s,]+$/g, "");

  // 2. Smart Title Case (Ubah CAPSLOCK namun jaga singkatan)
  const words = clean.split(" ");
  const formatted = words.map((word) => {
    const cleanWord = word.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

    if (KEEP_UPPERCASE.includes(cleanWord)) {
      return word.toUpperCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  let result = formatted.join(" ");

  // 3. Standarisasi singkatan umum
  result = result.replace(/\bNo\.\s*/gi, "No. ");
  result = result.replace(/\bJl\.\s*/gi, "Jl. ");
  result = result.replace(/\bKode Pos:\s*/gi, "Kode Pos: ");

  return result.trim();
}

