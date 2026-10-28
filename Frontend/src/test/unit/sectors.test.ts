import { describe, it, expect } from 'vitest';
import { getSectorLabel, SECTOR_ID_MAP, DEFAULT_COUNTRIES, DEFAULT_SECTORS } from '@/constants/sectors';

describe('Bilingual Sector Label Helper', () => {
  it('returns english name when locale is "en"', () => {
    const sector = {
      id: 1,
      name: 'Marine Fisheries and Aquaculture',
      name_id: 'Perikanan dan Akuakultur Laut',
    };
    expect(getSectorLabel(sector, 'en')).toBe('Marine Fisheries and Aquaculture');
  });

  it('prioritizes name_id from database when locale is "id"', () => {
    const sector = {
      id: 1,
      name: 'Marine Fisheries and Aquaculture',
      name_id: 'Perikanan dan Akuakultur Laut Khusus',
    };
    expect(getSectorLabel(sector, 'id')).toBe('Perikanan dan Akuakultur Laut Khusus');
  });

  it('falls back to dictionary map if name_id is null/undefined when locale is "id"', () => {
    const sector = {
      id: 2,
      name: 'Maritime Transport, Shipping, and Ports',
      name_id: null,
    };
    expect(getSectorLabel(sector, 'id')).toBe('Transportasi Maritim, Pelayaran, dan Pelabuhan');
  });

  it('falls back to dictionary map if name_id is empty string when locale is "id"', () => {
    const sector = {
      id: 3,
      name: 'Marine Tourism and Cruise Ships',
      name_id: '',
    };
    expect(getSectorLabel(sector, 'id')).toBe('Pariwisata Bahari dan Kapal Pesiar');
  });

  it('falls back to raw name if neither name_id nor dictionary has a match when locale is "id"', () => {
    const sector = {
      id: 99,
      name: 'Unknown Futuristic Sector',
    };
    expect(getSectorLabel(sector, 'id')).toBe('Unknown Futuristic Sector');
  });

  it('correctly maps all 12 official blue economy sectors in SECTOR_ID_MAP', () => {
    expect(SECTOR_ID_MAP['Marine Fisheries and Aquaculture']).toBe('Perikanan dan Akuakultur Laut');
    expect(SECTOR_ID_MAP['Maritime Transport, Shipping, and Ports']).toBe('Transportasi Maritim, Pelayaran, dan Pelabuhan');
    expect(SECTOR_ID_MAP['Marine Tourism and Cruise Ships']).toBe('Pariwisata Bahari dan Kapal Pesiar');
    expect(SECTOR_ID_MAP['Biotechnology and Marine Bioproducts Processing']).toBe('Bioteknologi dan Pengolahan Bioproduk Laut');
    expect(SECTOR_ID_MAP['Seawater Desalination']).toBe('Desalinasi Air Laut');
    expect(SECTOR_ID_MAP['Deep Sea Mining, Oil, and Gas']).toBe('Pertambangan, Minyak, dan Gas Laut Dalam');
    expect(SECTOR_ID_MAP['Marine Renewable Energy']).toBe('Energi Terbarukan Laut');
    expect(SECTOR_ID_MAP['Ship and Boat Building']).toBe('Pembuatan Kapal dan Perahu');
    expect(SECTOR_ID_MAP['Ocean Building']).toBe('Bangunan Laut');
    expect(SECTOR_ID_MAP['Marine Defense and Security']).toBe('Pertahanan dan Keamanan Laut');
    expect(SECTOR_ID_MAP['Maritime Research and Education']).toBe('Riset dan Edukasi Maritim');
    expect(SECTOR_ID_MAP['Marine Communication, Equipment and Instrumentation']).toBe('Komunikasi, Peralatan, dan Instrumentasi Kelautan');
  });

  it('provides comprehensive default fallback countries and sectors', () => {
    expect(DEFAULT_COUNTRIES.length).toBeGreaterThan(100);
    expect(DEFAULT_COUNTRIES.some(c => c.iso === 'ID')).toBe(true);
    expect(DEFAULT_SECTORS.length).toBe(12);
  });
});
