package com.saucedemo.tests;

import com.saucedemo.base.BaseTest;
import com.saucedemo.pages.InventoryPage;
import com.saucedemo.pages.LoginPage;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * LoginTest contains automated test cases for the SauceDemo Login Module.
 * Includes happy path (valid login), negative scenarios (invalid credentials, locked out), and field validations.
 */
public class LoginTest extends BaseTest {

    @Test(priority = 1, groups = {"smoke", "login"}, description = "Verify successful login with valid credentials")
    public void testValidLogin() {
        LoginPage loginPage = new LoginPage(getDriver());
        
        // Log in using valid credentials
        loginPage.login("standard_user", "secret_sauce");
        
        // Verify inventory page is displayed
        InventoryPage inventoryPage = new InventoryPage(getDriver());
        Assert.assertTrue(inventoryPage.isInventoryPageDisplayed(), 
                "FAILED: Inventory landing page was not displayed after entering valid credentials.");
    }

    @Test(priority = 2, groups = {"regression", "login"}, description = "Verify login is blocked for locked out users")
    public void testLockedOutUserLogin() {
        LoginPage loginPage = new LoginPage(getDriver());
        
        // Log in using locked_out_user
        loginPage.login("locked_out_user", "secret_sauce");
        
        // Verify locked out error message is displayed
        String expectedError = "Epic sadface: Sorry, this user has been locked out.";
        String actualError = loginPage.getErrorMessage();
        
        Assert.assertEquals(actualError, expectedError, 
                "FAILED: Expected locked out error message did not match.");
    }

    @Test(priority = 3, groups = {"regression", "login"}, description = "Verify login fails with invalid credentials")
    public void testInvalidLogin() {
        LoginPage loginPage = new LoginPage(getDriver());
        
        // Log in with non-existent credentials
        loginPage.login("invalid_user", "invalid_password");
        
        // Verify mismatch error message
        String expectedError = "Epic sadface: Username and password do not match any user in this service";
        String actualError = loginPage.getErrorMessage();
        
        Assert.assertEquals(actualError, expectedError, 
                "FAILED: Expected mismatch error message did not match.");
    }

    @Test(priority = 4, groups = {"regression", "login"}, description = "Verify validation error when username is empty")
    public void testEmptyUsernameLogin() {
        LoginPage loginPage = new LoginPage(getDriver());
        
        // Login with username field empty
        loginPage.login("", "secret_sauce");
        
        // Verify username required error message
        String expectedError = "Epic sadface: Username is required";
        String actualError = loginPage.getErrorMessage();
        
        Assert.assertEquals(actualError, expectedError, 
                "FAILED: Expected username required error did not match.");
    }

    @Test(priority = 5, groups = {"regression", "login"}, description = "Verify validation error when password is empty")
    public void testEmptyPasswordLogin() {
        LoginPage loginPage = new LoginPage(getDriver());
        
        // Login with password field empty
        loginPage.login("standard_user", "");
        
        // Verify password required error message
        String expectedError = "Epic sadface: Password is required";
        String actualError = loginPage.getErrorMessage();
        
        Assert.assertEquals(actualError, expectedError, 
                "FAILED: Expected password required error did not match.");
    }
}
