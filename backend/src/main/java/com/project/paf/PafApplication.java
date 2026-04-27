package com.project.paf;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PafApplication {

	public static void main(String[] args) {
		SpringApplication.run(PafApplication.class, args);
	}

}
