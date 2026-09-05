-- ============================================================================
-- AbangReno.my — Report Anti-Abuse
-- §13 — reports must never auto-delete content, but anonymous/authenticated
-- reporting still needs basic rate limiting to prevent spam/harassment
-- campaigns against a vendor or reviewer.
-- ============================================================================

alter table reports add column if not exists ip_hash text;
create index if not exists idx_reports_ip_hash on reports(ip_hash);
create index if not exists idx_reports_ip_hash_created on reports(ip_hash, created_at);
