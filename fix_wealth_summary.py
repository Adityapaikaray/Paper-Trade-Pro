with open('src/components/WealthView.tsx', 'r') as f:
    content = f.read()

content = content.replace('summary.totalReturn', 'summary.totalGain')
content = content.replace('summary.investedAmount', 'summary.investedValue')

# Let's also check if formatCurrency handles undefined gracefully, just in case
content = content.replace('const formatCurrency = (val: number, maxDigits = 2) => {', 'const formatCurrency = (val: number = 0, maxDigits = 2) => {')
content = content.replace('const formatCompactCurrency = (val: number) => {', 'const formatCompactCurrency = (val: number = 0) => {')

with open('src/components/WealthView.tsx', 'w') as f:
    f.write(content)

