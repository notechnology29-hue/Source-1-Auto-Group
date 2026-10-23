-- Run FIRST, on its own (one query, nothing else), before migration-002-dealer-layout.sql.
-- A new enum value can't be used in the same transaction that adds it.
alter type inquiry_type add value if not exists 'contact';
