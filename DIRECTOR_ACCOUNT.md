# Compte Director Swissnaut

Ce fichier explique comment activer le compte directeur sans mettre de mot de passe dans le code.

## Ce que permet le compte Director

- Voir toutes les comptes créés dans Swissnaut.
- Voir tous les profils professionnels / brokers.
- Voir toutes les annonces créées et publiées.
- Supprimer une annonce de la web depuis `/fr/admin`.
- Garder une trace de chaque suppression dans `admin_actions`.

## Créer ou choisir le compte

1. Ouvrir Supabase.
2. Aller dans **Authentication**.
3. Créer un utilisateur avec votre email, ou choisir un utilisateur déjà créé.
4. Garder cet email pour l'étape SQL.

## Activer les droits Director

Dans Supabase, ouvrir **SQL Editor**, remplacer `votre-email@example.com` par votre email réel, puis exécuter:

```sql
with director as (
  select id
  from auth.users
  where email = 'votre-email@example.com'
),
director_profile as (
  insert into public.profiles (
    id,
    role,
    account_type,
    full_name,
    preferred_locale,
    created_at,
    updated_at
  )
  select
    id,
    'admin',
    'admin',
    'Director Swissnaut',
    'fr',
    now(),
    now()
  from director
  on conflict (id) do update
  set
    role = 'admin',
    account_type = 'admin',
    full_name = 'Director Swissnaut',
    updated_at = now()
  returning id
),
company as (
  insert into public.professional_profiles (
    user_id,
    company_name,
    slug,
    country,
    languages,
    description,
    published_at
  )
  select
    id,
    'Swissnaut',
    'swissnaut-director',
    'Switzerland',
    array['fr', 'de', 'it', 'en'],
    'Compte directeur Swissnaut.',
    now()
  from director_profile
  on conflict (user_id) do update
  set
    company_name = 'Swissnaut',
    slug = 'swissnaut-director',
    published_at = coalesce(public.professional_profiles.published_at, now()),
    updated_at = now()
  returning id, user_id
)
insert into public.professional_members (
  professional_profile_id,
  user_id,
  role,
  accepted_at
)
select id, user_id, 'owner', now()
from company
on conflict (professional_profile_id, user_id) do update
set
  role = 'owner',
  accepted_at = coalesce(public.professional_members.accepted_at, now());
```

## Accéder au panneau

1. Se connecter sur la web avec ce compte.
2. Ouvrir `/fr/admin`.
3. Les autres comptes ne pourront pas voir ce panneau.

## Important

Ne jamais écrire le mot de passe du compte Director dans le dépôt GitHub.
