package com.saucedemo.utils;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.reporter.ExtentSparkReporter;
import com.aventstack.extentreports.reporter.configuration.Theme;

import java.io.File;

/**
 * ExtentManager handles the initialization, configuration, and logging for Extent Reports.
 * It uses a ThreadLocal pattern to ensure that reports generated during parallel runs do not overlap.
 */
public class ExtentManager {
    private static ExtentReports extent;
    private static final ThreadLocal<ExtentTest> testThreadLocal = new ThreadLocal<>();

    /**
     * Initializes and returns the singular ExtentReports instance.
     */
    public static synchronized ExtentReports getReporter() {
        if (extent == null) {
            String reportPath = System.getProperty("user.dir") + "/reports/ExtentReport.html";
            File reportDir = new File(System.getProperty("user.dir") + "/reports");
            if (!reportDir.exists()) {
                reportDir.mkdirs();
            }

            ExtentSparkReporter sparkReporter = new ExtentSparkReporter(reportPath);
            sparkReporter.config().setTheme(Theme.DARK);
            sparkReporter.config().setDocumentTitle("SauceDemo Automation Suite");
            sparkReporter.config().setReportName("Execution Summary Report");

            extent = new ExtentReports();
            extent.attachReporter(sparkReporter);
            extent.setSystemInfo("Application", "SauceDemo");
            extent.setSystemInfo("Environment", "QA");
            extent.setSystemInfo("Browser", ConfigReader.getProperty("browser"));
            extent.setSystemInfo("Operating System", System.getProperty("os.name"));
        }
        return extent;
    }

    /**
     * Binds an ExtentTest instance to the current executing thread.
     */
    public static void setTest(ExtentTest test) {
        testThreadLocal.set(test);
    }

    /**
     * Retrieves the ExtentTest instance for the current executing thread.
     */
    public static ExtentTest getTest() {
        return testThreadLocal.get();
    }

    /**
     * Cleans up the ThreadLocal reference after test completion to prevent memory leaks.
     */
    public static void clearTest() {
        testThreadLocal.remove();
    }
}
