package dev.shivendra.portfolio.comment;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "author_name", nullable = false)
    private String authorName;

    @Column(nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommentStatus status = CommentStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected Comment() {}

    public Comment(Long postId, Long parentId, String authorName, String content) {
        this.postId = postId;
        this.parentId = parentId;
        this.authorName = authorName;
        this.content = content;
    }

    public Long getId() { return id; }
    public Long getPostId() { return postId; }
    public Long getParentId() { return parentId; }
    public String getAuthorName() { return authorName; }
    public String getContent() { return content; }
    public CommentStatus getStatus() { return status; }
    public void setStatus(CommentStatus status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
}
