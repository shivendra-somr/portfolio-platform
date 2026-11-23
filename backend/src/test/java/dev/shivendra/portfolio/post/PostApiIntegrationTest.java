package dev.shivendra.portfolio.post;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.jayway.jsonpath.JsonPath;
import dev.shivendra.portfolio.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** End-to-end against real PostgreSQL (Testcontainers): login, create, publish, read, search. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
class PostApiIntegrationTest {

    @Autowired
    MockMvc mvc;

    @Test
    void adminCanPublishAndVisitorsCanReadAndSearch() throws Exception {
        String login = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"admin\",\"password\":\"test-admin-password\"}"))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();
        String token = JsonPath.read(login, "$.token");

        mvc.perform(post("/api/admin/posts").contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"title":"Designing JWT auth in Spring Boot","summary":"Stateless auth",
                     "content":"Tokens are signed with HS256 and validated by the resource server.",
                     "tags":["Spring","Security"],"status":"PUBLISHED"}"""))
            .andExpect(status().isUnauthorized());

        mvc.perform(post("/api/admin/posts").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"title":"Designing JWT auth in Spring Boot","summary":"Stateless auth",
                     "content":"Tokens are signed with HS256 and validated by the resource server.",
                     "tags":["Spring","Security"],"status":"PUBLISHED"}"""))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.meta.slug").value("designing-jwt-auth-in-spring-boot"));

        mvc.perform(get("/api/posts/designing-jwt-auth-in-spring-boot"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.meta.tags[0]").value("security"));

        mvc.perform(get("/api/posts").param("q", "signed tokens"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalElements").value(1));

        mvc.perform(get("/api/posts/does-not-exist")).andExpect(status().isNotFound());
    }
}
