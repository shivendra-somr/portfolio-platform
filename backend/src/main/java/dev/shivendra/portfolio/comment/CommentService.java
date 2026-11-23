package dev.shivendra.portfolio.comment;

import dev.shivendra.portfolio.comment.CommentDtos.AdminComment;
import dev.shivendra.portfolio.comment.CommentDtos.CommentNode;
import dev.shivendra.portfolio.comment.CommentDtos.CommentRequest;
import dev.shivendra.portfolio.common.NotFoundException;
import dev.shivendra.portfolio.post.PostDtos.PageResponse;
import dev.shivendra.portfolio.post.PostRepository;
import dev.shivendra.portfolio.post.PostStatus;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommentService {

    private final CommentRepository comments;
    private final PostRepository posts;

    public CommentService(CommentRepository comments, PostRepository posts) {
        this.comments = comments;
        this.posts = posts;
    }

    @Transactional(readOnly = true)
    public List<CommentNode> approvedTree(String slug) {
        Long postId = postId(slug);
        return CommentDtos.toTree(comments.findByPostIdAndStatusOrderByCreatedAtAsc(postId, CommentStatus.APPROVED));
    }

    @Transactional
    public void submit(String slug, CommentRequest req) {
        if (req.website() != null && !req.website().isBlank()) {
            return; // honeypot tripped: silently accept and drop
        }
        Long postId = postId(slug);
        if (req.parentId() != null) {
            Comment parent = comments.findById(req.parentId())
                .filter(p -> p.getPostId().equals(postId))
                .orElseThrow(() -> new IllegalArgumentException("Invalid parent comment"));
            if (parent.getStatus() != CommentStatus.APPROVED) {
                throw new IllegalArgumentException("Cannot reply to an unapproved comment");
            }
        }
        comments.save(new Comment(postId, req.parentId(), req.authorName().trim(), req.content().trim()));
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminComment> byStatus(CommentStatus status, int page, int size) {
        return PageResponse.of(comments.findByStatus(status,
            PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "createdAt"))).map(AdminComment::of));
    }

    @Transactional
    public AdminComment moderate(Long id, CommentStatus status) {
        Comment c = comments.findById(id).orElseThrow(() -> new NotFoundException("Comment not found: " + id));
        c.setStatus(status);
        return AdminComment.of(c);
    }

    @Transactional
    public void delete(Long id) {
        comments.deleteById(id);
    }

    private Long postId(String slug) {
        return posts.findBySlugAndStatus(slug, PostStatus.PUBLISHED)
            .orElseThrow(() -> new NotFoundException("Post not found: " + slug)).getId();
    }
}
