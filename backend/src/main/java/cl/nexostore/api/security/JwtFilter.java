package cl.nexostore.api.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.util.*;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import cl.nexostore.api.user.*;

@Component
public class JwtFilter extends OncePerRequestFilter {
    private final JwtService jwt;
    private final StoreUserRepository users;

    public JwtFilter(JwtService j, StoreUserRepository u) {
        jwt = j;
        users = u;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws ServletException, IOException {
        String token = null;
        String h = req.getHeader("Authorization");
        if (h != null && h.startsWith("Bearer ")) token = h.substring(7);
        if (token == null && req.getCookies() != null) for (Cookie c : req.getCookies())
            if ("NEXOSTORE_TOKEN".equals(c.getName())) {
                token = c.getValue();
                break;
            }
        if (token != null && !token.isBlank()) try {
            String email = jwt.subject(token);
            StoreUser u = users.findByEmailIgnoreCase(email).orElseThrow();
            if (u.isActive())
                SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(u.getEmail(), null, List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole()))));
        } catch (Exception ignored) {
            SecurityContextHolder.clearContext();
        }
        chain.doFilter(req, res);
    }
}
