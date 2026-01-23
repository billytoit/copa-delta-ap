-- Get valid Team Names
SELECT name
FROM teams
ORDER BY name;
-- Get Check Constraints for Roles (if accessible via standard views) or just show current roles
-- Actually, better to just list the known roles from our SQL scripts: 'admin', 'player', 'official', 'fan', 'operador'
-- But let's check what's actually in use or defined if possible.
SELECT unnest(enum_range(NULL::text []));
-- This won't work as we used a check constraint on TEXT, not an ENUM type.
-- Instead, let's look at the constraint definition in information_schema if possible, 
-- or just rely on my knowledge of the schema we built ('player', 'admin', 'official', 'veedor'?, 'operador'?)
-- Let's check user_roles table definition to be sure.
SELECT substring(pg_get_constraintdef(oid), 7) as check_constraint
FROM pg_constraint
WHERE conrelid = 'public.user_roles'::regclass
    AND contype = 'c';