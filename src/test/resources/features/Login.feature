@login
Feature: SauceDemo Login Functionality

  @smoke @sanity @regression
  Scenario: Successful Login with Valid Credentials
    Given I read login data for "standard_user" from CSV
    When I enter credentials and submit
    Then I should be navigated to the product dashboard

  @regression
  Scenario: Locked Out User Login Blocked
    Given I read login data for "locked_out_user" from CSV
    When I enter credentials and submit
    Then I should see the locked out user error message

  @regression
  Scenario: Fail Login with Invalid Credentials
    Given I read login data for "invalid_user" from CSV
    When I enter credentials and submit
    Then I should see the credentials mismatch error message

  @regression
  Scenario: Login Fails with Empty Username
    Given I read login data for empty username from CSV
    When I enter credentials and submit
    Then I should see the empty username error message

  @regression
  Scenario: Login Fails with Empty Password
    Given I read login data for empty password from CSV
    When I enter credentials and submit
    Then I should see the empty password error message
