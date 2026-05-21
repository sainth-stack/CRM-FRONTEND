import json

path = r"C:\Users\vinay\.gemini\antigravity\brain\6855932a-0ff2-4582-a260-9777a2eb05db\.system_generated\logs\transcript.jsonl"
with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

data = json.loads(lines[801])
print("Step 801 Content:")
print(data.get("content"))
