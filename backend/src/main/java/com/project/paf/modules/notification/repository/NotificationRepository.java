package com.project.paf.modules.notification.repository;

import com.project.paf.modules.notification.model.Notification;
import com.project.paf.modules.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByTargetUserOrderByCreatedAtDesc(User targetUser);
    
    long countByTargetUserAndIsReadFalse(User targetUser);
}
