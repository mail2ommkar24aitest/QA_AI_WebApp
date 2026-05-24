@e2e
Feature: SauceDemo Complete End to End Flow

  @smoke @regression @sanity
  Scenario: Complete End to End Purchase Flow
    Given I read login data for "standard_user" from CSV
    And I enter credentials and submit
    Then I should be navigated to the product dashboard
    When I add "Sauce Labs Backpack" to the cart and navigate to checkout
    And I read checkout data for row index 0 from CSV
    And I fill step one checkout form and continue
    Then I should be navigated to step two checkout overview page
    And I click finish
    Then I should be navigated to the order completion landing page
    And the order confirmation success message should be displayed

  @smoke @regression
  Scenario: Logout After Purchase Flow
    Given I read login data for "standard_user" from CSV
    And I enter credentials and submit
    Then I should be navigated to the product dashboard
    When I add "Sauce Labs Backpack" to the cart and navigate to checkout
    And I read checkout data for row index 0 from CSV
    And I fill step one checkout form and continue
    Then I should be navigated to step two checkout overview page
    And I click finish
    Then I should be navigated to the order completion landing page
    And the order confirmation success message should be displayed
    When I log out
    Then the logout should navigate to the home page
