package com.civic.civicissuesystem.controller;

import com.civic.civicissuesystem.dto.JwtResponse;
import com.civic.civicissuesystem.dto.LoginRequest;
import com.civic.civicissuesystem.dto.SignupRequest;
import com.civic.civicissuesystem.entity.User;
import com.civic.civicissuesystem.repository.UserRepository;
import com.civic.civicissuesystem.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtTokenProvider.generateToken(authentication);
            
            User user = (User) authentication.getPrincipal();
            
            return ResponseEntity.ok(new JwtResponse(jwt, user.getId(), user.getName(), 
                    user.getEmail(), user.getRole(), user.getPhoneNumber(), user.getAddress(),
                    user.getCity(), user.getState(), user.getZipCode(), 
                    user.getCreatedAt(), user.getUpdatedAt()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Authentication failed", "message", e.getMessage()));
        }
    }
    
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Error: Email is already taken!"));
        }
        
        if (signUpRequest.getPhoneNumber() != null && 
            userRepository.existsByPhoneNumber(signUpRequest.getPhoneNumber())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Error: Phone number is already taken!"));
        }
        
        // Create new user's account
        User user = new User(signUpRequest.getName(), 
                signUpRequest.getEmail(),
                signUpRequest.getPhoneNumber(),
                passwordEncoder.encode(signUpRequest.getPassword()),
                signUpRequest.getRole());
        
        user.setAddress(signUpRequest.getAddress());
        user.setCity(signUpRequest.getCity());
        user.setState(signUpRequest.getState());
        user.setZipCode(signUpRequest.getZipCode());
        
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("phoneNumber", user.getPhoneNumber());
        response.put("role", user.getRole());
        response.put("address", user.getAddress());
        response.put("city", user.getCity());
        response.put("state", user.getState());
        response.put("zipCode", user.getZipCode());
        
        return ResponseEntity.ok(response);
    }
}
