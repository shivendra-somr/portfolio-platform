package dev.shivendra.portfolio.contact;

import dev.shivendra.portfolio.common.ClientIp;
import dev.shivendra.portfolio.common.RateLimiter;
import dev.shivendra.portfolio.config.AppProperties;
import dev.shivendra.portfolio.post.PostDtos.PageResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
public class ContactController {

    public record ContactRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email @Size(max = 200) String email,
        @Size(max = 200) String subject,
        @NotBlank @Size(min = 10, max = 5000) String message,
        /** Honeypot field, hidden in the UI. */
        String website) {}

    private final ContactService service;
    private final RateLimiter rateLimiter;
    private final AppProperties props;

    public ContactController(ContactService service, RateLimiter rateLimiter, AppProperties props) {
        this.service = service;
        this.rateLimiter = rateLimiter;
        this.props = props;
    }

    @PostMapping("/api/contact")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public Map<String, String> submit(@Valid @RequestBody ContactRequest req, HttpServletRequest http) {
        rateLimiter.check("contact:" + ClientIp.of(http), props.rateLimit().contactPerMinute());
        if (req.website() == null || req.website().isBlank()) {
            service.submit(req);
        }
        return Map.of("message", "Thanks for reaching out! I'll get back to you soon.");
    }

    @GetMapping("/api/admin/contact")
    public PageResponse<ContactMessage> list(@RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        return PageResponse.of(service.list(page, size));
    }

    @PatchMapping("/api/admin/contact/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markHandled(@PathVariable Long id, @RequestParam boolean handled) {
        service.markHandled(id, handled);
    }
}
