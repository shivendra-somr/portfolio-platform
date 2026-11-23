package dev.shivendra.portfolio.comment;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostIdAndStatusOrderByCreatedAtAsc(Long postId, CommentStatus status);
    Page<Comment> findByStatus(CommentStatus status, Pageable pageable);
}
