package dev.shivendra.portfolio.auth;

import dev.shivendra.portfolio.auth.AuthDtos.LoginRequest;
import dev.shivendra.portfolio.auth.AuthDtos.RegisterRequest;
import dev.shivendra.portfolio.auth.AuthDtos.TokenResponse;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public TokenResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req.username(), req.password());
    }

    @PostMapping("/register")
    public TokenResponse register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req.username(), req.password());
    }

    @GetMapping("/me")
    public Map<String, Object> me(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return Map.of("authenticated", false);
        }
        return Map.of("authenticated", true, "username", jwt.getSubject(), "roles", jwt.getClaimAsStringList("roles"));
    }
}
