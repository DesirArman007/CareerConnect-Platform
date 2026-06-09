import json
import subprocess
import time
import os
import sys

def run_all_scrapers():
    # Path to your config file
    config_path = os.path.join('config', 'companies.json')    
    # Check if config exists
    if not os.path.exists(config_path):
        print(f"❌ Error: {config_path} not found!")
        return

    # Load Config
    try:
        with open(config_path, 'r') as f:
            config = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing config.json: {e}")
        return

    companies = config.get('companies', [])
    enabled_companies = [c for c in companies if c.get('enabled', False)]
    
    print(f"🚀 Found {len(companies)} companies ({len(enabled_companies)} enabled).")
    print("Starting batch execution...")
    time.sleep(1)

    # Iterate through companies
    for index, company in enumerate(enabled_companies, 1):
        name = company.get('name')
        
        # Skip scrapers that require supervision (run via run_manual_scrapers.py)
        if company.get('requires_supervision', False) is True:
            print(f"[{index}/{len(enabled_companies)}] ⏩ Skipping {name} (Requires supervision. Use run_manual_scrapers.py)")
            continue
            
        
        print(f"\n[{index}/{len(enabled_companies)}] {'='*30}")
        print(f"  ▶️  Running Scraper for: {name}")
        print(f"{'='*35}")

        # Construct the command
        # sys.executable ensures we use the current Python (virtualenv)
        cmd = [sys.executable, "main.py", "--mode", "single", "--company", name, "--workers", "1"]

        try:
            # Execute the command and wait for it to finish
            result = subprocess.run(cmd, check=False)
            
            if result.returncode == 0:
                print(f"  ✅ Finished: {name}")
            else:
                print(f"  ❌ Failed: {name} (Exit Code: {result.returncode})")

        except Exception as e:
            print(f"  ❌ System Error running {name}: {e}")

        # Small pause between runs to be safe
        time.sleep(2)

    print(f"\n{'='*35}")
    print("🎉 All Scrapers Completed!")
    print(f"{'='*35}")

if __name__ == "__main__":
    run_all_scrapers()