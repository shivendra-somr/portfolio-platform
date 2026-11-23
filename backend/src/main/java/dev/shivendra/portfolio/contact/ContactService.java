package dev.shivendra.portfolio.contact;

import dev.shivendra.portfolio.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ContactService {

    private static final Logger log = LoggerFactory.getLogger(ContactService.class);

    private final ContactRepository repo;
    private final JavaMailSender mailSender;
    private final AppProperties props;

    public ContactService(ContactRepository repo, JavaMailSender mailSender, AppProperties props) {
        this.repo = repo;
        this.mailSender = mailSender;
        this.props = props;
    }

    @Transactional
    public void submit(ContactController.ContactRequest req) {
        ContactMessage saved = repo.save(new ContactMessage(req.name().trim(), req.email().trim(), req.subject(), req.message().trim()));
        notifyOwner(saved);
    }

    @Transactional(readOnly = true)
    public Page<ContactMessage> list(int page, int size) {
        return repo.findAll(PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    @Transactional
    public void markHandled(Long id, boolean handled) {
        repo.findById(id).ifPresent(m -> m.setHandled(handled));
    }

    private void notifyOwner(ContactMessage m) {
        var mail = props.mail();
        if (!mail.enabled() || mail.notifyTo() == null || mail.notifyTo().isBlank()) {
            return;
        }
        try {
            var msg = new SimpleMailMessage();
            msg.setFrom(mail.from());
            msg.setTo(mail.notifyTo());
            msg.setReplyTo(m.getEmail());
            msg.setSubject("[Portfolio] " + (m.getSubject() == null ? "New message" : m.getSubject()));
            msg.setText("From: " + m.getName() + " <" + m.getEmail() + ">\n\n" + m.getMessage());
            mailSender.send(msg);
        } catch (Exception e) {
            // Message is already stored; email is best-effort.
            log.warn("Failed to send contact notification: {}", e.getMessage());
        }
    }
}
