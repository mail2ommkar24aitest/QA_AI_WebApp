package com.saucedemo.pages;

import com.saucedemo.utils.WaitUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.ArrayList;
import java.util.List;

/**
 * CartPage represents the shopping cart details page.
 */
public class CartPage {
    private WebDriver driver;

    // Locators
    private By titleHeader = By.cssSelector("span.title");
    private By itemNames = By.cssSelector("div.inventory_item_name");
    private By checkoutButton = By.id("checkout");

    public CartPage(WebDriver driver) {
        this.driver = driver;
    }

    /**
     * Checks if the Cart Page is active.
     */
    public boolean isCartPageDisplayed() {
        try {
            org.openqa.selenium.support.ui.WebDriverWait wait = new org.openqa.selenium.support.ui.WebDriverWait(driver,
                    java.time.Duration.ofSeconds(10));
            return wait.until(d -> {
                WebElement header = d.findElement(titleHeader);
                return header.isDisplayed() && header.getText().equalsIgnoreCase("Your Cart");
            });
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Retrieves the names of all products currently in the cart.
     */
    public List<String> getCartItemNames() {
        List<WebElement> elements = driver.findElements(itemNames);
        List<String> names = new ArrayList<>();
        for (WebElement element : elements) {
            names.add(element.getText().trim());
        }
        return names;
    }

    /**
     * Removes a product from the cart directly from the cart page.
     */
    public void removeItem(String productName) {
        String formattedName = productName.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-");
        By removeButton = By.id("remove-" + formattedName);

        WebElement btn = WaitUtils.waitForElementToBeClickable(driver, removeButton, 10);
        btn.click();

        // Retry click up to 3 times if React lags and the item remains in list
        for (int i = 0; i < 3; i++) {
            driver.manage().timeouts().implicitlyWait(java.time.Duration.ofSeconds(0));
            try {
                if (driver.findElements(removeButton).isEmpty()) {
                    break;
                }
                btn.click();
            } catch (Exception e) {
                try {
                    driver.findElement(removeButton).click();
                } catch (Exception ex) {
                }
            } finally {
                driver.manage().timeouts().implicitlyWait(java.time.Duration.ofSeconds(10));
            }
            try {
                Thread.sleep(300);
            } catch (InterruptedException e) {
            }
        }
    }

    /**
     * Clicks checkout button to navigate to the information entry step.
     */
    public void clickCheckout() {
        WebElement btn = WaitUtils.waitForElementToBeClickable(driver, checkoutButton, 10);
        btn.click();

        // Retry click up to 3 times until navigation succeeds to step one
        for (int i = 0; i < 3; i++) {
            if (driver.getCurrentUrl().contains("checkout-step-one.html")) {
                break;
            }
            try {
                btn.click();
            } catch (Exception e) {
                try {
                    ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].click();",
                            driver.findElement(checkoutButton));
                } catch (Exception ex) {
                }
            }
            try {
                Thread.sleep(300);
            } catch (InterruptedException e) {
            }
        }
    }
}
