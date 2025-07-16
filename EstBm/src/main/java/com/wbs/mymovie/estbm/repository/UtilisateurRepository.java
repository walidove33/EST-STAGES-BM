package com.wbs.mymovie.estbm.repository;

import com.wbs.mymovie.estbm.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    Optional<Utilisateur> findByEmail(String email);

    boolean existsByEmail(String email);
}