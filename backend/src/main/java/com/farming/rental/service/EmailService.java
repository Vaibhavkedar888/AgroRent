package com.farming.rental.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOTP(String toEmail, String otpCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Your Login OTP - Farming Equipment Rental System");
            message.setText("Your One-Time Password (OTP) for login is: " + otpCode +
                    "\n\nThis OTP is valid for 10 minutes. Please do not share this with anyone.");

            mailSender.send(message);
            log.info("OTP email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    public void sendEmailWithAttachment(String toEmail, String subject, String body, byte[] attachment,
            String attachmentName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(body);

            helper.addAttachment(attachmentName, new ByteArrayResource(attachment));

            mailSender.send(message);
            log.info("Email with attachment sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email with attachment to: {}", toEmail, e);
            throw new RuntimeException("Failed to send email with attachment", e);
        }
    }
}
