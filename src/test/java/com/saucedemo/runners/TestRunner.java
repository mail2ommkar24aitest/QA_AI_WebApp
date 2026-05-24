package com.saucedemo.runners;

import io.cucumber.testng.AbstractTestNGCucumberTests;
import io.cucumber.testng.CucumberOptions;
import org.testng.annotations.DataProvider;

/**
 * TestRunner serves as the Cucumber-TestNG execution gateway.
 * Loads all feature files, links step definitions, and configures test reporters.
 */
@CucumberOptions(
        features = "src/test/resources/features",
        glue = "com.saucedemo.stepdefinitions",
        plugin = {
                "pretty",
                "html:target/cucumber-reports.html",
                "json:target/cucumber.json"
        }
)
public class TestRunner extends AbstractTestNGCucumberTests {

    @Override
    @DataProvider(parallel = false) // Set parallel to true if concurrent execution is desired
    public Object[][] scenarios() {
        return super.scenarios();
    }
}
