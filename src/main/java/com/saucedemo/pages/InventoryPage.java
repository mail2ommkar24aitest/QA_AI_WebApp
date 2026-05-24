package com.saucedemo.pages;

import com.saucedemo.utils.WaitUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;

import java.util.ArrayList;
import java.util.List;

/**
 * InventoryPage handles the product listing, sorting, and adding/removing items to/from the cart.
 */
public class InventoryPage {
    private WebDriver driver;

    // Locators
    private By titleHeader = By.cssSelector("span.title");
    private By productSortDropdown = By.cssSelector("select.product_sort_container");
    private By itemNames = By.cssSelector("div.inventory_item_name");
    private By itemPrices = By.cssSelector("div.inventory_item_price");
    private By shoppingCartBadge = By.cssSelector("span.shopping_cart_badge");
    private By shoppingCartLink = By.cssSelector("a.shopping_cart_link");
    private By burgerMenuButton = By.id("react-burger-menu-btn");
    private By logoutSidebarLink = By.id("logout_sidebar_link");

    public InventoryPage(WebDriver driver) {
        this.driver = driver;
    }

    /**
     * Checks if the inventory page is displayed.
     */
    public boolean isInventoryPageDisplayed() {
        try {
            org.openqa.selenium.support.ui.WebDriverWait wait = new org.openqa.selenium.support.ui.WebDriverWait(driver, java.time.Duration.ofSeconds(10));
            return wait.until(d -> {
                WebElement header = d.findElement(titleHeader);
                return header.isDisplayed() && header.getText().equalsIgnoreCase("Products");
            });
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Retrieves the names of all products displayed on the page.
     */
    public List<String> getProductNames() {
        List<WebElement> elements = WaitUtils.waitForAllElementsToBeVisible(driver, itemNames, 10);
        List<String> names = new ArrayList<>();
        for (WebElement element : elements) {
            names.add(element.getText().trim());
        }
        return names;
    }

    /**
     * Retrieves the prices of all products displayed on the page as Doubles.
     */
    public List<Double> getProductPrices() {
        List<WebElement> elements = WaitUtils.waitForAllElementsToBeVisible(driver, itemPrices, 10);
        List<Double> prices = new ArrayList<>();
        for (WebElement element : elements) {
            String priceText = element.getText().replace("$", "").trim();
            prices.add(Double.parseDouble(priceText));
        }
        return prices;
    }

    /**
     * Selects a sorting option from the dropdown.
     * @param optionText The visible text of the sort option (e.g., "Name (A to Z)", "Price (low to high)")
     */
    public void selectSortOption(String optionText) {
        WebElement dropdown = WaitUtils.waitForElementToBeVisible(driver, productSortDropdown, 5);
        Select select = new Select(dropdown);
        select.selectByVisibleText(optionText);
    }

    /**
     * Helper to convert product name to the format used in SauceDemo's element IDs.
     * Example: "Sauce Labs Backpack" -> "sauce-labs-backpack"
     */
    private String formatProductName(String productName) {
        return productName.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "") // Remove special characters
                .replaceAll("\\s+", "-");        // Replace spaces with hyphens
    }

    /**
     * Adds an item to the cart by product name and verifies the action.
     */
    public void addItemToCart(String productName) {
        String formattedName = formatProductName(productName);
        By addToCartButton = By.id("add-to-cart-" + formattedName);
        By removeButton = By.id("remove-" + formattedName);
        
        WebElement btn = WaitUtils.waitForElementToBeClickable(driver, addToCartButton, 10);
        btn.click();
        
        // If React swallowed the click, retry up to 3 times until the button changes to 'Remove'
        for (int i = 0; i < 3; i++) {
            driver.manage().timeouts().implicitlyWait(java.time.Duration.ofSeconds(0));
            try {
                if (!driver.findElements(removeButton).isEmpty()) {
                    break;
                }
                btn.click();
            } catch (Exception e) {
                // If button became stale or was replaced, locate again
                try {
                    ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].click();", driver.findElement(addToCartButton));
                } catch (Exception ex) {}
            } finally {
                driver.manage().timeouts().implicitlyWait(java.time.Duration.ofSeconds(10));
            }
            try { Thread.sleep(300); } catch (InterruptedException e) {}
        }
    }

    /**
     * Removes an item from the cart by product name and verifies the action.
     */
    public void removeItemFromCart(String productName) {
        String formattedName = formatProductName(productName);
        By removeButton = By.id("remove-" + formattedName);
        By addToCartButton = By.id("add-to-cart-" + formattedName);
        
        WebElement btn = WaitUtils.waitForElementToBeClickable(driver, removeButton, 10);
        btn.click();
        
        // If React swallowed the click, retry up to 3 times until the button changes to 'Add to cart'
        for (int i = 0; i < 3; i++) {
            driver.manage().timeouts().implicitlyWait(java.time.Duration.ofSeconds(0));
            try {
                if (!driver.findElements(addToCartButton).isEmpty()) {
                    break;
                }
                btn.click();
            } catch (Exception e) {
                try {
                    ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].click();", driver.findElement(removeButton));
                } catch (Exception ex) {}
            } finally {
                driver.manage().timeouts().implicitlyWait(java.time.Duration.ofSeconds(10));
            }
            try { Thread.sleep(300); } catch (InterruptedException e) {}
        }
    }

    /**
     * Retrieves the number of items in the shopping cart.
     * @return Integer representation of cart badge count, or 0 if no badge is displayed.
     */
    public int getCartCount() {
        // Temporarily disable implicit wait to check presence instantly
        driver.manage().timeouts().implicitlyWait(java.time.Duration.ofSeconds(0));
        try {
            org.openqa.selenium.support.ui.WebDriverWait wait = new org.openqa.selenium.support.ui.WebDriverWait(driver, java.time.Duration.ofMillis(2000));
            String textValue = wait.until(d -> {
                List<WebElement> badges = d.findElements(shoppingCartBadge);
                if (badges.isEmpty()) {
                    return null;
                }
                String text = badges.get(0).getText().trim();
                return (!text.isEmpty() && text.matches("\\d+")) ? text : null;
            });
            
            if (textValue != null) {
                return Integer.parseInt(textValue);
            }
            return 0;
        } catch (Exception e) {
            // Cart badge is not present or visible (meaning it's empty)
            return 0;
        } finally {
            // Restore global implicit wait
            driver.manage().timeouts().implicitlyWait(java.time.Duration.ofSeconds(10));
        }
    }

    /**
     * Clicks the shopping cart link to navigate to the cart page.
     */
    public void clickCart() {
        WebElement btn = WaitUtils.waitForElementToBeClickable(driver, shoppingCartLink, 10);
        btn.click();
        
        // If React swallowed the click, retry up to 3 times until the URL changes
        for (int i = 0; i < 3; i++) {
            if (driver.getCurrentUrl().contains("cart.html")) {
                break;
            }
            try {
                btn.click();
            } catch (Exception e) {
                try {
                    ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].click();", driver.findElement(shoppingCartLink));
                } catch (Exception ex) {}
            }
            try { Thread.sleep(300); } catch (InterruptedException e) {}
        }
    }

    /**
     * Clicks the burger menu to open the side navigation.
     */
    public void clickMenu() {
        WebElement btn = WaitUtils.waitForElementToBeClickable(driver, burgerMenuButton, 10);
        btn.click();
    }

    /**
     * Clicks the logout link in the side navigation.
     */
    public void clickLogout() {
        WebElement btn = WaitUtils.waitForElementToBeClickable(driver, logoutSidebarLink, 10);
        btn.click();
    }
}
