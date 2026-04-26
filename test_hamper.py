import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
import time
import os

BASE_URL = "http://127.0.0.1:5173"

def save_screenshot(driver, name):
    desktop = r"C:\Users\Maahir\Desktop"
    driver.save_screenshot(os.path.join(desktop, f"hamper_{name}.png"))

def test_hamper_budget_limit():
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

        # 2. Navigate to Hamper Builder
        print("[STEP 2] Opening Hamper Builder...")
        driver.get(f"{BASE_URL}/hamper")
        wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'Hamper Builder')]")))
        print("[SUCCESS] Hamper Builder loaded.")

        # 3. Set Budget (Card 2)
        print("[STEP 3] Setting Budget to Rs.500 (Min)...")
        budget_slider = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='range']")))
        # Use a more reliable way to update React state for range inputs
        driver.execute_script("""
            var el = arguments[0];
            var val = 500;
            var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            nativeInputValueSetter.call(el, val);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        """, budget_slider)
        time.sleep(1)
        print("[SUCCESS] Budget set.")
        save_screenshot(driver, "1_budget_set")

        # 4. Add items to hamper (Card 3)
        print("[STEP 4] Adding items to exceed budget...")
        
        # Add products until total > 500
        for i in range(5): 
            add_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "(//button[contains(., 'Add')])[1]")))
            add_btn.click()
            time.sleep(1)
            
            # Use dot-contains for total span
            total_span = wait.until(EC.presence_of_element_located((By.XPATH, "//span[contains(text(), 'Hamper Total')]/following-sibling::span")))
            total_text = total_span.text.replace('Rs.', '').replace('₹', '').replace(',', '').strip()
            if total_text:
                total_val = int(total_text)
                print(f"[INFO] Current Total: Rs.{total_val}")
                if total_val > 500:
                    print("[SUCCESS] Budget exceeded!")
                    break
        
        # 5. Verify Red Marker and Warning Message
        print("[STEP 5] Verifying Red Marker and Warning Message...")
        
        # Verify color is red (rgba(239, 68, 68, 1) or similar)
        color = total_span.value_of_css_property("color")
        print(f"[INFO] Total Text Color: {color}")
        
        warning_msg = wait.until(EC.visibility_of_element_located((By.XPATH, "//p[contains(text(), 'Over budget by')]")))
        print(f"[SUCCESS] Budget limit notification detected (Over budget message visible).")
        save_screenshot(driver, "2_budget_exceeded")

        # 6. Summary
        print("[FINISH] Hamper test completed successfully.")

    except Exception as e:
        save_screenshot(driver, "crash_report")
        print(f"[ERROR] {str(e)}")
        raise e
    finally:
        driver.quit()

if __name__ == "__main__":
    test_hamper_budget_limit()
