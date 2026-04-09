package com.project.paf.ticket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * Service for persisting uploaded image files to the local filesystem.
 *
 * <p>The upload root directory is configured via {@code file.upload-dir}
 * in {@code application.properties}.
 */
@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    private final Path uploadRoot;

    public FileStorageService(@Value("${file.upload-dir}") String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadRoot);
            log.info("File upload directory ready: {}", this.uploadRoot);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + this.uploadRoot, e);
        }
    }

    /**
     * Saves a {@link MultipartFile} to disk under the configured upload directory.
     *
     * @param file the multipart file to save
     * @return the relative path string that can be stored in the database
     * @throws RuntimeException if the file cannot be written
     */
    public String store(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID() + extension;
        Path destination = this.uploadRoot.resolve(filename).normalize();
        try {
            file.transferTo(destination);
            // Store as a relative path so it is portable across environments
            String relativePath = "uploads/tickets/" + filename;
            log.info("Stored file: {}", relativePath);
            return relativePath;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + filename, e);
        }
    }
}
