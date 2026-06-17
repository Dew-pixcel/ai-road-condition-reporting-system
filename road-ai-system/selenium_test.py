from selenium import webdriver
from selenium.webdriver.common.by import By
import time

driver = webdriver.Chrome()
driver.maximize_window()

try:
    # Open system
    driver.get("http://localhost:5173")
    time.sleep(2)

    # Example: check home page title/text
    print("Page opened successfully")

    # Go to report page manually by URL
    driver.get("http://localhost:5173/report")
    time.sleep(2)

    # Empty form validation test
    submit_button = driver.find_element(By.XPATH, "//button[contains(text(),'Submit Report')]")
    submit_button.click()
    time.sleep(2)

    alert = driver.switch_to.alert
    print("Validation message:", alert.text)
    alert.accept()

    print("Selenium validation test passed")

finally:
    time.sleep(2)
    driver.quit()
    