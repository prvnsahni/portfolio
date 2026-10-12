-- Storage bucket for profile images. Public read; each user may write only
-- inside their own folder: avatars/{user_id}/...
-- Run after 0001_init.sql.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Public read of any avatar.
drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects
  for select using (bucket_id = 'avatars');

-- Insert/update/delete restricted to the owner's own top-level folder, which
-- must equal their user id. storage.foldername(name)[1] is the first segment.
drop policy if exists avatars_insert_own on storage.objects;
create policy avatars_insert_own on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_update_own on storage.objects;
create policy avatars_update_own on storage.objects
  for update using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_delete_own on storage.objects;
create policy avatars_delete_own on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
