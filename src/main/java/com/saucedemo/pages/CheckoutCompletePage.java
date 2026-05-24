package com.saucedemo.pages;

import com.saucedemo.utils.WaitUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * CheckoutCompletePage handles the final success landing screen displaying the order confirmation.
 */
public class CheckoutCompletePage {
    private WebDriver driver;

    // Locators
    private By titleHeader = By.cssSelector("span.title");
    private By completeHeader = By.cssSelector("h2.complete-header");
    private By ponyExpressImage = By.cssSelector("img.pony_express");
    private By backToProductsButton = By.id("back-to-products");

    public CheckoutCompletePage(WebDriver driver) {
        this.driver = driver;
    }

    /**
     * Checks if this page is active.
     */
    public boolean isPageDisplayed() {
        try {
            org.openqa.selenium.support.ui.WebDriverWait wait = new org.openqa.selenium.support.ui.WebDriverWait(driver, java.time.Duration.ofSeconds(10));
            return wait.until(d -> {
                WebElement header = d.findElement(titleHeader);
                return header.isDisplayed() && header.getText().equalsIgnoreCase("Checkout: Complete!");
            });
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Retrieves the confirmation header text (e.g. "Thank you for your order!").
     */
    public String getConfirmationHeader() {
        WebElement header = WaitUtils.waitForElementToBeVisible(driver, completeHeader, 10);
        return header.getText().trim();
    }

    /**
     * Validates that the Pony Express delivery image UI asset is present and loaded.
     */
    public boolean isPonyExpressImageDisplayed() {
        try {
            WebElement img = driver.findElement(ponyExpressImage);
            return img.isDisplayed() && (img.getAttribute("src").contains("checkmark") || img.getAttribute("alt").equalsIgnoreCase("Pony Express"));
        } catch (Exception e) {
            return false;
        }
    }

    public void clickBackHome() {
        WebElement btn = WaitUtils.waitForElementToBeClickable(driver, backToProductsButton, 10);
        btn.click();
        
        // Retry up to 3 times until navigation to inventory succeeds
        for (int i = 0; i < 3; i++) {
            if (driver.getCurrentUrl().contains("inventory.html")) {
                break;
            }
            try {
                btn.click();
            } catch (Exception e) {
                try {
                    driver.findElement(backToProductsButton).click();
                } catch (Exception ex) {}
            }
            try { Thread.sleep(300); } catch (InterruptedException e) {}
        }
    }
}
