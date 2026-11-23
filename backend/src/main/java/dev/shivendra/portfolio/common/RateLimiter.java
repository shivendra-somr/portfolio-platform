package dev.shivendra.portfolio.common;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

/**
 * Simple in-memory sliding-window limiter keyed by e.g. "comment:1.2.3.4".
 * Good enough for a single instance; swap for Redis (INCR + EXPIRE) when scaling out.
 */
@Component
public class RateLimiter {

    private final Map<String, Deque<Instant>> hits = new ConcurrentHashMap<>();

    public void check(String key, int maxPerMinute) {
        Instant now = Instant.now();
        Instant windowStart = now.minus(Duration.ofMinutes(1));
        Deque<Instant> q = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (q) {
            while (!q.isEmpty() && q.peekFirst().isBefore(windowStart)) {
                q.pollFirst();
            }
            if (q.size() >= maxPerMinute) {
                throw new TooManyRequestsException("Too many requests, please try again in a minute");
            }
            q.addLast(now);
        }
    }
}
