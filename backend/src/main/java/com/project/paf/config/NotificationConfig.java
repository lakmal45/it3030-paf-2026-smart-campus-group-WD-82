package com.project.paf.config;

import com.smartcampus.notification.NotificationService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class NotificationConfig {

    @Bean
    public NotificationService notificationService() {
        return new NotificationService();
    }
}
