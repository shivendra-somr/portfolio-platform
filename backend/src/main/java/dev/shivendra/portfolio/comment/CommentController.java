package dev.shivendra.portfolio.comment;

import dev.shivendra.portfolio.comment.CommentDtos.AdminComment;
import dev.shivendra.portfolio.comment.CommentDtos.CommentNode;
import dev.shivendra.portfolio.comment.CommentDtos.CommentRequest;
import dev.shivendra.portfolio.comment.CommentDtos.ModerationRequest;
import dev.shivendra.portfolio.common.ClientIp;
import dev.shivendra.portfolio.common.RateLimiter;
import dev.shivendra.portfolio.config.AppProperties;
import dev.shivendra.portfolio.post.PostDtos.PageResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
public class CommentController {

    private final CommentService service;
    private final RateLimiter rateLimiter;
    private final AppProperties props;

    public CommentController(CommentService service, RateLimiter rateLimiter, AppProperties props) {
        this.service = service;
        this.rateLimiter = rateLimiter;
        this.props = props;
    }

    @GetMapping("/api/posts/{slug}/comments")
    public List<CommentNode> list(@PathVariable String slug) {
        return service.approvedTree(slug);
    }

    @PostMapping("/api/posts/{slug}/comments")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public Map<String, String> submit(@PathVariable String slug, @Valid @RequestBody CommentRequest req,
                                      HttpServletRequest http) {
        rateLimiter.check("comment:" + ClientIp.of(http), props.rateLimit().commentsPerMinute());
        service.submit(slug, req);
        return Map.of("message", "Thanks! Your comment will appear after moderation.");
    }

    @GetMapping("/api/admin/comments")
    public PageResponse<AdminComment> pending(@RequestParam(defaultValue = "PENDING") CommentStatus status,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "20") int size) {
        return service.byStatus(status, page, size);
    }

    @PatchMapping("/api/admin/comments/{id}")
    public AdminComment moderate(@PathVariable Long id, @RequestBody ModerationRequest req) {
        return service.moderate(id, req.status());
    }

    @DeleteMapping("/api/admin/comments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
