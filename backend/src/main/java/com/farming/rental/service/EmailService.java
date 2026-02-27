package com.farming.rental.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Service for sending emails via Gmail SMTP
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${otp.from.email:agrorent649@gmail.com}")
    private String fromEmail;

    @Value("${otp.from.name:AgroRent}")
    private String fromName;

    /**
     * Send OTP email to the user asynchronously
     */
    @Async
    public void sendOTPEmail(String toEmail, String otp, String userName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Your AgroRent Login OTP - " + otp);
            helper.setText(buildOTPEmailHtml(otp, userName), true);

            mailSender.send(message);
            log.info("OTP email sent to: {}", toEmail);

        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
        }
    }

    /**
     * Builds a nice HTML email for OTP
     */
    private String buildOTPEmailHtml(String otp, String userName) {
        String name = (userName != null && !userName.isBlank()) ? userName : "Farmer";
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f7f0; margin: 0; padding: 20px; }
                .container { max-width: 520px; margin: auto; background: #ffffff; border-radius: 16px;
                             box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }
                .header { background: linear-gradient(135deg, #2d6a4f, #52b788); padding: 32px 24px; text-align: center; }
                .header h1 { color: white; margin: 0; font-size: 26px; letter-spacing: -0.5px; }
                .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }
                .body { padding: 32px 28px; }
                .greeting { color: #1b4332; font-size: 16px; margin-bottom: 20px; }
                .otp-box { background: #f0faf4; border: 2px dashed #52b788; border-radius: 12px;
                           padding: 20px; text-align: center; margin: 24px 0; }
                .otp-label { color: #52b788; font-size: 12px; font-weight: 600; letter-spacing: 2px;
                             text-transform: uppercase; margin-bottom: 8px; }
                .otp-code { font-size: 48px; font-weight: 800; color: #2d6a4f; letter-spacing: 8px;
                            font-family: monospace; }
                .validity { color: #888; font-size: 13px; margin-top: 8px; }
                .warning { background: #fff8e1; border-left: 4px solid #f59e0b; padding: 12px 16px;
                           border-radius: 6px; color: #92400e; font-size: 13px; margin-top: 20px; }
                .footer { background: #f4f7f0; padding: 20px; text-align: center; color: #888; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🌾 AgroRent</h1>
                  <p>Farming Equipment Rental Platform</p>
                </div>
                <div class="body">
                  <p class="greeting">Hello <strong>%s</strong>,</p>
                  <p style="color:#555; font-size:15px;">Use the OTP below to log in to your AgroRent account:</p>
                  <div class="otp-box">
                    <div class="otp-label">Your One-Time Password</div>
                    <div class="otp-code">%s</div>
                    <div class="validity">⏱ Valid for <strong>10 minutes</strong></div>
                  </div>
                  <div class="warning">
                    🔒 Never share this OTP with anyone. AgroRent will never ask for your OTP.
                  </div>
                  <p style="color:#888; font-size:13px; margin-top:20px;">
                    If you didn't request this, you can safely ignore this email.
                  </p>
                </div>
                <div class="footer">
                  © 2025 AgroRent · agrorent649@gmail.com<br>
                  Empowering Indian Farmers 🇮🇳
                </div>
              </div>
            </body>
            </html>
            """.formatted(name, otp);
    }
}
