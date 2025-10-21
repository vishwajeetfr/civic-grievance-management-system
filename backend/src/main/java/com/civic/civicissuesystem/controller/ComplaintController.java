package com.civic.civicissuesystem.controller;

import com.civic.civicissuesystem.dto.ComplaintRequest;
import com.civic.civicissuesystem.dto.ComplaintResponse;
import com.civic.civicissuesystem.entity.*;
import com.civic.civicissuesystem.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class ComplaintController {
    
    @Autowired
    private ComplaintService complaintService;
    
    @PostMapping("/citizen/complaints")
    @PreAuthorize("hasRole('CITIZEN') or hasRole('ADMIN')")
    public ResponseEntity<?> createComplaint(@Valid @RequestBody ComplaintRequest complaintRequest,
                                           Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Complaint complaint = complaintService.createComplaint(complaintRequest, user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Complaint created successfully");
        response.put("complaintId", complaint.getId());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/citizen/complaints")
    @PreAuthorize("hasRole('CITIZEN') or hasRole('ADMIN')")
    public ResponseEntity<Page<ComplaintResponse>> getMyComplaints(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Complaint> complaints = complaintService.getComplaintsByUser(user, pageable);
        Page<ComplaintResponse> complaintResponses = complaints.map(ComplaintResponse::new);
        return ResponseEntity.ok(complaintResponses);
    }
    
    @GetMapping("/citizen/complaints/{id}")
    @PreAuthorize("hasRole('CITIZEN') or hasRole('ADMIN')")
    public ResponseEntity<?> getComplaintById(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Optional<Complaint> complaint = complaintService.getComplaintById(id);
        
        if (complaint.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        // Check if user owns the complaint or is admin
        if (!complaint.get().getUser().getId().equals(user.getId()) && 
            !user.getRole().equals(Role.ADMIN)) {
            return ResponseEntity.status(403).build();
        }
        
        return ResponseEntity.ok(new ComplaintResponse(complaint.get()));
    }
    
    @GetMapping("/admin/complaints")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ComplaintResponse>> getAllComplaints(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) ComplaintType type,
            @RequestParam(required = false) String city) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Complaint> complaints = complaintService.getAllComplaints(pageable);
        Page<ComplaintResponse> complaintResponses = complaints.map(ComplaintResponse::new);
        return ResponseEntity.ok(complaintResponses);
    }
    
    @PutMapping("/admin/complaints/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateComplaintStatus(@PathVariable Long id,
                                                 @RequestParam ComplaintStatus status,
                                                 @RequestParam(required = false) String adminNotes,
                                                 Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        Complaint complaint = complaintService.updateComplaintStatus(id, status, adminNotes, admin);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Complaint status updated successfully");
        response.put("complaintId", complaint.getId());
        response.put("newStatus", complaint.getStatus());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/public/complaints/heatmap")
    public ResponseEntity<List<ComplaintResponse>> getComplaintsForHeatmap() {
        List<Complaint> complaints = complaintService.getUnresolvedComplaintsWithLocation();
        List<ComplaintResponse> complaintResponses = complaints.stream()
                .map(ComplaintResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(complaintResponses);
    }
    
    @GetMapping("/public/complaints/stats")
    public ResponseEntity<Map<String, Object>> getComplaintStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalComplaints", complaintService.getComplaintCountByStatus(ComplaintStatus.PENDING) +
                complaintService.getComplaintCountByStatus(ComplaintStatus.IN_PROGRESS) +
                complaintService.getComplaintCountByStatus(ComplaintStatus.RESOLVED));
        
        stats.put("pendingComplaints", complaintService.getComplaintCountByStatus(ComplaintStatus.PENDING));
        stats.put("inProgressComplaints", complaintService.getComplaintCountByStatus(ComplaintStatus.IN_PROGRESS));
        stats.put("resolvedComplaints", complaintService.getComplaintCountByStatus(ComplaintStatus.RESOLVED));
        
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/public/complaints/types")
    public ResponseEntity<ComplaintType[]> getComplaintTypes() {
        return ResponseEntity.ok(ComplaintType.values());
    }
}
