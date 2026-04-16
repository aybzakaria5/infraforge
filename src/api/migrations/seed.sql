-- Seed data for local development and demos
-- Run after migrations: psql -d infraforge -f seed.sql

INSERT INTO users (id, email, name, avatar_url, role, active) VALUES
    ('usr-a1b2c3d4e5f60001', 'ayoub@infraforge.dev',  'Ayoub Zakarya',  'https://avatars.githubusercontent.com/u/1001', 'admin',  TRUE),
    ('usr-a1b2c3d4e5f60002', 'sarah@infraforge.dev',  'Sarah Chen',     'https://avatars.githubusercontent.com/u/1002', 'member', TRUE),
    ('usr-a1b2c3d4e5f60003', 'marcus@infraforge.dev', 'Marcus Johnson', 'https://avatars.githubusercontent.com/u/1003', 'member', TRUE),
    ('usr-a1b2c3d4e5f60004', 'priya@infraforge.dev',  'Priya Sharma',   'https://avatars.githubusercontent.com/u/1004', 'viewer', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO environments (id, name, template, status, tier, owner_id, namespace, auto_destroy, ttl_hours, resources, last_deploy) VALUES
    ('env-a1b2c3d400000001', 'api-gateway-prod',       'production',  'running',      'large',  'usr-a1b2c3d4e5f60001', 'api-gateway-prod-a1b2c3d4',       FALSE, 0,  14, NOW() - INTERVAL '2 hours'),
    ('env-a1b2c3d400000002', 'auth-service-staging',    'staging',     'running',      'medium', 'usr-a1b2c3d4e5f60002', 'auth-service-staging-b2c3d4e5',   FALSE, 0,  8,  NOW() - INTERVAL '5 hours'),
    ('env-a1b2c3d400000003', 'payment-service-dev',     'development', 'running',      'small',  'usr-a1b2c3d4e5f60003', 'payment-service-dev-c3d4e5f6',    TRUE,  48, 4,  NOW() - INTERVAL '1 day'),
    ('env-a1b2c3d400000004', 'worker-v2-canary',        'staging',     'deploying',    'medium', 'usr-a1b2c3d4e5f60001', 'worker-v2-canary-d4e5f6a7',       FALSE, 0,  8,  NOW() - INTERVAL '15 minutes'),
    ('env-a1b2c3d400000005', 'notification-service-qa', 'staging',     'running',      'small',  'usr-a1b2c3d4e5f60002', 'notification-service-qa-e5f6a7b8', TRUE, 24, 4,  NOW() - INTERVAL '3 hours'),
    ('env-a1b2c3d400000006', 'search-indexer-prod',     'production',  'running',      'large',  'usr-a1b2c3d4e5f60003', 'search-indexer-prod-f6a7b8c9',    FALSE, 0,  14, NOW() - INTERVAL '12 hours'),
    ('env-a1b2c3d400000007', 'ml-pipeline-experiment',  'development', 'failed',       'medium', 'usr-a1b2c3d4e5f60004', 'ml-pipeline-exp-a7b8c9d0',        TRUE,  72, 8,  NOW() - INTERVAL '2 days'),
    ('env-a1b2c3d400000008', 'legacy-api-migration',    'staging',     'provisioning', 'small',  'usr-a1b2c3d4e5f60001', 'legacy-api-migration-b8c9d0e1',   FALSE, 0,  4,  NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO deployments (id, environment_id, commit_sha, commit_message, author, image_tag, status, strategy, duration_sec, vulnerabilities, finished_at) VALUES
    ('dep-f1e2d3c400000001', 'env-a1b2c3d400000001', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'fix: resolve race condition in rate limiter',              'Ayoub Zakarya',  'infraforge-api:v1.4.2',  'success', 'canary',     154.3, 0,  NOW() - INTERVAL '2 hours'),
    ('dep-f1e2d3c400000002', 'env-a1b2c3d400000002', 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1', 'feat: add OAuth2 PKCE flow support',                       'Sarah Chen',     'auth-service:v2.1.0',    'success', 'rolling',    87.6,  2,  NOW() - INTERVAL '5 hours'),
    ('dep-f1e2d3c400000003', 'env-a1b2c3d400000003', 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2', 'refactor: extract payment validation into shared module',  'Marcus Johnson', 'payment-svc:v0.9.1-dev', 'success', 'rolling',    62.1,  0,  NOW() - INTERVAL '1 day'),
    ('dep-f1e2d3c400000004', 'env-a1b2c3d400000004', 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3', 'feat: implement batch job retry with exponential backoff', 'Ayoub Zakarya',  'worker:v3.0.0-rc1',      'running', 'canary',     0,     1,  NULL),
    ('dep-f1e2d3c400000005', 'env-a1b2c3d400000005', 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4', 'fix: correct email template escaping for HTML content',    'Sarah Chen',     'notif-svc:v1.2.3',       'success', 'rolling',    45.8,  0,  NOW() - INTERVAL '3 hours'),
    ('dep-f1e2d3c400000006', 'env-a1b2c3d400000001', 'f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5', 'chore: bump go dependencies and regenerate protos',        'Marcus Johnson', 'infraforge-api:v1.4.1',  'success', 'blue-green', 198.2, 0,  NOW() - INTERVAL '1 day'),
    ('dep-f1e2d3c400000007', 'env-a1b2c3d400000007', 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6', 'feat: add feature store integration for model serving',    'Priya Sharma',   'ml-pipeline:v0.3.0',     'failed',  'rolling',    312.5, 5,  NOW() - INTERVAL '2 days'),
    ('dep-f1e2d3c400000008', 'env-a1b2c3d400000006', 'b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7', 'perf: optimize elasticsearch bulk indexing batch size',    'Marcus Johnson', 'search-indexer:v2.0.1',  'success', 'canary',     176.4, 1,  NOW() - INTERVAL '12 hours')
ON CONFLICT (id) DO NOTHING;
