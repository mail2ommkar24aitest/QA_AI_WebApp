package base;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.reporter.ExtentSparkReporter;
import io.restassured.RestAssured;
import io.restassured.specification.RequestSpecification;
import org.testng.ITestResult;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;

import java.io.File;
import java.lang.reflect.Method;

/**
 * BaseTest - Sets up common configuration for all API tests.
 * All test classes should extend this class.
 */
public class BaseTest {

    // Common request specification shared across tests
    protected RequestSpecification requestSpec;

    // Extent Reports fields
    protected static ExtentReports extent;
    protected static ExtentTest test;

    @BeforeSuite
    public void setupReport() {
        // Create Report folder if it doesn't exist
        File reportDir = new File("Report");
        if (!reportDir.exists()) {
            reportDir.mkdir();
        }

        // Initialize SparkReporter
        ExtentSparkReporter spark = new ExtentSparkReporter("Report/API_Test_Report.html");
        spark.config().setReportName("ReqRes API Automation Results");
        spark.config().setDocumentTitle("Test Report");

        extent = new ExtentReports();
        extent.attachReporter(spark);
        extent.setSystemInfo("Environment", "QA");
        extent.setSystemInfo("Tester", "Senior QA Engineer");
    }

    @BeforeMethod
    public void startTest(Method method) {
        // Start recording test in the report
        test = extent.createTest(method.getName());
    }

    @AfterMethod
    public void tearDown(ITestResult result) {
        if (result.getStatus() == ITestResult.FAILURE) {
            test.fail(result.getThrowable());
        } else if (result.getStatus() == ITestResult.SKIP) {
            test.skip("Test Skipped");
        } else {
            test.pass("Test Passed");
        }
    }

    @AfterSuite
    public void flushReport() {
        // Write the report to the file
        extent.flush();
    }

    @BeforeClass
    public void setup() {
        // Set the base URI for all API requests
        RestAssured.baseURI = "https://reqres.in";

        // Build a common request specification with headers
        requestSpec = RestAssured.given()
                .relaxedHTTPSValidation()
                .header("Content-Type", "application/json")
                .header("x-api-key", "free_user_3DGTFAVnuGs5GggimdAqdV5k7Ce")
                .header("Accept", "application/json");
    }
}
