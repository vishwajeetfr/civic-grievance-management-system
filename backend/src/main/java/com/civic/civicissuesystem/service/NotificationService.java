package com.civic.civicissuesystem.service;

import com.civic.civicissuesystem.entity.Complaint;
import com.civic.civicissuesystem.entity.ComplaintStatus;
import com.civic.civicissuesystem.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendComplaintSubmittedNotification(Complaint complaint) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(complaint.getUser().getEmail());
            message.setSubject("Complaint Submitted Successfully - #" + complaint.getId());
            message.setText(buildComplaintSubmittedEmail(complaint));
            message.setFrom("noreply@civicissuesystem.com");
            
            mailSender.send(message);
        } catch (Exception e) {
            // Log error but don't fail the complaint submission
            System.err.println("Failed to send email notification: " + e.getMessage());
        }
    }

    public void sendStatusUpdateNotification(Complaint complaint, ComplaintStatus oldStatus, ComplaintStatus newStatus) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(complaint.getUser().getEmail());
            message.setSubject("Complaint Status Updated - #" + complaint.getId());
            message.setText(buildStatusUpdateEmail(complaint, oldStatus, newStatus));
            message.setFrom("noreply@civicissuesystem.com");
            
            mailSender.send(message);
        } catch (Exception e) {
            // Log error but don't fail the status update
            System.err.println("Failed to send status update email: " + e.getMessage());
        }
    }

    public void sendResolutionConfirmationRequest(Complaint complaint) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(complaint.getUser().getEmail());
            message.setSubject("Resolution Confirmation Required - #" + complaint.getId());
            message.setText(buildResolutionConfirmationEmail(complaint));
            message.setFrom("noreply@civicissuesystem.com");
            
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send resolution confirmation email: " + e.getMessage());
        }
    }

    private String buildComplaintSubmittedEmail(Complaint complaint) {
        StringBuilder email = new StringBuilder();
        email.append("Dear ").append(complaint.getUser().getName()).append(",\n\n");
        email.append("Thank you for submitting your complaint. We have received your report and it has been assigned the following details:\n\n");
        email.append("Complaint ID: #").append(complaint.getId()).append("\n");
        email.append("Title: ").append(complaint.getTitle()).append("\n");
        email.append("Type: ").append(complaint.getType()).append("\n");
        email.append("Status: ").append(complaint.getStatus()).append("\n");
        email.append("Submitted: ").append(complaint.getCreatedAt()).append("\n\n");
        
        if (complaint.getAddress() != null) {
            email.append("Location: ").append(complaint.getAddress());
            if (complaint.getCity() != null) {
                email.append(", ").append(complaint.getCity());
            }
            email.append("\n\n");
        }
        
        email.append("Description:\n").append(complaint.getDescription()).append("\n\n");
        email.append("We will review your complaint and update you on its progress. You can track the status of your complaint by logging into your account.\n\n");
        email.append("Thank you for helping us improve our community.\n\n");
        email.append("Best regards,\n");
        email.append("Civic Issue Management Team");
        
        return email.toString();
    }

    private String buildStatusUpdateEmail(Complaint complaint, ComplaintStatus oldStatus, ComplaintStatus newStatus) {
        StringBuilder email = new StringBuilder();
        email.append("Dear ").append(complaint.getUser().getName()).append(",\n\n");
        email.append("We have an update regarding your complaint #").append(complaint.getId()).append(".\n\n");
        email.append("Status has been updated from ").append(oldStatus).append(" to ").append(newStatus).append(".\n\n");
        
        if (complaint.getAdminNotes() != null && !complaint.getAdminNotes().isEmpty()) {
            email.append("Admin Notes:\n").append(complaint.getAdminNotes()).append("\n\n");
        }
        
        email.append("Complaint Details:\n");
        email.append("Title: ").append(complaint.getTitle()).append("\n");
        email.append("Type: ").append(complaint.getType()).append("\n");
        email.append("Current Status: ").append(newStatus).append("\n\n");
        
        if (newStatus == ComplaintStatus.RESOLVED) {
            email.append("Your complaint has been marked as resolved. If you are satisfied with the resolution, no further action is required. ");
            email.append("If you have any concerns, please contact us.\n\n");
        } else if (newStatus == ComplaintStatus.IN_PROGRESS) {
            email.append("We are currently working on resolving your complaint. We will keep you updated on the progress.\n\n");
        }
        
        email.append("You can view the full details and track progress by logging into your account.\n\n");
        email.append("Thank you for your patience.\n\n");
        email.append("Best regards,\n");
        email.append("Civic Issue Management Team");
        
        return email.toString();
    }

    private String buildResolutionConfirmationEmail(Complaint complaint) {
        StringBuilder email = new StringBuilder();
        email.append("Dear ").append(complaint.getUser().getName()).append(",\n\n");
        email.append("We believe your complaint #").append(complaint.getId()).append(" has been resolved.\n\n");
        email.append("Complaint Details:\n");
        email.append("Title: ").append(complaint.getTitle()).append("\n");
        email.append("Type: ").append(complaint.getType()).append("\n");
        email.append("Location: ").append(complaint.getAddress()).append("\n\n");
        
        if (complaint.getAdminNotes() != null && !complaint.getAdminNotes().isEmpty()) {
            email.append("Resolution Details:\n").append(complaint.getAdminNotes()).append("\n\n");
        }
        
        email.append("Please confirm if the issue has been resolved to your satisfaction by logging into your account and updating the status.\n\n");
        email.append("If you confirm the resolution, your complaint will be marked as completed. ");
        email.append("If you have any concerns or the issue persists, please let us know.\n\n");
        email.append("Thank you for helping us maintain our community standards.\n\n");
        email.append("Best regards,\n");
        email.append("Civic Issue Management Team");
        
        return email.toString();
    }
}
