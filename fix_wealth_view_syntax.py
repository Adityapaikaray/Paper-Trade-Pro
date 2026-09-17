with open('src/components/WealthView.tsx', 'r') as f:
    content = f.read()

# Revert the bad replacement
content = content.replace("<TrendingUp, ArrowUpRight", "<TrendingUp")

# Fix the import properly this time
if "ArrowUpRight" not in content[:300]:
    content = content.replace("TrendingUp,", "TrendingUp, ArrowUpRight,")

with open('src/components/WealthView.tsx', 'w') as f:
    f.write(content)
