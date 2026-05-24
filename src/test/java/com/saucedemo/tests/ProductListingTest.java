package com.saucedemo.tests;

import com.saucedemo.base.BaseTest;
import com.saucedemo.pages.InventoryPage;
import com.saucedemo.pages.LoginPage;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * ProductListingTest automates the product list validations, sorting options,
 * and cart actions (add/remove/badge count updates).
 */
public class ProductListingTest extends BaseTest {
    private LoginPage loginPage;
    private InventoryPage inventoryPage;

    @BeforeMethod(alwaysRun = true)
    public void performPreLogin() {
        loginPage = new LoginPage(getDriver());
        loginPage.login("standard_user", "secret_sauce");
        inventoryPage = new InventoryPage(getDriver());
        Assert.assertTrue(inventoryPage.isInventoryPageDisplayed(), "Pre-login failed. Inventory page not displayed.");
    }

    @Test(priority = 1, groups = {"smoke", "products"}, description = "Verify that products are visible on the dashboard")
    public void testProductVisibility() {
        List<String> products = inventoryPage.getProductNames();
        Assert.assertFalse(products.isEmpty(), "FAILED: No products are displayed on the inventory page!");
        Assert.assertTrue(products.contains("Sauce Labs Backpack"), "FAILED: Default product 'Sauce Labs Backpack' not found.");
    }

    @Test(priority = 2, groups = {"smoke", "products"}, description = "Verify dynamic updates to cart count when adding/removing items")
    public void testCartOperationsDynamicUpdates() {
        // Initial state: cart should be empty
        Assert.assertEquals(inventoryPage.getCartCount(), 0, "FAILED: Cart count should initially be 0.");

        // Add 1st item
        inventoryPage.addItemToCart("Sauce Labs Backpack");
        Assert.assertEquals(inventoryPage.getCartCount(), 1, "FAILED: Cart count did not update to 1 after adding an item.");

        // Add 2nd item
        inventoryPage.addItemToCart("Sauce Labs Bolt T-Shirt");
        Assert.assertEquals(inventoryPage.getCartCount(), 2, "FAILED: Cart count did not update to 2 after adding another item.");

        // Remove 1 item
        inventoryPage.removeItemFromCart("Sauce Labs Backpack");
        Assert.assertEquals(inventoryPage.getCartCount(), 1, "FAILED: Cart count did not decrease to 1 after removing an item.");
    }

    @Test(priority = 3, groups = {"regression", "products"}, description = "Verify product sorting by Name A to Z")
    public void testSortingNameAZ() {
        inventoryPage.selectSortOption("Name (A to Z)");
        List<String> actualNames = inventoryPage.getProductNames();
        
        List<String> expectedNames = new ArrayList<>(actualNames);
        Collections.sort(expectedNames);
        
        Assert.assertEquals(actualNames, expectedNames, "FAILED: Product names are not sorted alphabetically (A to Z)!");
    }

    @Test(priority = 4, groups = {"regression", "products"}, description = "Verify product sorting by Name Z to A")
    public void testSortingNameZA() {
        inventoryPage.selectSortOption("Name (Z to A)");
        List<String> actualNames = inventoryPage.getProductNames();
        
        List<String> expectedNames = new ArrayList<>(actualNames);
        Collections.sort(expectedNames, Collections.reverseOrder());
        
        Assert.assertEquals(actualNames, expectedNames, "FAILED: Product names are not sorted alphabetically (Z to A)!");
    }

    @Test(priority = 5, groups = {"regression", "products"}, description = "Verify product sorting by Price Low to High")
    public void testSortingPriceLowToHigh() {
        inventoryPage.selectSortOption("Price (low to high)");
        List<Double> actualPrices = inventoryPage.getProductPrices();
        
        List<Double> expectedPrices = new ArrayList<>(actualPrices);
        Collections.sort(expectedPrices);
        
        Assert.assertEquals(actualPrices, expectedPrices, "FAILED: Product prices are not sorted from Low to High!");
    }

    @Test(priority = 6, groups = {"regression", "products"}, description = "Verify product sorting by Price High to Low")
    public void testSortingPriceHighToLow() {
        inventoryPage.selectSortOption("Price (high to low)");
        List<Double> actualPrices = inventoryPage.getProductPrices();
        
        List<Double> expectedPrices = new ArrayList<>(actualPrices);
        Collections.sort(expectedPrices, Collections.reverseOrder());
        
        Assert.assertEquals(actualPrices, expectedPrices, "FAILED: Product prices are not sorted from High to Low!");
    }
}
