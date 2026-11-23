package dev.shivendra.portfolio.post;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface PostRepository extends JpaRepository<Post, Long> {

    Optional<Post> findBySlugAndStatus(String slug, PostStatus status);

    boolean existsBySlug(String slug);

    Page<Post> findByStatus(PostStatus status, Pageable pageable);

    @Query("select p from Post p join p.tags t where p.status = :status and t = :tag")
    Page<Post> findByStatusAndTag(PostStatus status, String tag, Pageable pageable);

    List<Post> findTop5ByStatusOrderByViewCountDesc(PostStatus status);

    /** PostgreSQL full-text search over the generated, weighted search_vector column. */
    @Query(value = """
        SELECT * FROM posts
        WHERE status = 'PUBLISHED' AND search_vector @@ websearch_to_tsquery('english', :q)
        ORDER BY ts_rank(search_vector, websearch_to_tsquery('english', :q)) DESC
        """,
        countQuery = """
        SELECT count(*) FROM posts
        WHERE status = 'PUBLISHED' AND search_vector @@ websearch_to_tsquery('english', :q)
        """,
        nativeQuery = true)
    Page<Post> search(String q, Pageable pageable);

    @Query(value = "SELECT DISTINCT t.tag FROM post_tags t JOIN posts p ON p.id = t.post_id "
        + "WHERE p.status = 'PUBLISHED' ORDER BY t.tag", nativeQuery = true)
    List<String> findPublishedTags();

    @Modifying
    @Query("update Post p set p.viewCount = p.viewCount + 1 where p.id = :id")
    void incrementViews(Long id);

    @Modifying
    @Query("update Post p set p.likeCount = p.likeCount + 1 where p.id = :id")
    void incrementLikes(Long id);
}
