import os
import time
import subprocess

TARGET_APPS = set(range(66, 91))
PROCESSED_APPS = set()

print(f"Waiting for {len(TARGET_APPS)} apps to finish building...")

# First, wait for all agents to finish their initial build
while len(PROCESSED_APPS) < len(TARGET_APPS):
    for app_id in TARGET_APPS - PROCESSED_APPS:
        app_dir = f"/Users/nall/dev/brighton/examples/app-{app_id}"
        dist_dir = f"{app_dir}/dist"
        
        # We consider the app finished when dist/ is generated
        if os.path.exists(dist_dir):
            print(f"App {app_id} finished initial build!")
            PROCESSED_APPS.add(app_id)
            
    if len(PROCESSED_APPS) < len(TARGET_APPS):
        time.sleep(5)

print("All apps built by agents! Running global post-processing...")

try:
    # 1. Run fix_layout.cjs on all apps globally
    subprocess.run(["node", "fix_layout.cjs"], cwd="/Users/nall/dev/brighton", check=True)
    
    # 2. Run update_metadata.py on all apps globally
    subprocess.run(["python3", "update_metadata.py"], cwd="/Users/nall/dev/brighton", check=True)
    
    # 3. Rebuild all target apps and copy to public
    for app_id in TARGET_APPS:
        app_dir = f"/Users/nall/dev/brighton/examples/app-{app_id}"
        dist_dir = f"{app_dir}/dist"
        pub_dir = f"/Users/nall/dev/brighton/public/examples/app-{app_id}"
        
        print(f"Rebuilding app-{app_id} with updated wrapper...")
        subprocess.run(["npm", "run", "build"], cwd=app_dir, check=True)
        
        print(f"Copying app-{app_id} to public...")
        subprocess.run(["mkdir", "-p", pub_dir], check=True)
        subprocess.run(f"cp -r {dist_dir}/* {pub_dir}/", shell=True, check=True)
        
    print("All target apps copied to public!")
    
    # 4. Rebuild the root showcase app
    print("Rebuilding showcase root...")
    subprocess.run(["npm", "run", "build"], cwd="/Users/nall/dev/brighton", check=True)
    
    print("COMPLETED ALL POST-PROCESSING!")
except Exception as e:
    print(f"FATAL ERROR during post-processing: {e}")
