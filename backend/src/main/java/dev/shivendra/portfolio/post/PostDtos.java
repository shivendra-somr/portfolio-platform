package dev.shivendra.portfolio.post;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.Page;

public final class PostDtos {
    private PostDtos() {}

    public record PostSummary(Long id, String slug, String title, String summary, String coverImage,
                              List<String> tags, PostStatus status, Instant publishedAt, Instant updatedAt,
                              int readingMinutes, long viewCount, long likeCount) implements Serializable {}

    public record PostDetail(PostSummary meta, String content) implements Serializable {}

    public record PostRequest(
        @NotBlank @Size(max = 200) String title,
        @Size(max = 200) @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "lowercase words separated by -")
        String slug,
        @Size(max = 500) String summary,
        @NotBlank String content,
        @Size(max = 500) String coverImage,
        Set<@Size(max = 50) String> tags,
        @NotNull PostStatus status) {}

    public record PageResponse<T>(List<T> items, int page, int size, long totalElements, int totalPages)
        implements Serializable {
        public static <T> PageResponse<T> of(Page<T> p) {
            return new PageResponse<>(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
        }
    }

    static PostSummary toSummary(Post p) {
        return new PostSummary(p.getId(), p.getSlug(), p.getTitle(), p.getSummary(), p.getCoverImage(),
            p.getTags().stream().sorted().toList(), p.getStatus(), p.getPublishedAt(), p.getUpdatedAt(),
            readingMinutes(p.getContent()), p.getViewCount(), p.getLikeCount());
    }

    static PostDetail toDetail(Post p) {
        return new PostDetail(toSummary(p), p.getContent());
    }

    /** ~200 words per minute, minimum 1. */
    static int readingMinutes(String content) {
        if (content == null || content.isBlank()) return 1;
        int words = content.trim().split("\\s+").length;
        return Math.max(1, (int) Math.ceil(words / 200.0));
    }
}
