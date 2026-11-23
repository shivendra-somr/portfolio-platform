package dev.shivendra.portfolio.post;

import dev.shivendra.portfolio.common.NotFoundException;
import dev.shivendra.portfolio.post.PostDtos.PageResponse;
import dev.shivendra.portfolio.post.PostDtos.PostDetail;
import dev.shivendra.portfolio.post.PostDtos.PostRequest;
import dev.shivendra.portfolio.post.PostDtos.PostSummary;
import java.text.Normalizer;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PostService {

    public static final String CACHE_POST = "postBySlug";
    public static final String CACHE_POPULAR = "popularPosts";
    public static final String CACHE_TAGS = "postTags";

    private final PostRepository posts;

    public PostService(PostRepository posts) {
        this.posts = posts;
    }

    // ---------- public ----------

    @Transactional(readOnly = true)
    public PageResponse<PostSummary> listPublished(int page, int size, String tag, String q) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 50), Sort.by(Sort.Direction.DESC, "publishedAt"));
        if (q != null && !q.isBlank()) {
            return PageResponse.of(posts.search(q.trim(), PageRequest.of(page, Math.min(size, 50)))
                .map(PostDtos::toSummary));
        }
        if (tag != null && !tag.isBlank()) {
            return PageResponse.of(posts.findByStatusAndTag(PostStatus.PUBLISHED, tag, pageable).map(PostDtos::toSummary));
        }
        return PageResponse.of(posts.findByStatus(PostStatus.PUBLISHED, pageable).map(PostDtos::toSummary));
    }

    @Cacheable(CACHE_POST)
    @Transactional(readOnly = true)
    public PostDetail getPublished(String slug) {
        return posts.findBySlugAndStatus(slug, PostStatus.PUBLISHED)
            .map(PostDtos::toDetail)
            .orElseThrow(() -> new NotFoundException("Post not found: " + slug));
    }

    @Cacheable(CACHE_POPULAR)
    @Transactional(readOnly = true)
    public List<PostSummary> popular() {
        return posts.findTop5ByStatusOrderByViewCountDesc(PostStatus.PUBLISHED).stream()
            .map(PostDtos::toSummary).toList();
    }

    @Cacheable(CACHE_TAGS)
    @Transactional(readOnly = true)
    public List<String> tags() {
        return List.copyOf(posts.findPublishedTags());
    }

    @Transactional
    public void recordView(Long id) {
        posts.incrementViews(id);
    }

    @Transactional
    public long like(String slug) {
        Post post = posts.findBySlugAndStatus(slug, PostStatus.PUBLISHED)
            .orElseThrow(() -> new NotFoundException("Post not found: " + slug));
        posts.incrementLikes(post.getId());
        return post.getLikeCount() + 1;
    }

    @Transactional(readOnly = true)
    public List<PostSummary> latestForFeed(int limit) {
        return posts.findByStatus(PostStatus.PUBLISHED, PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "publishedAt")))
            .map(PostDtos::toSummary).getContent();
    }

    // ---------- admin ----------

    @Transactional(readOnly = true)
    public PageResponse<PostSummary> listAll(int page, int size) {
        return PageResponse.of(posts.findAll(PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "updatedAt")))
            .map(PostDtos::toSummary));
    }

    @Transactional(readOnly = true)
    public PostDetail getById(Long id) {
        return PostDtos.toDetail(find(id));
    }

    @Caching(evict = {
        @CacheEvict(value = CACHE_POST, allEntries = true),
        @CacheEvict(value = CACHE_POPULAR, allEntries = true),
        @CacheEvict(value = CACHE_TAGS, allEntries = true)})
    @Transactional
    public PostDetail create(PostRequest req) {
        Post post = new Post();
        String slug = req.slug() == null || req.slug().isBlank() ? slugify(req.title()) : req.slug();
        if (posts.existsBySlug(slug)) {
            throw new IllegalArgumentException("Slug already exists: " + slug);
        }
        post.setSlug(slug);
        apply(post, req);
        return PostDtos.toDetail(posts.save(post));
    }

    @Caching(evict = {
        @CacheEvict(value = CACHE_POST, allEntries = true),
        @CacheEvict(value = CACHE_POPULAR, allEntries = true),
        @CacheEvict(value = CACHE_TAGS, allEntries = true)})
    @Transactional
    public PostDetail update(Long id, PostRequest req) {
        Post post = find(id);
        if (req.slug() != null && !req.slug().isBlank() && !req.slug().equals(post.getSlug())) {
            if (posts.existsBySlug(req.slug())) {
                throw new IllegalArgumentException("Slug already exists: " + req.slug());
            }
            post.setSlug(req.slug());
        }
        apply(post, req);
        return PostDtos.toDetail(post);
    }

    @Caching(evict = {
        @CacheEvict(value = CACHE_POST, allEntries = true),
        @CacheEvict(value = CACHE_POPULAR, allEntries = true),
        @CacheEvict(value = CACHE_TAGS, allEntries = true)})
    @Transactional
    public void delete(Long id) {
        posts.delete(find(id));
    }

    private void apply(Post post, PostRequest req) {
        post.setTitle(req.title());
        post.setSummary(req.summary());
        post.setContent(req.content());
        post.setCoverImage(req.coverImage());
        post.setTags(req.tags() == null ? new LinkedHashSet<>() : new LinkedHashSet<>(
            req.tags().stream().map(t -> t.trim().toLowerCase(Locale.ROOT)).filter(t -> !t.isEmpty()).toList()));
        if (req.status() == PostStatus.PUBLISHED && post.getPublishedAt() == null) {
            post.setPublishedAt(Instant.now());
        }
        post.setStatus(req.status());
    }

    private Post find(Long id) {
        return posts.findById(id).orElseThrow(() -> new NotFoundException("Post not found: " + id));
    }

    static String slugify(String title) {
        String s = Normalizer.normalize(title, Normalizer.Form.NFD).replaceAll("\\p{M}", "")
            .toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        return s.isEmpty() ? "post-" + System.currentTimeMillis() : s;
    }
}
