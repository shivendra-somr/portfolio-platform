package dev.shivendra.portfolio.auth;

import dev.shivendra.portfolio.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Creates the admin account on startup from ADMIN_USERNAME / ADMIN_PASSWORD if it doesn't exist. */
@Component
public class AdminSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final AppProperties props;

    public AdminSeeder(UserRepository users, PasswordEncoder encoder, AppProperties props) {
        this.users = users;
        this.encoder = encoder;
        this.props = props;
    }

    @Override
    public void run(ApplicationArguments args) {
        String username = props.admin().username();
        String password = props.admin().password();
        if (password == null || password.isBlank()) {
            log.warn("ADMIN_PASSWORD not set; skipping admin account creation");
            return;
        }
        if (!users.existsByUsername(username)) {
            users.save(new User(username, encoder.encode(password), Role.ADMIN));
            log.info("Created admin user '{}'", username);
        }
    }
}
