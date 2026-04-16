CREATE TABLE IF NOT EXISTS users (
    id          VARCHAR(32) PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    avatar_url  TEXT,
    role        VARCHAR(20)  NOT NULL DEFAULT 'member',
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    last_login  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);

CREATE TABLE IF NOT EXISTS environments (
    id           VARCHAR(32)  PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    template     VARCHAR(50)  NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'provisioning',
    tier         VARCHAR(20)  NOT NULL DEFAULT 'small',
    owner_id     VARCHAR(32)  NOT NULL REFERENCES users(id),
    namespace    VARCHAR(100) NOT NULL UNIQUE,
    auto_destroy BOOLEAN      NOT NULL DEFAULT FALSE,
    ttl_hours    INTEGER      NOT NULL DEFAULT 0,
    resources    INTEGER      NOT NULL DEFAULT 0,
    last_deploy  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_environments_owner   ON environments (owner_id);
CREATE INDEX idx_environments_status  ON environments (status);

CREATE TABLE IF NOT EXISTS deployments (
    id              VARCHAR(32)  PRIMARY KEY,
    environment_id  VARCHAR(32)  NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
    commit_sha      VARCHAR(40)  NOT NULL,
    commit_message  TEXT         NOT NULL DEFAULT '',
    author          VARCHAR(255) NOT NULL DEFAULT '',
    image_tag       VARCHAR(255) NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'pending',
    strategy        VARCHAR(20)  NOT NULL DEFAULT 'rolling',
    duration_sec    DOUBLE PRECISION NOT NULL DEFAULT 0,
    vulnerabilities INTEGER      NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    finished_at     TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deployments_env     ON deployments (environment_id);
CREATE INDEX idx_deployments_status  ON deployments (status);
CREATE INDEX idx_deployments_created ON deployments (created_at DESC);
