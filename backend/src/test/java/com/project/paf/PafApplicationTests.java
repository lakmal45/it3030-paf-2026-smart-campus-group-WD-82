package com.project.paf;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;

@SpringBootTest
class PafApplicationTests {

	@MockitoBean
	ClientRegistrationRepository clientRegistrationRepository;

	@Test
	void contextLoads() {
	}

}
