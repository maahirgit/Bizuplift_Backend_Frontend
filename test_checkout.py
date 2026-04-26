import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
import time
import os

BASE_URL = "http://127.0.0.1:5173"

def save_screenshot(driver, name):
    desktop = r"C:\Users\Maahir\Desktop"
    driver.save_screenshot(os.path.join(desktop, f"checkout_{name}.png"))

def test_full_checkout_flow():
    options = webdriver.ChromeOptions()
    driver = webdriver.Chrome(options=options)
    driver.maximize_window()
    wait = WebDriverWait(driver, 20)
    
    try:
        # 1. Login
        print("\n[STEP 1] Logging in...")
        driver.get(f"{BASE_URL}/auth")
        email_input = wait.until(EC.visibility_of_element_located((By.NAME, "email")))
        password_input = driver.find_element(By.XPATH, "//input[@placeholder='Password']")
        submit_btn = driver.find_element(By.XPATH, "//button[@type='submit']")
        email_input.send_keys("arjun@example.com")
        password_input.send_keys("password123")
        submit_btn.click()
        wait.until(lambda d: "/auth" not in d.current_url)
        print("[SUCCESS] Logged in.")

        # 2. Add product to cart
        print("[STEP 2] Adding product to cart...")
        driver.get(f"{BASE_URL}/marketplace")
        time.sleep(2)
        product_card = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[contains(@href, '/product/')]")))
        product_card.click()
        add_to_cart_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'ADD TO CART')]")))
        driver.execute_script("arguments[0].click();", add_to_cart_btn)
        print("[SUCCESS] Added to cart.")

        # 3. Test 20-item limit in CART
        print("[STEP 3] Testing 20-item limit in CART...")
        driver.get(f"{BASE_URL}/cart")
        time.sleep(1)
        
        # Robust selector for the plus button (the second button in the quantity controls)
        plus_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "(//div[contains(@class, 'flex items-center border')]//button)[2]")))
        
        # Click 22 times
        for i in range(22):
            plus_btn.click()
            time.sleep(0.1)
            
        # The quantity span is between the two buttons
        qty_val = wait.until(EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'flex items-center border')]//span")))
        print(f"[INFO] Final quantity in cart: {qty_val.text}")
        save_screenshot(driver, "3_cart_quantity_limit")
        assert qty_val.text == "20"

        # 4. Fill address form and do testing (Validation Error)
        print("[STEP 4] Testing Address Form Validation...")
        proceed_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Proceed to Checkout')]")))
        proceed_btn.click()
        
        wait.until(EC.url_contains("/checkout"))
        time.sleep(1)
        continue_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Continue to Payment')]")))
        continue_btn.click() # Click without filling
        
        error_toast = wait.until(EC.visibility_of_element_located((By.XPATH, "//p[contains(text(), 'Please fill all fields')]")))
        print(f"[SUCCESS] Error message caught: {error_toast.text}")
        save_screenshot(driver, "4_form_validation_error")

        # 5. Complete Order
        print("[STEP 5] Filling form and completing order...")
        name_input = wait.until(EC.visibility_of_element_located((By.XPATH, "//input[@placeholder='Arjun Mehta']")))
        phone_input = driver.find_element(By.XPATH, "//input[@placeholder='9876543210']")
        line1_input = driver.find_element(By.XPATH, "//input[@placeholder='42, Shanti Nagar']")
        city_input = driver.find_element(By.XPATH, "//input[@placeholder='Mumbai']")
        pincode_input = driver.find_element(By.XPATH, "//input[@placeholder='400001']")
        state_select = Select(driver.find_element(By.XPATH, "//select"))
        
        name_input.send_keys("Automated Tester")
        phone_input.send_keys("9999999999")
        line1_input.send_keys("123 Test Lane")
        city_input.send_keys("Mumbai")
        pincode_input.send_keys("400001")
        state_select.select_by_visible_text("Maharashtra")
        
        continue_btn.click()
        
        cod_radio = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@value='COD']")))
        driver.execute_script("arguments[0].click();", cod_radio)
        
        pay_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Pay ')]")))
        pay_btn.click()
        
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(text(), 'Thank you for your order!')]")))
        print("[SUCCESS] Order Placed Successfully!")
        save_screenshot(driver, "5_order_complete")

    except Exception as e:
        save_screenshot(driver, "crash_report")
        print(f"[ERROR] {str(e)}")
        raise e
    finally:
        driver.quit()

if __name__ == "__main__":
    test_full_checkout_flow()
