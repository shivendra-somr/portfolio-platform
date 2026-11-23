package dev.shivendra.portfolio.auth;

import dev.shivendra.portfolio.auth.AuthDtos.TokenResponse;
import dev.shivendra.portfolio.config.AppProperties;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final AppProperties props;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtEncoder jwtEncoder, AppProperties props) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.props = props;
    }

    public TokenResponse login(String username, String password) {
        User user = users.findByUsername(username)
            .filter(u -> passwordEncoder.matches(password, u.getPasswordHash()))
            .orElseThrow(() -> new BadCredentialsException("bad credentials"));
        return issueToken(user);
    }

    @Transactional
    public TokenResponse register(String username, String password) {
        if (users.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already taken");
        }
        User user = users.save(new User(username, passwordEncoder.encode(password), Role.VISITOR));
        return issueToken(user);
    }

    private TokenResponse issueToken(User user) {
        Instant now = Instant.now();
        Duration ttl = Duration.ofMinutes(props.jwt().expiryMinutes());
        JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuer("portfolio-backend")
            .subject(user.getUsername())
            .issuedAt(now)
            .expiresAt(now.plus(ttl))
            .claim("roles", List.of(user.getRole().name()))
            .build();
        String token = jwtEncoder.encode(
            JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        return new TokenResponse(token, user.getUsername(), user.getRole().name(), ttl.toSeconds());
    }
}
