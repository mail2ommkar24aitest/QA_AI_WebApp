package com.saucedemo.pages;

import com.saucedemo.utils.WaitUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * LoginPage encapsulates the elements and actions of the SauceDemo login page.
 */
public class LoginPage {
    private WebDriver driver;

    // Locators
    private By usernameInput = By.id("user-name");
    private By passwordInput = By.id("password");
    private By loginButton = By.id("login-button");
    private By errorMessageContainer = By.cssSelector("h3[data-test='error']");

    public LoginPage(WebDriver driver) {
        this.driver = driver;
    }

    /**
     * Enters username.
     */
    public void enterUsername(String username) {
        WebElement element = WaitUtils.waitForElementToBeVisible(driver, usernameInput, 10);
        element.clear();
        element.sendKeys(username);
    }

    /**
     * Enters password.
     */
    public void enterPassword(String password) {
        WebElement element = WaitUtils.waitForElementToBeVisible(driver, passwordInput, 10);
        element.clear();
        element.sendKeys(password);
    }

    /**
     * Clicks the login button.
     */
    public void clickLogin() {
        WebElement element = WaitUtils.waitForElementToBeClickable(driver, loginButton, 10);
        element.click();
        
        // Retry click up to 3 times if URL doesn't change and error container isn't displayed
        for (int i = 0; i < 3; i++) {
            driver.manage().timeouts().implicitlyWait(java.time.Duration.ofSeconds(0));
            try {
                if (driver.getCurrentUrl().contains("inventory.html") || !driver.findElements(errorMessageContainer).isEmpty()) {
                    break;
                }
                element.click();
            } catch (Exception e) {
                try {
                    driver.findElement(loginButton).click();
                } catch (Exception ex) {}
            } finally {
                driver.manage().timeouts().implicitlyWait(java.time.Duration.ofSeconds(10));
            }
            try { Thread.sleep(300); } catch (InterruptedException e) {}
        }
    }

    /**
     * Performs a complete login action.
     */
    public void login(String username, String password) {
        enterUsername(username);
        enterPassword(password);
        try { Thread.sleep(300); } catch (InterruptedException e) {} // Wait for React state sync
        clickLogin();
    }

    /**
     * Retrieves the error message displayed on a failed login.
     * @return String representing the error message, or empty if not present.
     */
    public String getErrorMessage() {
        try {
            WebElement element = WaitUtils.waitForElementToBeVisible(driver, errorMessageContainer, 5);
            return element.getText().trim();
        } catch (Exception e) {
            return "";
        }
    }

    /**
     * Checks if the login button is displayed.
     */
    public boolean isLoginButtonDisplayed() {
        try {
            return driver.findElement(loginButton).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
}
