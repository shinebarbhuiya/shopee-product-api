import undetected_chromedriver as uc
import json
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from fastapi import FastAPI, HTTPException
import uvicorn

app = FastAPI()

def get_shopee_data(url: str):
    # Configure Chrome options
    options = uc.ChromeOptions()
    extension_path = "/home/shine/Desktop/MrScraper_Task/extensions"
    options.add_argument(f'--load-extension={extension_path}')
    
    # Initialize response data
    response_data = None
    driver = None
    
    try:
        # Initialize the driver with CDP enabled
        driver = uc.Chrome(
            headless=False,
            use_subprocess=False,
            options=options,
            enable_cdp_events=True
        )
        
        # Enable network monitoring
        driver.execute_cdp_cmd('Network.enable', {})
        
        # Create an event to signal when we've received the data
        data_received = {"value": False, "data": None}
        
        def handle_network_event(message):
            if message.get('method') == 'Network.responseReceived':
                response = message.get('params', {}).get('response', {})
                url = response.get('url', '')
                request_id = message.get('params', {}).get('requestId')
                
                if 'api/v4/pdp/get_pc?' in url:
                    try:
                        # Get response body
                        response_body = driver.execute_cdp_cmd('Network.getResponseBody', {'requestId': request_id})
                        response_data = json.loads(response_body.get('body', '{}'))
                        data_received["value"] = True
                        data_received["data"] = response_data
                    except Exception as e:
                        print(f"Error getting response body: {e}")
        
        # Add network listener
        driver.add_cdp_listener('Network.responseReceived', handle_network_event)
        
        # Wait for extension to be properly loaded
        time.sleep(2)
        
        # Close extension tabs
        for handle in driver.window_handles:
            driver.switch_to.window(handle)
            if "inreview.vn" in driver.current_url:
                driver.close()
                break
        
        # Switch back to main window
        driver.switch_to.window(driver.window_handles[0])
        
        # Navigate to Shopee
        print(f"Navigating to Shopee page: {url}")
        driver.get(url)
        
        # Wait for maximum 30 seconds to receive the data
        start_time = time.time()
        while not data_received["value"] and time.time() - start_time < 30:
            time.sleep(0.5)
        
        if data_received["value"]:
            response_data = data_received["data"]
            # Only close if we got a valid response with error_msg: null
            if isinstance(response_data, dict) and "error_msg" in response_data and response_data["error_msg"] is None:
                driver.quit()
                driver = None
                return response_data
            else:
                # Keep browser open for error responses
                return response_data
        
        raise HTTPException(status_code=404, detail="Failed to get product data")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        if driver and response_data and isinstance(response_data, dict) and "error_msg" in response_data and response_data["error_msg"] is None:
            try:
                driver.quit()
            except:
                pass

@app.get("/shopee/product")
async def get_product(url: str):
    """
    Get product data from Shopee URL
    
    Parameters:
    - url: Shopee product URL (e.g., https://shopee.tw/---i.31188538.19323502897)
    
    Returns:
    - JSON response with product data
    """
    return get_shopee_data(url)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 