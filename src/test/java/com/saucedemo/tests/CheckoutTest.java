package com.saucedemo.tests;

import com.saucedemo.base.BaseTest;
import com.saucedemo.pages.*;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.List;

/**
 * CheckoutTest verifies the checkout workflows, including happy path and field validations.
 */
public class CheckoutTest extends BaseTest {
    private LoginPage loginPage;
    private InventoryPage inventoryPage;
    private CartPage cartPage;
    private CheckoutStepOnePage checkoutStepOnePage;

    @BeforeMethod(alwaysRun = true)
    public void setupCheckoutState() {
        loginPage = new LoginPage(getDriver());
        loginPage.login("standard_user", "secret_sauce");
        
        inventoryPage = new InventoryPage(getDriver());
        inventoryPage.addItemToCart("Sauce Labs Backpack");
        inventoryPage.addItemToCart("Sauce Labs Bike Light");
        
        inventoryPage.clickCart();
        
        cartPage = new CartPage(getDriver());
        Assert.assertTrue(cartPage.isCartPageDisplayed(), "FAILED: Did not navigate to Cart page.");
        
        cartPage.clickCheckout();
        
        checkoutStepOnePage = new CheckoutStepOnePage(getDriver());
        Assert.assertTrue(checkoutStepOnePage.isPageDisplayed(), "FAILED: Did not navigate to Checkout Step One page.");
    }

    @Test(priority = 1, groups = {"smoke", "checkout"}, description = "Verify successful checkout flow up to order overview step")
    public void testSuccessfulCheckoutOverview() {
        // Fill correct info and continue
        checkoutStepOnePage.fillInformation("John", "Doe", "12345");
        
        CheckoutStepTwoPage checkoutStepTwoPage = new CheckoutStepTwoPage(getDriver());
        Assert.assertTrue(checkoutStepTwoPage.isPageDisplayed(), "FAILED: Did not navigate to Checkout Step Two (Overview) page.");
        
        // Validate overview items
        List<String> items = checkoutStepTwoPage.getItemNames();
        Assert.assertTrue(items.contains("Sauce Labs Backpack"), "FAILED: Overview missing Sauce Labs Backpack.");
        Assert.assertTrue(items.contains("Sauce Labs Bike Light"), "FAILED: Overview missing Sauce Labs Bike Light.");
        
        // Validate pricing is displayed
        String total = checkoutStepTwoPage.getTotalPriceString();
        Assert.assertTrue(total.contains("Total:"), "FAILED: Overview did not display final price total.");
    }

    @Test(priority = 2, groups = {"regression", "checkout"}, description = "Verify error message when First Name is empty")
    public void testEmptyFirstNameCheckoutError() {
        checkoutStepOnePage.fillInformation("", "Doe", "12345");
        
        String expectedError = "Error: First Name is required";
        Assert.assertEquals(checkoutStepOnePage.getErrorMessage(), expectedError, "FAILED: Error mismatch for empty First Name.");
    }

    @Test(priority = 3, groups = {"regression", "checkout"}, description = "Verify error message when Last Name is empty")
    public void testEmptyLastNameCheckoutError() {
        checkoutStepOnePage.fillInformation("John", "", "12345");
        
        String expectedError = "Error: Last Name is required";
        Assert.assertEquals(checkoutStepOnePage.getErrorMessage(), expectedError, "FAILED: Error mismatch for empty Last Name.");
    }

    @Test(priority = 4, groups = {"regression", "checkout"}, description = "Verify error message when Postal Code is empty")
    public void testEmptyPostalCodeCheckoutError() {
        checkoutStepOnePage.fillInformation("John", "Doe", "");
        
        String expectedError = "Error: Postal Code is required";
        Assert.assertEquals(checkoutStepOnePage.getErrorMessage(), expectedError, "FAILED: Error mismatch for empty Postal Code.");
    }
}
