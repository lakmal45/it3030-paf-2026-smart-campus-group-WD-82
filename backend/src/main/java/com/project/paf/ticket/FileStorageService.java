package com.project.paf.ticket;

import net.coobird.thumbnailator.Thumbnails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Service for handling image uploads, applying compression, and storing images in Supabase Storage.
 */
@SuppressWarnings("null")
@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-role-key}")
    private String supabaseKey;

    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList("image/jpeg", "image/png", "image/webp");

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Compresses and uploads a {@link MultipartFile} to Supabase Storage.
     *
     * @param file the multipart file to save
     * @return the public URL of the uploaded file
     */
    public String store(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Only JPEG, PNG, and WebP images are allowed.");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        } else {
            // Determine extension from content type if missing
            switch (contentType) {
                case "image/jpeg": extension = ".jpg"; break;
                case "image/png": extension = ".png"; break;
                case "image/webp": extension = ".webp"; break;
            }
        }
        
        String filename = UUID.randomUUID() + extension;
        String bucketUrl = supabaseUrl + "/storage/v1/object/ticket-images/" + filename;

        try {
            // 1. Compress Image
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Thumbnails.of(file.getInputStream())
                    .size(1080, 1080) // Thumbnailator uses size() to define box limits
                    .outputQuality(0.85)
                    .keepAspectRatio(true)
                    .toOutputStream(outputStream);
            byte[] imageBytes = outputStream.toByteArray();

            log.info("Compressed image: {} KB (Original: {} KB)", 
                    imageBytes.length / 1024, file.getSize() / 1024);

            // 2. Upload to Supabase
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.set("Content-Type", contentType);

            HttpEntity<byte[]> requestEntity = new HttpEntity<>(imageBytes, headers);
            
            try {
                ResponseEntity<String> response = restTemplate.exchange(bucketUrl, HttpMethod.POST, requestEntity, String.class);
                if (!response.getStatusCode().is2xxSuccessful()) {
                    throw new RuntimeException("Supabase upload failed status: " + response.getStatusCode());
                }
            } catch (org.springframework.web.client.HttpStatusCodeException e) {
                log.error("Supabase Error Response: {}", e.getResponseBodyAsString());
                throw new RuntimeException("Supabase storage error: " + e.getResponseBodyAsString(), e);
            }

            // 3. Construct Public URL
            String publicUrl = supabaseUrl + "/storage/v1/object/public/ticket-images/" + filename;
            log.info("Stored file at: {}", publicUrl);
            return publicUrl;

        } catch (IOException e) {
            log.error("IO Exception during image processing", e);
            throw new RuntimeException("Failed to process image file: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error during Supabase upload", e);
            throw new RuntimeException("Error communicating with Supabase: " + e.getMessage(), e);
        }
    }
}
