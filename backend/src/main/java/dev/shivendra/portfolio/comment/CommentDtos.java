package dev.shivendra.portfolio.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public final class CommentDtos {
    private CommentDtos() {}

    public record CommentRequest(
        @NotBlank @Size(max = 80) String authorName,
        @NotBlank @Size(max = 2000) String content,
        Long parentId,
        /** Honeypot: real users never fill this hidden field. */
        String website) {}

    public record CommentNode(Long id, Long parentId, String authorName, String content, Instant createdAt,
                              List<CommentNode> replies) {}

    public record AdminComment(Long id, Long postId, Long parentId, String authorName, String content,
                               CommentStatus status, Instant createdAt) {
        static AdminComment of(Comment c) {
            return new AdminComment(c.getId(), c.getPostId(), c.getParentId(), c.getAuthorName(), c.getContent(),
                c.getStatus(), c.getCreatedAt());
        }
    }

    public record ModerationRequest(CommentStatus status) {}

    /** Builds a tree from a flat, creation-ordered list. Orphans (parent not approved) are dropped. */
    static List<CommentNode> toTree(List<Comment> flat) {
        var byId = new java.util.LinkedHashMap<Long, CommentNode>();
        for (Comment c : flat) {
            byId.put(c.getId(), new CommentNode(c.getId(), c.getParentId(), c.getAuthorName(), c.getContent(),
                c.getCreatedAt(), new ArrayList<>()));
        }
        List<CommentNode> roots = new ArrayList<>();
        for (CommentNode n : byId.values()) {
            if (n.parentId() == null) {
                roots.add(n);
            } else if (byId.containsKey(n.parentId())) {
                byId.get(n.parentId()).replies().add(n);
            }
        }
        return roots;
    }
}
