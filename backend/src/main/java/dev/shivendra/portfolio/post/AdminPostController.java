package dev.shivendra.portfolio.post;

import dev.shivendra.portfolio.post.PostDtos.PageResponse;
import dev.shivendra.portfolio.post.PostDtos.PostDetail;
import dev.shivendra.portfolio.post.PostDtos.PostRequest;
import dev.shivendra.portfolio.post.PostDtos.PostSummary;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/posts")
public class AdminPostController {

    private final PostService service;

    public AdminPostController(PostService service) {
        this.service = service;
    }

    @GetMapping
    public PageResponse<PostSummary> list(@RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "20") int size) {
        return service.listAll(page, size);
    }

    @GetMapping("/{id}")
    public PostDetail get(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PostDetail create(@Valid @RequestBody PostRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    public PostDetail update(@PathVariable Long id, @Valid @RequestBody PostRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
