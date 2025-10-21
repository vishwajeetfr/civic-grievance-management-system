package com.civic.civicissuesystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

@Entity
@Table(name = "complaint_updates")
public class ComplaintUpdate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Update message is required")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintStatus previousStatus;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintStatus newStatus;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Constructors
    public ComplaintUpdate() {}
    
    public ComplaintUpdate(String message, ComplaintStatus previousStatus, ComplaintStatus newStatus, 
                          Complaint complaint, User updatedBy) {
        this.message = message;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.complaint = complaint;
        this.updatedBy = updatedBy;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public ComplaintStatus getPreviousStatus() {
        return previousStatus;
    }
    
    public void setPreviousStatus(ComplaintStatus previousStatus) {
        this.previousStatus = previousStatus;
    }
    
    public ComplaintStatus getNewStatus() {
        return newStatus;
    }
    
    public void setNewStatus(ComplaintStatus newStatus) {
        this.newStatus = newStatus;
    }
    
    public Complaint getComplaint() {
        return complaint;
    }
    
    public void setComplaint(Complaint complaint) {
        this.complaint = complaint;
    }
    
    public User getUpdatedBy() {
        return updatedBy;
    }
    
    public void setUpdatedBy(User updatedBy) {
        this.updatedBy = updatedBy;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
