package utils;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.reporter.ExtentSparkReporter;
import com.aventstack.extentreports.reporter.configuration.Theme;

import java.io.File;

public class ExtentManager {
    private static ExtentReports extentReports;

    public static ExtentReports createInstance() {
        if (extentReports == null) {
            String reportPath = System.getProperty("user.dir") + "/target/ExtentReports/ExtentReport.html";
            File reportDir = new File(System.getProperty("user.dir") + "/target/ExtentReports");
            if (!reportDir.exists()) {
                reportDir.mkdirs();
            }
            
            ExtentSparkReporter htmlReporter = new ExtentSparkReporter(reportPath);
            htmlReporter.config().setDocumentTitle("Petstore API Automation Report");
            htmlReporter.config().setReportName("API Test Execution Results");
            htmlReporter.config().setTheme(Theme.STANDARD);

            extentReports = new ExtentReports();
            extentReports.attachReporter(htmlReporter);
            extentReports.setSystemInfo("Environment", "QA");
            extentReports.setSystemInfo("Tester", "Automation User");
        }
        return extentReports;
    }
}
