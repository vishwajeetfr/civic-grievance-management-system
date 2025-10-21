package com.civic.civicissuesystem.dto;

import com.civic.civicissuesystem.entity.Complaint;
import com.civic.civicissuesystem.entity.ComplaintStatus;
import com.civic.civicissuesystem.entity.ComplaintType;
import com.civic.civicissuesystem.entity.User;

import java.time.LocalDateTime;
import java.util.List;

public class ComplaintResponse {
    
    private Long id;
    private String title;
    private String description;
    private ComplaintType type;
    private ComplaintStatus status;
    private UserInfo user;
    private Double latitude;
    private Double longitude;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private String adminNotes;
    private List<ComplaintImageResponse> images;
    private List<ComplaintUpdateResponse> updates;
    
    // Constructors
    public ComplaintResponse() {}
    
    public ComplaintResponse(Complaint complaint) {
        this.id = complaint.getId();
        this.title = complaint.getTitle();
        this.description = complaint.getDescription();
        this.type = complaint.getType();
        this.status = complaint.getStatus();
        this.user = new UserInfo(complaint.getUser());
        this.latitude = complaint.getLatitude();
        this.longitude = complaint.getLongitude();
        this.address = complaint.getAddress();
        this.city = complaint.getCity();
        this.state = complaint.getState();
        this.zipCode = complaint.getZipCode();
        this.createdAt = complaint.getCreatedAt();
        this.updatedAt = complaint.getUpdatedAt();
        this.resolvedAt = complaint.getResolvedAt();
        this.adminNotes = complaint.getAdminNotes();
        
        // Convert images and updates to response DTOs
        if (complaint.getImages() != null) {
            this.images = complaint.getImages().stream()
                .map(ComplaintImageResponse::new)
                .toList();
        }
        
        if (complaint.getUpdates() != null) {
            this.updates = complaint.getUpdates().stream()
                .map(ComplaintUpdateResponse::new)
                .toList();
        }
    }
    
    // Inner class for user info
    public static class UserInfo {
        private Long id;
        private String name;
        private String email;
        private String phoneNumber;
        private String address;
        private String city;
        private String state;
        private String zipCode;
        
        public UserInfo(User user) {
            this.id = user.getId();
            this.name = user.getName();
            this.email = user.getEmail();
            this.phoneNumber = user.getPhoneNumber();
            this.address = user.getAddress();
            this.city = user.getCity();
            this.state = user.getState();
            this.zipCode = user.getZipCode();
        }
        
        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public String getZipCode() { return zipCode; }
        public void setZipCode(String zipCode) { this.zipCode = zipCode; }
    }
    
    // Inner class for complaint image response
    public static class ComplaintImageResponse {
        private Long id;
        private String imageUrl;
        private String imageName;
        private Long fileSize;
        
        public ComplaintImageResponse(com.civic.civicissuesystem.entity.ComplaintImage image) {
            this.id = image.getId();
            this.imageUrl = image.getImageUrl();
            this.imageName = image.getImageName();
            this.fileSize = image.getFileSize();
        }
        
        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public String getImageName() { return imageName; }
        public void setImageName(String imageName) { this.imageName = imageName; }
        public Long getFileSize() { return fileSize; }
        public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    }
    
    // Inner class for complaint update response
    public static class ComplaintUpdateResponse {
        private Long id;
        private String message;
        private ComplaintStatus previousStatus;
        private ComplaintStatus newStatus;
        private LocalDateTime createdAt;
        private UserInfo updatedBy;
        
        public ComplaintUpdateResponse(com.civic.civicissuesystem.entity.ComplaintUpdate update) {
            this.id = update.getId();
            this.message = update.getMessage();
            this.previousStatus = update.getPreviousStatus();
            this.newStatus = update.getNewStatus();
            this.createdAt = update.getCreatedAt();
            this.updatedBy = new UserInfo(update.getUpdatedBy());
        }
        
        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public ComplaintStatus getPreviousStatus() { return previousStatus; }
        public void setPreviousStatus(ComplaintStatus previousStatus) { this.previousStatus = previousStatus; }
        public ComplaintStatus getNewStatus() { return newStatus; }
        public void setNewStatus(ComplaintStatus newStatus) { this.newStatus = newStatus; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public UserInfo getUpdatedBy() { return updatedBy; }
        public void setUpdatedBy(UserInfo updatedBy) { this.updatedBy = updatedBy; }
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public ComplaintType getType() { return type; }
    public void setType(ComplaintType type) { this.type = type; }
    public ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintStatus status) { this.status = status; }
    public UserInfo getUser() { return user; }
    public void setUser(UserInfo user) { this.user = user; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getZipCode() { return zipCode; }
    public void setZipCode(String zipCode) { this.zipCode = zipCode; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }
    public List<ComplaintImageResponse> getImages() { return images; }
    public void setImages(List<ComplaintImageResponse> images) { this.images = images; }
    public List<ComplaintUpdateResponse> getUpdates() { return updates; }
    public void setUpdates(List<ComplaintUpdateResponse> updates) { this.updates = updates; }
}
