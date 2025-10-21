package com.civic.civicissuesystem.security;

import com.civic.civicissuesystem.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private JwtTokenProvider tokenProvider;
    private CustomUserDetailsService customUserDetailsService;
    
    public void setTokenProvider(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }
    
    public void setCustomUserDetailsService(CustomUserDetailsService customUserDetailsService) {
        this.customUserDetailsService = customUserDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            System.out.println("JwtAuthenticationFilter: Processing request to " + request.getRequestURI());
            String jwt = getJwtFromRequest(request);
            System.out.println("JwtAuthenticationFilter: JWT token from request: " + (jwt != null ? "present" : "null"));

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                String username = tokenProvider.getUsernameFromToken(jwt);
                System.out.println("JwtAuthenticationFilter: JWT token valid for user: " + username);

                UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                System.out.println("JwtAuthenticationFilter: Authentication set for user: " + username + " with authorities: " + userDetails.getAuthorities());
            } else {
                System.out.println("JwtAuthenticationFilter: JWT token validation failed or token is empty");
            }
        } catch (Exception ex) {
            System.err.println("JwtAuthenticationFilter: Could not set user authentication: " + ex.getMessage());
            logger.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        System.out.println("JwtAuthenticationFilter: Authorization header: " + bearerToken);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            String jwt = bearerToken.substring(7);
            System.out.println("JwtAuthenticationFilter: Extracted JWT: " + (jwt.length() > 20 ? jwt.substring(0, 20) + "..." : jwt));
            return jwt;
        }
        System.out.println("JwtAuthenticationFilter: No valid Bearer token found in Authorization header");
        return null;
    }
}
