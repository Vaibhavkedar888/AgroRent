package com.farming.rental.controller.api;

import com.farming.rental.entity.Booking;
import com.farming.rental.entity.Message;
import com.farming.rental.entity.User;
import com.farming.rental.repository.BookingRepository;
import com.farming.rental.repository.MessageRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageApiController {

    private final MessageRepository messageRepository;
    private final BookingRepository bookingRepository;

    @GetMapping("/{bookingId}")
    public ResponseEntity<?> getMessages(@PathVariable String bookingId, HttpSession session) {
        User user = (User) session.getAttribute("loggedInUser");
        if (user == null) return ResponseEntity.status(401).build();

        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        if (booking == null) return ResponseEntity.notFound().build();

        // Security check: only farmer or owner of the equipment can see messages
        boolean isFarmer = booking.getFarmer().getId().equals(user.getId());
        boolean isOwner = booking.getEquipment().getOwner().getId().equals(user.getId());

        if (!isFarmer && !isOwner) return ResponseEntity.status(403).build();

        return ResponseEntity.ok(messageRepository.findByBookingIdOrderByCreatedAtAsc(bookingId));
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, String> payload, HttpSession session) {
        User sender = (User) session.getAttribute("loggedInUser");
        if (sender == null) return ResponseEntity.status(401).build();

        String bookingId = payload.get("bookingId");
        String content = payload.get("content");

        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        if (booking == null) return ResponseEntity.notFound().build();

        boolean isFarmer = booking.getFarmer().getId().equals(sender.getId());
        boolean isOwner = booking.getEquipment().getOwner().getId().equals(sender.getId());

        if (!isFarmer && !isOwner) return ResponseEntity.status(403).build();

        User receiver = isFarmer ? booking.getEquipment().getOwner() : booking.getFarmer();

        Message message = new Message();
        message.setBookingId(bookingId);
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);
        message.setCreatedAt(LocalDateTime.now());
        message.setIsRead(false);

        return ResponseEntity.ok(messageRepository.save(message));
    }
}
