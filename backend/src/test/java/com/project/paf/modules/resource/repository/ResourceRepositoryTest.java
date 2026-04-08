package com.project.paf.modules.resource.repository;

import com.project.paf.modules.resource.model.Resource;
import com.project.paf.modules.resource.model.ResourceStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ResourceRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ResourceRepository resourceRepository;

    @BeforeEach
    void setUp() {
        Resource r1 = new Resource();
        r1.setName("Lab 101");
        r1.setType("Lab");
        r1.setLocation("Building A");
        r1.setCapacity(30);
        r1.setAvailable(true);
        r1.setStatus(ResourceStatus.ACTIVE);
        entityManager.persist(r1);

        Resource r2 = new Resource();
        r2.setName("Room 202");
        r2.setType("Room");
        r2.setLocation("Building B");
        r2.setCapacity(10);
        r2.setAvailable(false);
        r2.setStatus(ResourceStatus.IN_MAINTENANCE);
        entityManager.persist(r2);

        entityManager.flush();
    }

    @Test
    void whenFindByType_thenReturnResources() {
        List<Resource> found = resourceRepository.findByType("Lab");
        assertThat(found).hasSize(1);
        assertThat(found.get(0).getName()).isEqualTo("Lab 101");
    }

    @Test
    void whenFindByLocation_thenReturnResources() {
        List<Resource> found = resourceRepository.findByLocation("Building B");
        assertThat(found).hasSize(1);
        assertThat(found.get(0).getName()).isEqualTo("Room 202");
    }
}
