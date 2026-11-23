package dev.shivendra.portfolio.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(Jwt jwt, Admin admin, Cors cors, Mail mail, RateLimit rateLimit) {

    public record Jwt(String secret, long expiryMinutes) {}

    public record Admin(String username, String password) {}

    public record Cors(List<String> allowedOrigins) {}

    public record Mail(boolean enabled, String notifyTo, String from) {}

    public record RateLimit(int commentsPerMinute, int contactPerMinute) {}
}
