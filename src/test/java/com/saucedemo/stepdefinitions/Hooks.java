package com.saucedemo.stepdefinitions;

import com.saucedemo.base.BaseTest;
import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.Scenario;

/**
 * Cucumber Hooks to manage the browser lifecycle and screenshot triggers per Scenario.
 * Leverages the robust BaseTest thread-local driver setup.
 */
public class Hooks extends BaseTest {

    @Before
    public void beforeScenario(Scenario scenario) {
        System.out.println("[BDD HOOK] Initializing browser for Scenario: " + scenario.getName());
        setUp(); // Launch browser configured via config.properties
    }

    @After
    public void afterScenario(Scenario scenario) {
        System.out.println("[BDD HOOK] Scenario completed: " + scenario.getName() + " | Status: " + scenario.getStatus());
        
        if (scenario.isFailed()) {
            System.out.println("[BDD HOOK] Scenario failed. Capturing screen visual...");
            String relativeScreenshotPath = captureScreenshot(scenario.getName().replaceAll("[^a-zA-Z0-9]", "_"));
            if (relativeScreenshotPath != null) {
                System.out.println("[BDD HOOK] Failure screenshot saved relative to report: " + relativeScreenshotPath);
                if (com.saucedemo.utils.ExtentManager.getTest() != null) {
                    com.saucedemo.utils.ExtentManager.getTest().addScreenCaptureFromPath(relativeScreenshotPath, "Failure Screenshot");
                    com.saucedemo.utils.ExtentManager.getTest().log(com.aventstack.extentreports.Status.INFO, "Failure screenshot attached successfully.");
                }
            }
        }
        
        tearDown(); // Terminate browser safely
    }
}
