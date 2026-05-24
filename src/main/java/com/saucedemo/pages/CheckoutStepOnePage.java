package com.saucedemo.pages;

import com.saucedemo.utils.WaitUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.JavascriptExecutor;

/**
 * CheckoutStepOnePage represents the first stage of Checkout, where personal info is captured.
 */
public class CheckoutStepOnePage {
    private WebDriver driver;

    // Locators
    private By titleHeader = By.cssSelector("span.title");
    private By firstNameInput = By.id("first-name");
    private By lastNameInput = By.id("last-name");
    private By postalCodeInput = By.id("postal-code");
    private By continueButton = By.id("continue");
    private By errorMessageContainer = By.cssSelector("h3[data-test='error']");

    public CheckoutStepOnePage(WebDriver driver) {
        this.driver = driver;
    }

    /**
     * Verifies if this page is active.
     */
    public boolean isPageDisplayed() {
        try {
            org.openqa.selenium.support.ui.WebDriverWait wait = new org.openqa.selenium.support.ui.WebDriverWait(driver, java.time.Duration.ofSeconds(10));
            return wait.until(d -> {
                WebElement header = d.findElement(titleHeader);
                return header.isDisplayed() && header.getText().equalsIgnoreCase("Checkout: Your Information");
            });
        } catch (Exception e) {
            return false;
        }
    }

    public void enterFirstName(String firstName) {
        WebElement element = WaitUtils.waitForElementToBeVisible(driver, firstNameInput, 5);
        element.clear();
        element.sendKeys(firstName);
    }

    public void enterLastName(String lastName) {
        WebElement element = WaitUtils.waitForElementToBeVisible(driver, lastNameInput, 5);
        element.clear();
        element.sendKeys(lastName);
    }

    public void enterPostalCode(String postalCode) {
        WebElement element = WaitUtils.waitForElementToBeVisible(driver, postalCodeInput, 5);
        element.clear();
        element.sendKeys(postalCode);
    }

    /**
     * Attempts to dismiss Chrome's native "Change your password" dialog
     * that appears after login. This is a native browser UI dialog (not a web alert),
     * so we use multiple strategies: Escape key, JavaScript click on OK, Selenium alert dismiss.
     */
    private void dismissNativeDialog() {
        // Strategy 1: Try to dismiss as a Selenium alert
        try {
            driver.switchTo().alert().dismiss();
            System.out.println("[INFO] Dismissed native browser alert via switchTo().alert()");
            return;
        } catch (Exception ignored) {}

        // Strategy 2: Press Escape key to close the dialog
        try {
            driver.findElement(By.tagName("body")).sendKeys(Keys.ESCAPE);
            Thread.sleep(300);
            System.out.println("[INFO] Sent ESC key to close native dialog");
        } catch (Exception ignored) {}

        // Strategy 3: Use JavaScript to click the OK button if visible in DOM
        try {
            ((JavascriptExecutor) driver).executeScript(
                "var dialogs = document.querySelectorAll('cr-dialog, dialog');" +
                "for(var d of dialogs){ try { d.querySelector('button:last-child').click(); } catch(e){} }"
            );
        } catch (Exception ignored) {}
    }

    /**
     * Fills the personal details form and submits it.
     */
    public void fillInformation(String firstName, String lastName, String postalCode) {
        // Dismiss any Chrome native dialog (e.g. "Change your password") before interacting
        dismissNativeDialog();
        try { Thread.sleep(500); } catch (InterruptedException e) {}
        enterFirstName(firstName);
        enterLastName(lastName);
        enterPostalCode(postalCode);
        try { Thread.sleep(300); } catch (InterruptedException e) {} // Wait for React state sync
        clickContinue();
    }

    public void clickContinue() {
        WebElement btn = WaitUtils.waitForElementToBeClickable(driver, continueButton, 10);
        btn.click();
        
        // Retry up to 3 times until navigation to step two happens or a validation error is displayed
        for (int i = 0; i < 3; i++) {
            driver.manage().timeouts().implicitlyWait(java.time.Duration.ofSeconds(0));
            try {
                if (driver.getCurrentUrl().contains("checkout-step-two.html") || !driver.findElements(errorMessageContainer).isEmpty()) {
                    break;
                }
                btn.click();
            } catch (Exception e) {
                try {
                    ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].click();", driver.findElement(continueButton));
                } catch (Exception ex) {}
            } finally {
                driver.manage().timeouts().implicitlyWait(java.time.Duration.ofSeconds(10));
            }
            try { Thread.sleep(300); } catch (InterruptedException e) {}
        }
    }

    /**
     * Retrieves the validation error message if fields are left blank.
     */
    public String getErrorMessage() {
        try {
            WebElement element = WaitUtils.waitForElementToBeVisible(driver, errorMessageContainer, 5);
            return element.getText().trim();
        } catch (Exception e) {
            return "";
        }
    }
}
