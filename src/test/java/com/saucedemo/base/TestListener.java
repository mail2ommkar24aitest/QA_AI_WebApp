package com.saucedemo.base;

import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import com.saucedemo.utils.ExtentManager;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;

/**
 * TestListener implements ITestListener to manage logging results and capturing failure screenshots automatically.
 * It ensures the Extent Report matches the actual TestNG status and integrates screenshots natively.
 */
public class TestListener implements ITestListener {

    @Override
    public void onStart(ITestContext context) {
        System.out.println("==================================================");
        System.out.println("SUITE STARTED: " + context.getName());
        System.out.println("==================================================");
        ExtentManager.getReporter(); // Pre-initializes Extent Reports
    }

    @Override
    public void onFinish(ITestContext context) {
        System.out.println("==================================================");
        System.out.println("SUITE FINISHED: " + context.getName());
        System.out.println("==================================================");
        ExtentManager.getReporter().flush(); // Writes all logs to the HTML report file
    }

    @Override
    public void onTestStart(ITestResult result) {
        System.out.println(">>> RUNNING TEST: " + result.getMethod().getMethodName());
        
        // Extract scenario name from Cucumber TestNG parameters if available
        String testName = result.getMethod().getMethodName();
        Object[] parameters = result.getParameters();
        if (parameters != null && parameters.length > 0 && parameters[0] instanceof String) {
            testName = (String) parameters[0]; // Cucumber scenario name
        }
        
        // Create an ExtentTest item with the scenario name
        ExtentTest test = ExtentManager.getReporter().createTest(testName);
        
        // Categorize by TestNG groups (e.g., login, products, checkout)
        String[] groups = result.getMethod().getGroups();
        for (String group : groups) {
            test.assignCategory(group);
        }
        
        // If there is a second parameter (feature name), add it as a category
        if (parameters != null && parameters.length > 1 && parameters[1] instanceof String) {
            test.assignCategory((String) parameters[1]);
        }
        
        ExtentManager.setTest(test);
        test.log(Status.INFO, "Execution started for: " + testName);
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        System.out.println(">>> TEST PASSED: " + result.getMethod().getMethodName());
        ExtentManager.getTest().log(Status.PASS, "Test Case Passed Successfully.");
        ExtentManager.clearTest();
    }

    @Override
    public void onTestFailure(ITestResult result) {
        System.err.println(">>> TEST FAILED: " + result.getMethod().getMethodName());
        
        ExtentTest test = ExtentManager.getTest();
        test.log(Status.FAIL, "Test Case FAILED. Reason: " + result.getThrowable());

        // Capture and attach screenshot on failure
        Object currentClass = result.getInstance();
        if (currentClass instanceof BaseTest) {
            String screenshotPath = ((BaseTest) currentClass).captureScreenshot(result.getMethod().getMethodName());
            if (screenshotPath != null) {
                // Attach the screenshot to Extent Report using the path returned
                test.addScreenCaptureFromPath(screenshotPath, "Failure Screenshot");
                test.log(Status.INFO, "Failure screenshot attached successfully.");
            }
        }
        ExtentManager.clearTest();
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        System.out.println(">>> TEST SKIPPED: " + result.getMethod().getMethodName());
        ExtentManager.getTest().log(Status.SKIP, "Test Case SKIPPED.");
        ExtentManager.clearTest();
    }
}
