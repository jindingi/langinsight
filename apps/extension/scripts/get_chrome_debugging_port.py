# scripts/get_debugging_port.py
import psutil
import re
import json
import os

# Define ANSI color codes
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    ENDC = '\033[0m'

def find_chrome_debugging_port():
    """Finds the remote debugging port of a running Chrome process."""
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            if proc.info['name'] in ['chrome.exe', 'Google Chrome']:
                for cmd_arg in proc.info['cmdline']:
                    match = re.search(r'--remote-debugging-port=(\d+)', cmd_arg)
                    if match:
                        return match.group(1)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    return None

def update_launch_json_port(port):
    """Updates the port number in the launch.json file using the current working directory."""
    launch_json_path = os.path.join(os.getcwd(), '.vscode', 'launch.json')
    
    if not os.path.exists(launch_json_path):
        print(f"{Colors.RED}Error: launch.json not found at {launch_json_path}{Colors.ENDC}")
        return

    with open(launch_json_path, 'r+', encoding='utf-8') as f:
        content = f.read()
        
        pattern = re.compile(r'("port"\s*:\s*)(\d+)(.*,)')
        
        if pattern.search(content):
            new_content = pattern.sub(rf'\g<1>{port}\g<3>', content, 1)
            
            f.seek(0)
            f.truncate()
            f.write(new_content)
            print(f"{Colors.GREEN}Successfully updated Chrome debug port in launch.json to: {port} 🎉{Colors.ENDC}")
        else:
            print(f"{Colors.RED}Error: 'port' configuration not found in launch.json.{Colors.ENDC}")

if __name__ == '__main__':
    chrome_port = find_chrome_debugging_port()
    if chrome_port:
        update_launch_json_port(chrome_port)
    else:
        print("No Chrome process with a remote debugging port was found.")