package cl.nexostore.api.auth;

import cl.nexostore.api.security.JwtService;
import cl.nexostore.api.user.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.util.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final StoreUserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final boolean cookieSecure;

    public AuthController(StoreUserRepository u, PasswordEncoder e, JwtService j, @Value("${app.cookie.secure:false}") boolean secure) {
        users = u;
        encoder = e;
        jwt = j;
        cookieSecure = secure;
    }

    public record Login(@NotBlank @Email String email, @NotBlank String password) {
    }

    public record Register(@NotBlank String name, @NotBlank @Email String email,
                           @NotBlank @Size(min = 6) String password) {
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody Login b) {
        var u = users.findByEmailIgnoreCase(b.email().trim()).orElse(null);
        if (u == null || !u.isActive() || !encoder.matches(b.password(), u.getPassword()))
            return ResponseEntity.status(401).body(Map.of("error", "Correo o contraseña incorrectos."));
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie(jwt.generate(u), 3600).toString()).body(Map.of("user", safe(u)));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody Register b) {
        String email = b.email().trim().toLowerCase();
        if (users.findByEmailIgnoreCase(email).isPresent())
            return ResponseEntity.badRequest().body(Map.of("error", "Ese correo ya existe."));
        StoreUser u = new StoreUser();
        u.setName(b.name().trim());
        u.setEmail(email);
        u.setPassword(encoder.encode(b.password()));
        u.setRole("CLIENT");
        u.setActive(true);
        u = users.save(u);
        return ResponseEntity.status(201).header(HttpHeaders.SET_COOKIE, cookie(jwt.generate(u), 3600).toString()).body(Map.of("user", safe(u)));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal String email) {
        if (email == null) return ResponseEntity.status(401).body(Map.of("error", "Sesión no iniciada"));
        return users.findByEmailIgnoreCase(email).filter(StoreUser::isActive).<ResponseEntity<?>>map(u -> ResponseEntity.ok(Map.of("user", safe(u)))).orElseGet(() -> ResponseEntity.status(401).body(Map.of("error", "Sesión expirada")));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie("", 0).toString()).body(Map.of("ok", true));
    }

    private ResponseCookie cookie(String token, int age) {
        return ResponseCookie.from("NEXOSTORE_TOKEN", token).httpOnly(true).secure(cookieSecure).sameSite("Lax").path("/").maxAge(age).build();
    }

    private Map<String, Object> safe(StoreUser u) {
        return Map.of("id", String.valueOf(u.getId()), "name", u.getName(), "email", u.getEmail(), "role", u.getRole().toLowerCase());
    }
}
