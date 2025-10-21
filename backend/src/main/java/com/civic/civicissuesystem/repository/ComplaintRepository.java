package com.civic.civicissuesystem.repository;

import com.civic.civicissuesystem.entity.Complaint;
import com.civic.civicissuesystem.entity.ComplaintStatus;
import com.civic.civicissuesystem.entity.ComplaintType;
import com.civic.civicissuesystem.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    
    List<Complaint> findByUser(User user);
    
    Page<Complaint> findByUser(User user, Pageable pageable);
    
    List<Complaint> findByStatus(ComplaintStatus status);
    
    Page<Complaint> findByStatus(ComplaintStatus status, Pageable pageable);
    
    List<Complaint> findByType(ComplaintType type);
    
    Page<Complaint> findByType(ComplaintType type, Pageable pageable);
    
    List<Complaint> findByStatusAndType(ComplaintStatus status, ComplaintType type);
    
    Page<Complaint> findByStatusAndType(ComplaintStatus status, ComplaintType type, Pageable pageable);
    
    @Query("SELECT c FROM Complaint c WHERE c.city = :city")
    List<Complaint> findByCity(@Param("city") String city);
    
    @Query("SELECT c FROM Complaint c WHERE c.city = :city AND c.status = :status")
    List<Complaint> findByCityAndStatus(@Param("city") String city, @Param("status") ComplaintStatus status);
    
    @Query("SELECT c FROM Complaint c WHERE c.createdAt BETWEEN :startDate AND :endDate")
    List<Complaint> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT c FROM Complaint c WHERE c.latitude IS NOT NULL AND c.longitude IS NOT NULL")
    List<Complaint> findComplaintsWithLocation();
    
    @Query("SELECT c FROM Complaint c WHERE c.latitude IS NOT NULL AND c.longitude IS NOT NULL AND c.status != 'RESOLVED'")
    List<Complaint> findUnresolvedComplaintsWithLocation();
    
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status = :status")
    Long countByStatus(@Param("status") ComplaintStatus status);
    
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.type = :type")
    Long countByType(@Param("type") ComplaintType type);
    
    @Query("SELECT c FROM Complaint c ORDER BY c.createdAt DESC")
    Page<Complaint> findAllOrderByCreatedAtDesc(Pageable pageable);
}
