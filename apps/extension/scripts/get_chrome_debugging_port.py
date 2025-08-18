# scripts/get_debugging_port.py
import psutil
import re

def find_chrome_processes():
    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        if proc.info['name'] == 'chrome.exe' or proc.info['name'] == 'Google Chrome':
            for cmd_arg in proc.info['cmdline']:
                match = re.search(r'--remote-debugging-port=(\d+)', cmd_arg)
                if match:
                    port = match.group(1)
                    processes.append({'pid': proc.info['pid'], 'port': port})
    return processes

chrome_processes = find_chrome_processes()
if chrome_processes:
    print("Chrome processes with remote debugging ports:")
    for process in chrome_processes:
        print(f"PID: {process['pid']}, Port: {process['port']}")
else:
    print("No Chrome processes with remote debugging ports found.")