package com.civic.civicissuesystem.service;

import com.civic.civicissuesystem.dto.ComplaintRequest;
import com.civic.civicissuesystem.entity.*;
import com.civic.civicissuesystem.repository.ComplaintRepository;
import com.civic.civicissuesystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ComplaintService {
    
    @Autowired
    private ComplaintRepository complaintRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    public Complaint createComplaint(ComplaintRequest complaintRequest, User user) {
        Complaint complaint = new Complaint();
        complaint.setTitle(complaintRequest.getTitle());
        complaint.setDescription(complaintRequest.getDescription());
        complaint.setType(complaintRequest.getType());
        complaint.setUser(user);
        complaint.setLatitude(complaintRequest.getLatitude());
        complaint.setLongitude(complaintRequest.getLongitude());
        complaint.setAddress(complaintRequest.getAddress());
        complaint.setCity(complaintRequest.getCity());
        complaint.setState(complaintRequest.getState());
        complaint.setZipCode(complaintRequest.getZipCode());
        
        // Create initial status update
        ComplaintUpdate initialUpdate = new ComplaintUpdate(
            "Complaint submitted",
            ComplaintStatus.PENDING,
            ComplaintStatus.PENDING,
            complaint,
            user
        );
        complaint.getUpdates().add(initialUpdate);
        
        // Handle image URLs if provided
        if (complaintRequest.getImageUrls() != null && !complaintRequest.getImageUrls().isEmpty()) {
            System.out.println("Processing " + complaintRequest.getImageUrls().size() + " image URLs");
            for (String imageUrl : complaintRequest.getImageUrls()) {
                if (imageUrl != null && !imageUrl.trim().isEmpty()) {
                    // Extract image name from URL (filename part)
                    String imageName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
                    if (imageName.isEmpty()) {
                        imageName = "image_" + System.currentTimeMillis();
                    }
                    
                    ComplaintImage complaintImage = new ComplaintImage(imageUrl.trim(), imageName, complaint);
                    complaint.getImages().add(complaintImage);
                    System.out.println("Added image: " + imageUrl + " with name: " + imageName);
                }
            }
        }
        
        Complaint savedComplaint = complaintRepository.save(complaint);
        
        System.out.println("Complaint saved with ID: " + savedComplaint.getId());
        System.out.println("Number of images in complaint: " + savedComplaint.getImages().size());
        
        // Send notification email
        notificationService.sendComplaintSubmittedNotification(savedComplaint);
        
        return savedComplaint;
    }
    
    public Page<Complaint> getAllComplaints(Pageable pageable) {
        return complaintRepository.findAllOrderByCreatedAtDesc(pageable);
    }
    
    public Page<Complaint> getComplaintsByUser(User user, Pageable pageable) {
        return complaintRepository.findByUser(user, pageable);
    }
    
    public List<Complaint> getComplaintsByStatus(ComplaintStatus status) {
        return complaintRepository.findByStatus(status);
    }
    
    public List<Complaint> getComplaintsByType(ComplaintType type) {
        return complaintRepository.findByType(type);
    }
    
    public List<Complaint> getComplaintsByCity(String city) {
        return complaintRepository.findByCity(city);
    }
    
    public List<Complaint> getComplaintsWithLocation() {
        return complaintRepository.findComplaintsWithLocation();
    }
    
    public List<Complaint> getUnresolvedComplaintsWithLocation() {
        return complaintRepository.findUnresolvedComplaintsWithLocation();
    }
    
    public Optional<Complaint> getComplaintById(Long id) {
        return complaintRepository.findById(id);
    }
    
    public Complaint updateComplaintStatus(Long complaintId, ComplaintStatus newStatus, 
                                         String adminNotes, User admin) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        
        ComplaintStatus previousStatus = complaint.getStatus();
        complaint.setStatus(newStatus);
        complaint.setAdminNotes(adminNotes);
        
        // Create status update record
        ComplaintUpdate update = new ComplaintUpdate(
            "Status updated from " + previousStatus + " to " + newStatus,
            previousStatus,
            newStatus,
            complaint,
            admin
        );
        complaint.getUpdates().add(update);
        
        Complaint savedComplaint = complaintRepository.save(complaint);
        
        // Send notification email if status changed
        if (!previousStatus.equals(newStatus)) {
            notificationService.sendStatusUpdateNotification(savedComplaint, previousStatus, newStatus);
            
            // Send resolution confirmation request if marked as resolved
            if (newStatus == ComplaintStatus.RESOLVED) {
                notificationService.sendResolutionConfirmationRequest(savedComplaint);
            }
        }
        
        return savedComplaint;
    }
    
    public Long getComplaintCountByStatus(ComplaintStatus status) {
        return complaintRepository.countByStatus(status);
    }
    
    public Long getComplaintCountByType(ComplaintType type) {
        return complaintRepository.countByType(type);
    }
    
    public List<Complaint> getComplaintsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return complaintRepository.findByCreatedAtBetween(startDate, endDate);
    }
}
