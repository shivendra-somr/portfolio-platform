-- Starter blog posts about how this site was built.
-- Runs once per database (Flyway). Edit or delete them later from the admin panel;
-- ON CONFLICT keeps this safe if a post with the same slug already exists.

INSERT INTO posts (slug, title, summary, content, status, published_at, created_at, updated_at) VALUES
(
  'how-i-designed-jwt-auth-in-spring-boot',
  'How I designed JWT auth in Spring Boot',
  'Stateless tokens using Spring Security''s OAuth2 resource server instead of a hand-rolled filter.',
  $md$The admin panel of this site is protected by **stateless JWT authentication**. A lot of tutorials write a custom `OncePerRequestFilter` that parses the token by hand. I went a different way: Spring Security already ships a JWT validator in its **OAuth2 resource server**, and it works just as well when your own app issues the tokens.

## The requirements

- Two roles: `ADMIN` (writes posts, moderates comments) and `VISITOR`.
- No server-side sessions, so the backend can restart or scale without logging anyone out.
- Public endpoints (reading posts, posting comments) must stay open.

## Issuing tokens

On login, I check the BCrypt hash and build a signed token with `JwtEncoder`:

```java
JwtClaimsSet claims = JwtClaimsSet.builder()
    .issuer("portfolio-backend")
    .subject(user.getUsername())
    .issuedAt(now)
    .expiresAt(now.plus(ttl))
    .claim("roles", List.of(user.getRole().name()))
    .build();

String token = jwtEncoder.encode(
    JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)
).getTokenValue();
```

The encoder is a `NimbusJwtEncoder` backed by an HMAC secret that comes from an environment variable. The app refuses to start if the secret is shorter than 32 bytes, because a short HS256 key is easy to brute-force.

## Validating them

Validation is one line of configuration:

```java
http.oauth2ResourceServer(o -> o.jwt(jwt ->
    jwt.jwtAuthenticationConverter(jwtAuthConverter())));
```

The only customisation is mapping my `roles` claim to Spring authorities:

```java
var authorities = new JwtGrantedAuthoritiesConverter();
authorities.setAuthoritiesClaimName("roles");
authorities.setAuthorityPrefix("ROLE_");
```

Now `hasRole("ADMIN")` just works, and expired or tampered tokens are rejected before my code ever runs.

## Authorization rules

```java
.requestMatchers("/api/admin/**").hasRole("ADMIN")
.requestMatchers(HttpMethod.GET, "/api/**").permitAll()
.requestMatchers(HttpMethod.POST, "/api/auth/**", "/api/contact",
                 "/api/posts/*/comments", "/api/posts/*/like").permitAll()
.anyRequest().authenticated()
```

Order matters: the admin rule comes first so `GET /api/admin/posts` isn't caught by the public `GET` rule.

## Trade-offs

- **HS256 vs RS256.** One service both issues and validates tokens, so a shared secret is simpler. If another service needed to verify tokens, I'd switch to RS256 and publish the public key.
- **No refresh tokens.** Tokens last two hours and the admin logs in again. For a single-admin blog that's the right amount of complexity.
- **Token storage.** The frontend keeps the token in `localStorage`. An `HttpOnly` cookie would be safer against XSS, at the cost of CSRF handling.

The full code is in the `auth` and `config` packages of the backend.
$md$,
  'PUBLISHED', TIMESTAMPTZ '2026-11-10 09:00:00+05:30', now(), now()
),
(
  'postgresql-full-text-search-before-elasticsearch',
  'Full-text search with PostgreSQL before reaching for Elasticsearch',
  'A generated tsvector column, a GIN index and websearch_to_tsquery give this blog ranked search with no extra service.',
  $md$When I planned search for this blog, the obvious answer was Elasticsearch. But it's another service to run, secure and keep in sync. PostgreSQL has had solid full-text search for years, so I started there.

## A generated, weighted search column

```sql
search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')),   'A') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'C')
) STORED
```

Three things are happening:

1. `to_tsvector('english', …)` lowercases, drops stop words and stems words, so *tokens*, *token* and *tokenized* all match.
2. `setweight` marks title matches as more important than summary or body matches.
3. `GENERATED ALWAYS … STORED` means PostgreSQL keeps the column up to date on every insert and update. No triggers, and no sync job that can fall behind.

Then a GIN index makes lookups fast:

```sql
CREATE INDEX idx_posts_search ON posts USING GIN (search_vector);
```

## Querying from Spring Data JPA

```java
@Query(value = """
    SELECT * FROM posts
    WHERE status = 'PUBLISHED'
      AND search_vector @@ websearch_to_tsquery('english', :q)
    ORDER BY ts_rank(search_vector, websearch_to_tsquery('english', :q)) DESC
    """, nativeQuery = true)
Page<Post> search(String q, Pageable pageable);
```

`websearch_to_tsquery` is the important choice. It accepts what people actually type into a search box, including `"quoted phrases"`, `or` and `-excluded` words, and it never throws a syntax error on odd input, unlike `to_tsquery`.

One detail: the generated column isn't mapped in the JPA entity. Hibernate never writes it, and `ddl-auto=validate` doesn't complain about unmapped columns.

## When I'd move to Elasticsearch

- Typo tolerance and fuzzy matching.
- Search across many content types with facets.
- Millions of documents or heavy query traffic.

For a blog with dozens of posts, PostgreSQL search is fast, ranked and has zero operational cost. Try it with the search box on the blog page.
$md$,
  'PUBLISHED', TIMESTAMPTZ '2026-11-14 09:00:00+05:30', now(), now()
),
(
  'caching-spring-boot-what-to-cache-and-when-to-evict',
  'Caching in Spring Boot: what to cache and when to evict',
  'Caching the read path of a blog with @Cacheable, evicting on writes, and keeping view counters out of the cache.',
  $md$Most requests to a blog are reads of the same few posts, so caching is an easy win. The hard part isn't adding `@Cacheable`. It's deciding **what** to cache and **when** to throw it away.

## What I cache

| Cache | Key | Why |
|---|---|---|
| `postBySlug` | post slug | Every article view |
| `popularPosts` | none | Shown on several pages |
| `postTags` | none | Tag filter on the blog page |

```java
@Cacheable(CACHE_POST)
@Transactional(readOnly = true)
public PostDetail getPublished(String slug) {
    return posts.findBySlugAndStatus(slug, PostStatus.PUBLISHED)
        .map(PostDtos::toDetail)
        .orElseThrow(() -> new NotFoundException("Post not found: " + slug));
}
```

I cache **DTOs, not JPA entities**. A cached entity is detached, can trigger lazy-loading errors later, and drags Hibernate internals into the serialized value.

## Evicting on writes

Any admin create, update or delete clears all three caches:

```java
@Caching(evict = {
    @CacheEvict(value = CACHE_POST, allEntries = true),
    @CacheEvict(value = CACHE_POPULAR, allEntries = true),
    @CacheEvict(value = CACHE_TAGS, allEntries = true)})
@Transactional
public PostDetail update(Long id, PostRequest req) { ... }
```

`allEntries = true` looks heavy-handed, but writes happen a few times a week. A changed slug or tag can affect several keys, and clearing everything is simpler than tracking them precisely. That simplicity is worth more than a slightly higher hit rate.

## What I deliberately don't cache

**View counts.** If reading a post incremented a counter on the cached object, every view would either invalidate the cache or write stale data. Instead, the controller reads the cached post and then fires a direct update:

```java
@Modifying
@Query("update Post p set p.viewCount = p.viewCount + 1 where p.id = :id")
void incrementViews(Long id);
```

The cached copy shows a slightly old count, which is fine for a blog.

## Redis or in-memory?

The cache provider is configuration only: `spring.cache.type=redis` locally and in Docker, `simple` (in-memory) on the free hosting tier. With a single backend instance, in-memory works just as well. Redis matters once you run several instances that need to share one cache.
$md$,
  'PUBLISHED', TIMESTAMPTZ '2026-11-18 09:00:00+05:30', now(), now()
),
(
  'deploying-spring-boot-react-for-free',
  'Deploying a Spring Boot + React app for free: Render, Neon and Netlify',
  'What it took to run this site at zero cost: binding to $PORT, fitting the JVM in 512 MB, and proxying the API through Netlify.',
  $md$This site runs entirely on free tiers: the React frontend on **Netlify**, the Spring Boot API on **Render**, and PostgreSQL on **Neon**. Getting there took a few small but important changes.

## Why the database isn't on Render

Render offers free PostgreSQL, but free databases expire after 30 days and have no backups. Neon's free plan doesn't expire, so the API on Render connects to Neon over TLS:

```
jdbc:postgresql://<host>.neon.tech/<db>?sslmode=require
```

Free Postgres plans also limit connections, so I shrank the Hikari pool from the default 10 to 5.

## Bind to the port the platform gives you

Render tells the container which port to listen on through `$PORT`:

```yaml
server:
  port: ${PORT:8080}
```

## Fit the JVM into 512 MB

The free instance has 512 MB of RAM. By default the JVM sizes its heap without much regard for that, and the container gets killed. The Dockerfile sets:

```dockerfile
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC -Xss512k -XX:TieredStopAtLevel=1"
```

- `MaxRAMPercentage=75` sizes the heap from the container limit.
- `UseSerialGC` has the lowest memory overhead for a single small instance.
- `TieredStopAtLevel=1` trades peak throughput for faster startup, which matters because free instances sleep and cold-start.

In testing, the app settled around 320 MB and started in under 4 seconds.

## Make the health check honest

Render restarts a service whose health check fails. Spring Boot's `/actuator/health` includes Redis and mail checks by default, so without Redis it reported `DOWN`. Disabling those indicators when they aren't in use fixed it:

```yaml
management.health.redis.enabled: ${REDIS_HEALTH_ENABLED:true}
management.health.mail.enabled: false
```

## One origin: let Netlify proxy the API

Instead of calling `https://<backend>.onrender.com` from the browser, Netlify forwards `/api/*`:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://<backend>.onrender.com/api/:splat"
  status = 200
  force = true
```

The browser only ever talks to one domain, so there are no CORS preflights and no API URL baked into the build. A second rule sends every other path to `index.html`, so refreshing `/blog/some-post` doesn't return a 404.

## The catch

Free Render services sleep after 15 minutes without traffic, and Neon's free database sleeps too. The first request after a quiet period can take close to a minute. For a portfolio that's an acceptable trade, and a free uptime monitor pinging `/actuator/health` keeps it warm.
$md$,
  'PUBLISHED', TIMESTAMPTZ '2026-11-24 09:00:00+05:30', now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO post_tags (post_id, tag)
SELECT p.id, t.tag
FROM posts p
JOIN (VALUES
  ('how-i-designed-jwt-auth-in-spring-boot', 'spring-boot'),
  ('how-i-designed-jwt-auth-in-spring-boot', 'security'),
  ('how-i-designed-jwt-auth-in-spring-boot', 'jwt'),
  ('postgresql-full-text-search-before-elasticsearch', 'postgresql'),
  ('postgresql-full-text-search-before-elasticsearch', 'search'),
  ('postgresql-full-text-search-before-elasticsearch', 'spring-data-jpa'),
  ('caching-spring-boot-what-to-cache-and-when-to-evict', 'spring-boot'),
  ('caching-spring-boot-what-to-cache-and-when-to-evict', 'caching'),
  ('caching-spring-boot-what-to-cache-and-when-to-evict', 'redis'),
  ('deploying-spring-boot-react-for-free', 'deployment'),
  ('deploying-spring-boot-react-for-free', 'docker'),
  ('deploying-spring-boot-react-for-free', 'spring-boot'),
  ('deploying-spring-boot-react-for-free', 'react')
) AS t(slug, tag) ON t.slug = p.slug
ON CONFLICT DO NOTHING;
