package com.flingo.flingo_b;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FlingoBApplication {

	public static void main(String[] args) {
		SpringApplication.run(FlingoBApplication.class, args);
	}

}
// this is the entry point after this the code will search for the beans ie classes annoted with @RestController @service @Repository
