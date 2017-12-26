package com.beezai.beeHive.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.beezai.beeHive.Model.TestAPI;

@RestController
public class TestController {
	
	private static final String message = "Hi %s!, I'm Live";
	
	@RequestMapping("/api/test")
	public TestAPI test(@RequestParam(value="name", defaultValue="there") String name) {
		return new TestAPI(String.format(message, name));		
	}
	
}
