import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# --- Configuration ---
# Update this URL to wherever your frontend is running
BASE_URL = "http://localhost:5173/auth" 

@pytest.fixture
def driver():
    """Setup and teardown for the Selenium WebDriver."""
    # Using Chrome for this test. Make sure you have ChromeDriver installed.
    options = webdriver.ChromeOptions()
    # options.add_argument('--headless') # Uncomment to run in background
    driver = webdriver.Chrome(options=options)
    driver.maximize_window()
    yield driver
    driver.quit()

class TestLogin:
    
    def test_successful_login(self, driver):
        """Test #1: Valid Credentials Login"""
        driver.get(BASE_URL)
        wait = WebDriverWait(driver, 10)
        
        email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        password_input = driver.find_element(By.XPATH, "//input[@placeholder='Password']")
        submit_btn = driver.find_element(By.XPATH, "//button[@type='submit']")
        
        email_input.send_keys("arjun@example.com")
        password_input.send_keys("password123")
        time.sleep(1) # Small pause for visual effect
        driver.save_screenshot(r"c:\Users\Maahir\Desktop\1_before_successful_login.png")
        
        submit_btn.click()
        wait.until(EC.url_changes(BASE_URL))
        time.sleep(1) # Allow page to render
        driver.save_screenshot(r"c:\Users\Maahir\Desktop\1_after_successful_login.png")
        assert "/auth" not in driver.current_url

    def test_invalid_password(self, driver):
        """Test #2: Invalid Password Error"""
        driver.get(BASE_URL)
        wait = WebDriverWait(driver, 10)
        
        email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        password_input = driver.find_element(By.XPATH, "//input[@placeholder='Password']")
        submit_btn = driver.find_element(By.XPATH, "//button[@type='submit']")
        
        email_input.send_keys("arjun@example.com")
        password_input.send_keys("wrongpassword")
        submit_btn.click()
        
        error_msg = wait.until(EC.visibility_of_element_located((By.XPATH, "//div[contains(text(), 'Invalid email or password')]")))
        time.sleep(0.5)
        driver.save_screenshot(r"c:\Users\Maahir\Desktop\2_invalid_password_error.png")
        assert error_msg.is_displayed()

    def test_empty_fields_validation(self, driver):
        """Test #3: Empty Fields Validation"""
        driver.get(BASE_URL)
        wait = WebDriverWait(driver, 10)
        
        submit_btn = wait.until(EC.presence_of_element_located((By.XPATH, "//button[@type='submit']")))
        submit_btn.click()
        
        email_err = wait.until(EC.presence_of_element_located((By.XPATH, "//p[contains(text(), 'Valid email required')]")))
        pwd_err = wait.until(EC.presence_of_element_located((By.XPATH, "//p[contains(text(), 'Password required')]")))
        
        time.sleep(0.5)
        driver.save_screenshot(r"c:\Users\Maahir\Desktop\3_empty_fields_validation.png")
        assert email_err.is_displayed()
        assert pwd_err.is_displayed()

    def test_unregistered_email(self, driver):
        """Test #4: Unregistered Email Error"""
        driver.get(BASE_URL)
        wait = WebDriverWait(driver, 10)
        
        email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        password_input = driver.find_element(By.XPATH, "//input[@placeholder='Password']")
        submit_btn = driver.find_element(By.XPATH, "//button[@type='submit']")
        
        email_input.send_keys("nobody@bizuplift.com")
        password_input.send_keys("password123")
        submit_btn.click()
        
        error_msg = wait.until(EC.visibility_of_element_located((By.XPATH, "//div[contains(text(), 'Invalid email or password')]")))
        time.sleep(0.5)
        driver.save_screenshot(r"c:\Users\Maahir\Desktop\4_unregistered_email.png")
        assert error_msg.is_displayed()

    def test_password_visibility_toggle(self, driver):
        """Test #5: Password Visibility Toggle"""
        driver.get(BASE_URL)
        wait = WebDriverWait(driver, 10)
        
        password_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Password']")))
        password_input.send_keys("secret123")
        
        toggle_btn = driver.find_element(By.XPATH, "//input[@placeholder='Password']/following-sibling::button")
        toggle_btn.click()
        
        time.sleep(0.5)
        driver.save_screenshot(r"c:\Users\Maahir\Desktop\5_password_visibility_toggled.png")
        assert password_input.get_attribute("type") == "text"

    def test_switch_to_register_tab(self, driver):
        """Test #6: UI Tab Switching to Register"""
        driver.get(BASE_URL)
        wait = WebDriverWait(driver, 10)
        
        register_tab = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[span[text()='Register']]")))
        register_tab.click()
        
        name_input = wait.until(EC.visibility_of_element_located((By.NAME, "name")))
        time.sleep(0.5)
        driver.save_screenshot(r"c:\Users\Maahir\Desktop\6_register_tab.png")
        assert name_input.is_displayed()

if __name__ == "__main__":
    # If run directly instead of through pytest
    pytest.main(["-v", "test_login.py"])
