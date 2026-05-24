package com.saucedemo.base;

import com.saucedemo.utils.ConfigReader;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * BaseTest serves as the core test scaffold, managing browser lifecycle in a thread-safe manner.
 */
public class BaseTest {
    // ThreadLocal allows each test running in parallel to have its own independent WebDriver instance.
    protected static ThreadLocal<WebDriver> driverThread = new ThreadLocal<>();

    /**
     * Gets the active WebDriver instance for the current executing thread.
     */
    public WebDriver getDriver() {
        return driverThread.get();
    }

    /**
     * Executes before every test method. Sets up browser drivers and launches the application.
     */
    @BeforeMethod(alwaysRun = true)
    public void setUp() {
        String browserName = ConfigReader.getProperty("browser");
        String headlessOpt = ConfigReader.getProperty("headless");
        boolean isHeadless = Boolean.parseBoolean(headlessOpt);
        WebDriver driver;

        if (browserName == null) {
            browserName = "chrome";
        }

        System.out.println("Setting up WebDriver for browser: " + browserName + " | Headless: " + isHeadless);

        switch (browserName.toLowerCase()) {
            case "firefox":
                FirefoxOptions firefoxOptions = new FirefoxOptions();
                if (isHeadless) {
                    firefoxOptions.addArguments("-headless");
                }
                driver = new FirefoxDriver(firefoxOptions);
                break;

            case "edge":
                EdgeOptions edgeOptions = new EdgeOptions();
                if (isHeadless) {
                    edgeOptions.addArguments("--headless");
                }
                driver = new EdgeDriver(edgeOptions);
                break;

            case "chrome":
            default:
                ChromeOptions chromeOptions = new ChromeOptions();
                chromeOptions.addArguments("--remote-allow-origins=*");
                // Suppress the "Change your password" / password breach Chrome native dialog
                chromeOptions.addArguments("--disable-save-password-bubble");
                chromeOptions.addArguments("--disable-features=PasswordLeakDetection,SafeBrowsingAvoidChecks");
                chromeOptions.addArguments("--disable-password-generation");
                chromeOptions.addArguments("--password-store=basic");
                chromeOptions.addArguments("--use-mock-keychain");

                Map<String, Object> prefs = new HashMap<>();
                // Disable all password manager features
                prefs.put("credentials_enable_service", false);
                prefs.put("profile.password_manager_enabled", false);
                prefs.put("profile.password_manager_leak_detection", false);
                // Disable SafeBrowsing to prevent breach popups
                prefs.put("safebrowsing.enabled", false);
                prefs.put("safebrowsing.disable_download_protection", true);
                chromeOptions.setExperimentalOption("prefs", prefs);
                // Suppress automation infobar and extensions
                chromeOptions.setExperimentalOption("excludeSwitches", java.util.Arrays.asList("enable-automation"));
                chromeOptions.setExperimentalOption("useAutomationExtension", false);

                if (isHeadless) {
                    chromeOptions.addArguments("--headless=new");
                    chromeOptions.addArguments("--disable-gpu");
                    chromeOptions.addArguments("--no-sandbox");
                    chromeOptions.addArguments("--disable-dev-shm-usage");
                }
                driver = new ChromeDriver(chromeOptions);
                break;
        }

        driver.manage().window().maximize();

        int timeout = Integer.parseInt(ConfigReader.getProperty("timeout"));
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(timeout));

        driverThread.set(driver);

        // Navigate to base application URL
        driver.get(ConfigReader.getProperty("url"));
    }

    /**
     * Executes after every test method. Closes the active driver instance.
     */
    @AfterMethod(alwaysRun = true)
    public void tearDown() {
        WebDriver driver = getDriver();
        if (driver != null) {
            System.out.println("Tearing down WebDriver...");
            driver.quit();
            driverThread.remove();
        }
    }

    /**
     * Captures a screenshot of the current browser page.
     * @param testName The name of the test to suffix the filename.
     * @return Absolute file path to the captured screenshot.
     */
    public String captureScreenshot(String testName) {
        WebDriver driver = getDriver();
        if (driver == null) {
            System.err.println("Driver is null. Cannot capture screenshot.");
            return null;
        }
        
        File srcFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
        String fileName = testName + "_" + System.currentTimeMillis() + ".png";
        String screenshotPath = System.getProperty("user.dir") + "/reports/screenshots/" + fileName;
        File destFile = new File(screenshotPath);
        
        try {
            File dir = destFile.getParentFile();
            if (!dir.exists()) {
                dir.mkdirs();
            }
            Files.copy(srcFile.toPath(), destFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
            // Return relative path from report location (reports/) to screenshot, so HTML displays it correctly
            return "screenshots/" + fileName;
        } catch (IOException e) {
            System.err.println("Failed to save screenshot: " + e.getMessage());
            return null;
        }
    }
}
