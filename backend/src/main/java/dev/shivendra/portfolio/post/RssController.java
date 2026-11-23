package dev.shivendra.portfolio.post;

import dev.shivendra.portfolio.post.PostDtos.PostSummary;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RssController {

    private final PostService service;
    private final String siteUrl;

    public RssController(PostService service, @Value("${app.site-url:http://localhost:5173}") String siteUrl) {
        this.service = service;
        this.siteUrl = siteUrl;
    }

    @GetMapping(value = "/api/feed.xml", produces = "application/rss+xml")
    public String feed() {
        StringBuilder sb = new StringBuilder("""
            <?xml version="1.0" encoding="UTF-8"?>
            <rss version="2.0"><channel>
            <title>Shivendra Kumar - Blog</title>
            """);
        sb.append("<link>").append(esc(siteUrl)).append("/blog</link>\n");
        sb.append("<description>Notes on Java, Spring Boot, AI integration and data engineering</description>\n");
        for (PostSummary p : service.latestForFeed(20)) {
            String link = siteUrl + "/blog/" + p.slug();
            sb.append("<item><title>").append(esc(p.title())).append("</title>")
              .append("<link>").append(esc(link)).append("</link>")
              .append("<guid>").append(esc(link)).append("</guid>");
            if (p.summary() != null) sb.append("<description>").append(esc(p.summary())).append("</description>");
            if (p.publishedAt() != null) {
                sb.append("<pubDate>")
                  .append(DateTimeFormatter.RFC_1123_DATE_TIME.format(p.publishedAt().atOffset(ZoneOffset.UTC)))
                  .append("</pubDate>");
            }
            sb.append("</item>\n");
        }
        return sb.append("</channel></rss>").toString();
    }

    private static String esc(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
