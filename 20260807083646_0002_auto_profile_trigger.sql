/*
# Auto-create profile on signup

When a new user registers via Supabase Auth, a row is inserted into auth.users.
This trigger automatically creates a matching public.profiles row with a
unique referral code, so the app never has to create the profile client-side
(which can race with the wallet-creation trigger on public.profiles).

## Changes
1. New function `public.handle_new_auth_user()` — SECURITY DEFINER, reads the
   new auth row, generates a referral code, and inserts into public.profiles.
2. Trigger `on_auth_user_created` fires AFTER INSERT on auth.users.
3. The existing `on_profile_created` trigger (from migration 0001) then creates
   the wallet automatically.

## Notes
1. Referral linking (referred_by) is still handled client-side after signup
   because the referral code is supplied by the invitee, not available in
   auth metadata at insert time.
2. The function is idempotent via ON CONFLICT DO NOTHING on the profiles PK.
*/

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  code text;
BEGIN
  code := upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
  INSERT INTO public.profiles (id, email, full_name, phone, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    coalesce(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    coalesce(NEW.raw_user_meta_data->>'phone', null),
    code
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
