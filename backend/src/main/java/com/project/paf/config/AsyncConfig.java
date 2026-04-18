package com.project.paf.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Enables Spring's {@code @Async} support and configures a dedicated
 * thread pool for background tasks (e.g. sending notification emails)
 * so email delivery never blocks the HTTP request thread.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * Thread pool used for all {@code @Async} email-sending tasks.
     *
     * <ul>
     *   <li>Core pool: 2 threads always alive to handle bursts</li>
     *   <li>Max pool: 10 threads under heavy load</li>
     *   <li>Queue: 100 tasks buffered before rejection</li>
     * </ul>
     */
    @Bean(name = "emailTaskExecutor")
    public Executor emailTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("email-");
        executor.initialize();
        return executor;
    }
}
