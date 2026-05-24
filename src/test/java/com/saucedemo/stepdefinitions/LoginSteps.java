package com.saucedemo.stepdefinitions;

import com.saucedemo.base.BaseTest;
import com.saucedemo.pages.LoginPage;
import com.saucedemo.pages.InventoryPage;
import com.saucedemo.utils.CsvUtils;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.testng.Assert;

import java.util.Map;

public class LoginSteps extends BaseTest {

    private LoginPage loginPage;
    private InventoryPage inventoryPage;
    private String username;
    private String password;

    /** Pauses execution briefly so the user can visually follow the test. */
    private void visualPause() {
        try { Thread.sleep(2500); } catch (InterruptedException ignored) {}
    }

    @Given("I read login data for {string} from CSV")
    public void iReadLoginDataForFromCSV(String userKey) {
        // Reads row from loginData.csv matching the username
        Map<String, String> row = CsvUtils.getRowByFilter("loginData.csv", "username", userKey);
        Assert.assertNotNull(row, "FAILED: Row not found in CSV for user key: " + userKey);
        
        this.username = row.get("username");
        this.password = row.get("password");
        
        loginPage = new LoginPage(getDriver());
        visualPause();
    }

    @Given("I read login data for empty username from CSV")
    public void iReadLoginDataForEmptyUsernameFromCSV() {
        // Reads row where username is empty/blank
        Map<String, String> row = CsvUtils.getRowByFilter("loginData.csv", "expectedStatus", "empty_username");
        Assert.assertNotNull(row, "FAILED: Row not found in CSV for expectedStatus 'empty_username'");
        
        this.username = row.get("username") == null ? "" : row.get("username");
        this.password = row.get("password");
        
        loginPage = new LoginPage(getDriver());
        visualPause();
    }

    @Given("I read login data for empty password from CSV")
    public void iReadLoginDataForEmptyPasswordFromCSV() {
        // Reads row where password is empty/blank
        Map<String, String> row = CsvUtils.getRowByFilter("loginData.csv", "expectedStatus", "empty_password");
        Assert.assertNotNull(row, "FAILED: Row not found in CSV for expectedStatus 'empty_password'");
        
        this.username = row.get("username");
        this.password = row.get("password") == null ? "" : row.get("password");
        
        loginPage = new LoginPage(getDriver());
        visualPause();
    }

    @When("I enter credentials and submit")
    public void iEnterCredentialsAndSubmit() {
        System.out.println("Logging in with Username: [" + username + "] | Password: [" + password + "]");
        loginPage.login(username, password);
        visualPause();
    }

    @Then("I should be navigated to the product dashboard")
    public void iShouldBeNavigatedToTheProductDashboard() {
        inventoryPage = new InventoryPage(getDriver());
        Assert.assertTrue(inventoryPage.isInventoryPageDisplayed(), 
                "FAILED: Product dashboard (inventory.html) was not displayed after login.");
        visualPause();
    }

    @Then("I should see the locked out user error message")
    public void iShouldSeeTheLockedOutUserErrorMessage() {
        String actualError = loginPage.getErrorMessage();
        System.out.println("Actual Error: " + actualError);
        Assert.assertTrue(actualError.contains("Sorry, this user has been locked out"), 
                "FAILED: Expected locked out error message, but got: " + actualError);
        visualPause();
    }

    @Then("I should see the credentials mismatch error message")
    public void iShouldSeeTheCredentialsMismatchErrorMessage() {
        String actualError = loginPage.getErrorMessage();
        System.out.println("Actual Error: " + actualError);
        Assert.assertTrue(actualError.contains("Username and password do not match any user"), 
                "FAILED: Expected credentials mismatch error message, but got: " + actualError);
        visualPause();
    }

    @Then("I should see the empty username error message")
    public void iShouldSeeTheEmptyUsernameErrorMessage() {
        String actualError = loginPage.getErrorMessage();
        System.out.println("Actual Error: " + actualError);
        Assert.assertTrue(actualError.contains("Username is required"), 
                "FAILED: Expected username required error message, but got: " + actualError);
        visualPause();
    }

    @Then("I should see the empty password error message")
    public void iShouldSeeTheEmptyPasswordErrorMessage() {
        String actualError = loginPage.getErrorMessage();
        System.out.println("Actual Error: " + actualError);
        Assert.assertTrue(actualError.contains("Password is required"), 
                "FAILED: Expected password required error message, but got: " + actualError);
        visualPause();
    }

    @When("I log out")
    public void iLogOut() {
        inventoryPage = new InventoryPage(getDriver());
        inventoryPage.clickMenu();
        visualPause();
        inventoryPage.clickLogout();
        visualPause();
    }

    @Then("I should be navigated back to the login page")
    public void iShouldBeNavigatedBackToTheLoginPage() {
        loginPage = new LoginPage(getDriver());
        Assert.assertTrue(loginPage.isLoginButtonDisplayed(), 
                "FAILED: Login page was not displayed after logout.");
        visualPause();
    }

    @Then("the logout should navigate to the home page")
    public void theLogoutShouldNavigateToTheHomePage() {
        // Intentionally wrong assertion to produce a FAIL in the report
        String currentUrl = getDriver().getCurrentUrl();
        System.out.println("Current URL after logout: " + currentUrl);
        Assert.assertTrue(currentUrl.contains("home.html"),
                "FAILED: Expected to land on home.html after logout, but current URL is: " + currentUrl);
    }
}

