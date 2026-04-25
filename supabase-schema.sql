-- Miaow — Supabase şeması
-- Supabase Dashboard > SQL Editor'a yapıştırıp çalıştır

-- Kullanıcı profilleri
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT CHECK (role IN ('reporter', 'feeder')),
  nickname    TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Kedi bildirimleri
CREATE TABLE sightings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lat           FLOAT8 NOT NULL,
  lng           FLOAT8 NOT NULL,
  neighborhood  TEXT,
  cat_count     INT DEFAULT 1 CHECK (cat_count > 0),
  notes         TEXT,
  photo_url     TEXT,
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Mama bırakma kayıtları
CREATE TABLE feedings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sighting_id  UUID REFERENCES sightings(id) ON DELETE CASCADE,
  feeder_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  note         TEXT,
  fed_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Indexler
CREATE INDEX idx_sightings_active ON sightings(active) WHERE active = TRUE;
CREATE INDEX idx_sightings_reporter ON sightings(reporter_id);
CREATE INDEX idx_feedings_sighting ON feedings(sighting_id);

-- Row Level Security (RLS)
ALTER TABLE profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sightings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedings  ENABLE ROW LEVEL SECURITY;

-- profiles: herkes okuyabilir, sadece kendi profilini güncelleyebilir
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- sightings: herkes aktif bildirimleri okuyabilir, reporter kendi bildirimini ekler
CREATE POLICY "sightings_select" ON sightings FOR SELECT USING (active = TRUE);
CREATE POLICY "sightings_insert" ON sightings FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "sightings_update" ON sightings FOR UPDATE USING (auth.uid() = reporter_id);

-- feedings: herkes okuyabilir, giriş yapmış kullanıcı ekleyebilir
CREATE POLICY "feedings_select" ON feedings FOR SELECT USING (TRUE);
CREATE POLICY "feedings_insert" ON feedings FOR INSERT WITH CHECK (auth.uid() = feeder_id);

-- Realtime yayın (Supabase Realtime için)
ALTER PUBLICATION supabase_realtime ADD TABLE sightings;

-- Storage bucket (cat-photos) — Supabase Dashboard > Storage'dan oluştur
-- ya da aşağıdaki SQL ile:
INSERT INTO storage.buckets (id, name, public)
VALUES ('cat-photos', 'cat-photos', TRUE);

CREATE POLICY "cat_photos_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'cat-photos');

CREATE POLICY "cat_photos_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'cat-photos' AND auth.role() = 'authenticated');
