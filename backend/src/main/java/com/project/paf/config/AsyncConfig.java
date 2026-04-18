package com.project.paf.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Enables Spring's asynchronous method execution capability.
 * This allows methods annotated with @Async to run in a separate thread pool.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
    // Standard configuration for @EnableAsync. 
    // Custom task executors can be defined here if needed.
}
