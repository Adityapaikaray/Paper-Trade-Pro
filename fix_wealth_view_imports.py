with open('src/components/WealthView.tsx', 'r') as f:
    content = f.read()

# Add ArrowUpRight to lucide-react imports if it's missing
if 'ArrowUpRight' not in content[:1000]:
    content = content.replace("import {\n  TrendingUp,\n  TrendingDown,", "import {\n  TrendingUp,\n  TrendingDown,\n  ArrowUpRight,")
    # If the above string isn't exact, just inject it
    if "import {\n  TrendingUp,\n  TrendingDown,\n  ArrowUpRight," not in content:
        content = content.replace("TrendingUp", "TrendingUp, ArrowUpRight")

with open('src/components/WealthView.tsx', 'w') as f:
    f.write(content)
