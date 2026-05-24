package com.saucedemo.tests;

import com.saucedemo.base.BaseTest;
import com.saucedemo.pages.*;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * OrderConfirmationTest validates the final order placement landing page.
 * It asserts that the receipt screen loads successfully and displays the correct success headers and graphics.
 */
public class OrderConfirmationTest extends BaseTest {

    @Test(groups = {"smoke", "order"}, description = "Verify complete order flow and confirmation UI assets")
    public void testOrderConfirmationSuccess() {
        // Step 1: Login
        LoginPage loginPage = new LoginPage(getDriver());
        loginPage.login("standard_user", "secret_sauce");
        
        // Step 2: Add product and click cart
        InventoryPage inventoryPage = new InventoryPage(getDriver());
        inventoryPage.addItemToCart("Sauce Labs Backpack");
        inventoryPage.clickCart();
        
        // Step 3: Go to checkout
        CartPage cartPage = new CartPage(getDriver());
        cartPage.clickCheckout();
        
        // Step 4: Fill step 1 information
        CheckoutStepOnePage stepOne = new CheckoutStepOnePage(getDriver());
        stepOne.fillInformation("Jane", "Smith", "90210");
        
        // Step 5: Finish order on step 2
        CheckoutStepTwoPage stepTwo = new CheckoutStepTwoPage(getDriver());
        Assert.assertTrue(stepTwo.isPageDisplayed(), "FAILED: Did not load checkout overview.");
        stepTwo.clickFinish();
        
        // Step 6: Validate order completion landing page
        CheckoutCompletePage completePage = new CheckoutCompletePage(getDriver());
        Assert.assertTrue(completePage.isPageDisplayed(), "FAILED: Did not navigate to Checkout Complete landing page.");
        
        // Verify success header
        String expectedHeader = "Thank you for your order!";
        String actualHeader = completePage.getConfirmationHeader();
        Assert.assertEquals(actualHeader, expectedHeader, "FAILED: Confirmation header mismatch.");
        
        // Verify Pony Express graphic is loaded and displayed correctly
        Assert.assertTrue(completePage.isPonyExpressImageDisplayed(), "FAILED: Pony Express graphics did not load correctly on UI.");
        
        // Verify we can navigate back to the product dashboard successfully
        completePage.clickBackHome();
        Assert.assertTrue(inventoryPage.isInventoryPageDisplayed(), "FAILED: Back Home button did not return user to product dashboard.");
    }
}
