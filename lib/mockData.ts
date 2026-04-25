import { Sighting } from './supabase';

export const MOCK_SIGHTINGS: Sighting[] = [
  {
    id: 'mock-1',
    reporter_id: 'mock-user',
    // Karaköy Meydanı — iskele önü açık alan
    lat: 41.02295,
    lng: 28.97388,
    neighborhood: 'Karaköy',
    cat_count: 3,
    notes: 'İskele meydanında, genellikle sabah burada oluyorlar',
    photo_url: null,
    active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    profiles: { nickname: 'KediSever42' },
    feeding_count: 2,
  },
  {
    id: 'mock-2',
    reporter_id: 'mock-user',
    // Rıhtım Caddesi — sahil yolu üzeri
    lat: 41.02198,
    lng: 28.97512,
    neighborhood: 'Karaköy',
    cat_count: 1,
    notes: 'Çok sevimli, tekir, mama kabı yok',
    photo_url: null,
    active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    profiles: { nickname: 'İstanbulluKedi' },
    feeding_count: 0,
  },
  {
    id: 'mock-3',
    reporter_id: 'mock-user',
    // Kemeraltı Caddesi — yaya bölgesi ortası
    lat: 41.02441,
    lng: 28.97601,
    neighborhood: 'Karaköy',
    cat_count: 5,
    notes: 'Kemeraltı çarşısında küçük bir koloni, düzenli mama bırakılıyor',
    photo_url: null,
    active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    profiles: { nickname: 'MamaAnne' },
    feeding_count: 7,
  },
  {
    id: 'mock-4',
    reporter_id: 'mock-user',
    // Bankalar Caddesi — cadde kaldırımı
    lat: 41.02372,
    lng: 28.97698,
    neighborhood: 'Karaköy',
    cat_count: 2,
    notes: 'Bankalar Caddesi kaldırımında, çok sakin kediler',
    photo_url: null,
    active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    profiles: { nickname: 'PatilliDost' },
    feeding_count: 1,
  },
  {
    id: 'mock-5',
    reporter_id: 'mock-user',
    // Voyvoda Caddesi — Galata yönü kaldırım
    lat: 41.02521,
    lng: 28.97448,
    neighborhood: 'Karaköy',
    cat_count: 4,
    notes: 'Voyvoda Caddesi üzerinde, sağlıklı görünüyorlar',
    photo_url: null,
    active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    profiles: { nickname: 'KaraköylüKedi' },
    feeding_count: 5,
  },
];

export const MOCK_PROFILE = {
  id: 'mock-user',
  role: 'feeder' as const,
  nickname: 'Demo Kullanıcı',
  avatar_url: null,
  created_at: new Date().toISOString(),
};
