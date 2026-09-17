import re

with open('src/components/WealthView.tsx', 'r') as f:
    content = f.read()

# Let's count how many times "{step === 'DASHBOARD' && (" occurs
print("DASHBOARD count:", content.count("{step === 'DASHBOARD' && ("))
print("GOAL_DETAILS count:", content.count("{step === 'GOAL_DETAILS' && selectedGoal && ("))

