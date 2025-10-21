package com.civic.civicissuesystem.repository;

import com.civic.civicissuesystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByPhoneNumber(String phoneNumber);
    
    boolean existsByEmail(String email);
    
    boolean existsByPhoneNumber(String phoneNumber);
    
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.isEnabled = true")
    Optional<User> findActiveUserByEmail(@Param("email") String email);
}
