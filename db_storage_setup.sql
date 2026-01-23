-- Create a new public bucket 'team-logos'
insert into storage.buckets (id, name, public)
values ('team-logos', 'team-logos', true) on conflict (id) do nothing;
-- Policy to allow public access to view files
create policy "Public Access" on storage.objects for
select using (bucket_id = 'team-logos');
-- Policy to allow authenticated users (anyone logged in) to upload/update files
-- Ideally this should be restricted to admins, but for now authenticated is safer than anon
create policy "Authenticated Insert" on storage.objects for
insert to authenticated with check (bucket_id = 'team-logos');
create policy "Authenticated Update" on storage.objects for
update to authenticated using (bucket_id = 'team-logos');