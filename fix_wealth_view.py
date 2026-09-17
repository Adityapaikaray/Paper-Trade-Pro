with open('src/components/WealthView.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if "{/* GOAL DETAILS FLOW */}" in line and i > 500:
        skip = True
    
    if skip and "</AnimatePresence>" in line:
        skip = False
        
    if not skip:
        new_lines.append(line)

with open('src/components/WealthView.tsx', 'w') as f:
    f.writelines(new_lines)
