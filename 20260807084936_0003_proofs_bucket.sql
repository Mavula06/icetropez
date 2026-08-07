/*
# Create proofs storage bucket

1. Storage bucket `proofs` for deposit proof-of-payment uploads.
2. Public read (so admins and users can view uploaded proofs).
3. Authenticated users can upload to their own proof files.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('proofs', 'proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read
DROP POLICY IF EXISTS "proofs_public_read" ON storage.objects;
CREATE POLICY "proofs_public_read" ON storage.objects FOR SELECT
  TO public USING (bucket_id = 'proofs');

-- Allow authenticated users to upload
DROP POLICY IF EXISTS "proofs_auth_insert" ON storage.objects;
CREATE POLICY "proofs_auth_insert" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'proofs');

-- Allow authenticated users to update their own
DROP POLICY IF EXISTS "proofs_auth_update" ON storage.objects;
CREATE POLICY "proofs_auth_update" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'proofs' AND owner = auth.uid());
