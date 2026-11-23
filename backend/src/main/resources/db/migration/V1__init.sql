CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    role          VARCHAR(20)  NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE posts (
    id           BIGSERIAL PRIMARY KEY,
    slug         VARCHAR(200) NOT NULL UNIQUE,
    title        VARCHAR(200) NOT NULL,
    summary      VARCHAR(500),
    content      TEXT         NOT NULL,
    cover_image  VARCHAR(500),
    status       VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
    view_count   BIGINT       NOT NULL DEFAULT 0,
    like_count   BIGINT       NOT NULL DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(content, '')), 'C')
    ) STORED
);
CREATE INDEX idx_posts_search ON posts USING GIN (search_vector);
CREATE INDEX idx_posts_status_published ON posts (status, published_at DESC);

CREATE TABLE post_tags (
    post_id BIGINT      NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
    tag     VARCHAR(50) NOT NULL,
    PRIMARY KEY (post_id, tag)
);
CREATE INDEX idx_post_tags_tag ON post_tags (tag);

CREATE TABLE comments (
    id          BIGSERIAL PRIMARY KEY,
    post_id     BIGINT       NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
    parent_id   BIGINT REFERENCES comments (id) ON DELETE CASCADE,
    author_name VARCHAR(80)  NOT NULL,
    content     VARCHAR(2000) NOT NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_comments_post ON comments (post_id, status);

CREATE TABLE contact_messages (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100)  NOT NULL,
    email      VARCHAR(200)  NOT NULL,
    subject    VARCHAR(200),
    message    VARCHAR(5000) NOT NULL,
    handled    BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);
