package dev.shivendra.portfolio.post;

import dev.shivendra.portfolio.post.PostDtos.PageResponse;
import dev.shivendra.portfolio.post.PostDtos.PostDetail;
import dev.shivendra.portfolio.post.PostDtos.PostSummary;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService service;

    public PostController(PostService service) {
        this.service = service;
    }

    @GetMapping
    public PageResponse<PostSummary> list(@RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "10") int size,
                                          @RequestParam(required = false) String tag,
                                          @RequestParam(required = false) String q) {
        return service.listPublished(page, size, tag, q);
    }

    @GetMapping("/popular")
    public List<PostSummary> popular() {
        return service.popular();
    }

    @GetMapping("/tags")
    public List<String> tags() {
        return service.tags();
    }

    @GetMapping("/{slug}")
    public PostDetail get(@PathVariable String slug) {
        PostDetail detail = service.getPublished(slug);
        service.recordView(detail.meta().id());
        return detail;
    }

    @PostMapping("/{slug}/like")
    public Map<String, Long> like(@PathVariable String slug) {
        return Map.of("likes", service.like(slug));
    }
}
