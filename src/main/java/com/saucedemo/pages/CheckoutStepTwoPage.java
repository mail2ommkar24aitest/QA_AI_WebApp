package com.saucedemo.pages;

import com.saucedemo.utils.WaitUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.ArrayList;
import java.util.List;

/**
 * CheckoutStepTwoPage represents the final review of products and pricing before finalizing order.
 */
public class CheckoutStepTwoPage {
    private WebDriver driver;

    // Locators
    private By titleHeader = By.cssSelector("span.title");
    private By itemNames = By.cssSelector("div.inventory_item_name");
    private By paymentInfoLabel = By.xpath("//div[text()='Payment Information']/following-sibling::div[1]");
    private By shippingInfoLabel = By.xpath("//div[text()='Shipping Information']/following-sibling::div[1]");
    private By totalPriceLabel = By.cssSelector("div.summary_total_label");
    private By finishButton = By.id("finish");

    public CheckoutStepTwoPage(WebDriver driver) {
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
                return header.isDisplayed() && header.getText().equalsIgnoreCase("Checkout: Overview");
            });
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Retrieves the names of items being checked out.
     */
    public List<String> getItemNames() {
        List<WebElement> elements = driver.findElements(itemNames);
        List<String> names = new ArrayList<>();
        for (WebElement element : elements) {
            names.add(element.getText().trim());
        }
        return names;
    }

    /**
     * Retrieves the payment method info.
     */
    public String getPaymentInfo() {
        return driver.findElement(paymentInfoLabel).getText().trim();
    }

    /**
     * Retrieves the shipping information info.
     */
    public String getShippingInfo() {
        return driver.findElement(shippingInfoLabel).getText().trim();
    }

    /**
     * Retrieves the total price string (e.g. "Total: $32.39").
     */
    public String getTotalPriceString() {
        return driver.findElement(totalPriceLabel).getText().trim();
    }

    public void clickFinish() {
        WebElement btn = WaitUtils.waitForElementToBeClickable(driver, finishButton, 10);
        btn.click();
        
        // Retry up to 3 times until navigation to checkout-complete page succeeds
        for (int i = 0; i < 3; i++) {
            if (driver.getCurrentUrl().contains("checkout-complete.html")) {
                break;
            }
            try {
                btn.click();
            } catch (Exception e) {
                try {
                    ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].click();", driver.findElement(finishButton));
                } catch (Exception ex) {}
            }
            try { Thread.sleep(300); } catch (InterruptedException e) {}
        }
    }
}
