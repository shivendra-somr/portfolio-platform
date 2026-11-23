package dev.shivendra.portfolio.post;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class PostDtosTest {

    @Test
    void readingTimeIsAtLeastOneMinute() {
        assertThat(PostDtos.readingMinutes("")).isEqualTo(1);
        assertThat(PostDtos.readingMinutes("hello world")).isEqualTo(1);
    }

    @Test
    void readingTimeRoundsUpAt200Wpm() {
        assertThat(PostDtos.readingMinutes("word ".repeat(201))).isEqualTo(2);
    }

    @Test
    void slugifyStripsAccentsAndPunctuation() {
        assertThat(PostService.slugify("How I designed JWT auth in Spring Boot!")).isEqualTo("how-i-designed-jwt-auth-in-spring-boot");
        assertThat(PostService.slugify("Café  Déjà vu")).isEqualTo("cafe-deja-vu");
    }
}
