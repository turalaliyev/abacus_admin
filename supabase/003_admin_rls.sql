-- Run in Supabase SQL Editor AFTER 001_initial_schema.sql
-- Enables authenticated admin users to manage CMS data

-- ─── Admin write policies (authenticated users) ─────────────────────────────
CREATE POLICY "Admin all media_assets"    ON media_assets    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin all site_settings"   ON site_settings   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin all nav_items"       ON nav_items       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin all team_members"    ON team_members    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin all services"        ON services        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin all stats"           ON stats           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin all partners"        ON partners        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin all why_us_items"    ON why_us_items    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin all blog_posts"      ON blog_posts      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin all academy_courses" ON academy_courses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin all academy_quiz_questions" ON academy_quiz_questions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Admin can read all nav_items including hidden
CREATE POLICY "Admin read all nav_items" ON nav_items FOR SELECT TO authenticated USING (true);

-- ─── Storage: site-media bucket + policies ──────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-media', 'site-media', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public read site-media" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload site-media" ON storage.objects;
DROP POLICY IF EXISTS "Admin update site-media" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete site-media" ON storage.objects;

-- Public read (required for getPublicUrl on the website)
CREATE POLICY "Public read site-media"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'site-media');

-- Authenticated admin can upload / manage files
CREATE POLICY "Admin upload site-media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-media');

CREATE POLICY "Admin update site-media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'site-media')
  WITH CHECK (bucket_id = 'site-media');

CREATE POLICY "Admin delete site-media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site-media');
