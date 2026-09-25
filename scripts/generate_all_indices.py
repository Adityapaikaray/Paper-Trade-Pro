#!/usr/bin/env python3
import json
import os
import random

OUT_DIR = "/src/data/indices/constituents"
os.makedirs(OUT_DIR, exist_ok=True)

# Fixed seed for deterministic, realistic baseline prices
random.seed(42)

def fmt_cap(val_b, curr='$'):
    if curr == '$':
        if val_b >= 1000:
            return f"${val_b/1000:.2f}T"
        return f"${val_b:.1f}B"
    else: # INR
        # val_b in Billion INR -> in Lakh Cr / Cr
        # 1T INR = 1000B INR = 1 Lakh Crore
        # e.g. 20000B = 20.0T
        if val_b >= 1000:
            return f"₹{val_b/1000:.1f}T"
        return f"₹{val_b:.1f}B"

def build_constituent(rank, symbol, name, sector, weight, price, cap_b, curr='$', exchange='NASDAQ'):
    chg_pct = round(random.uniform(-2.8, 3.2), 2)
    change = round(price * (chg_pct / 100.0), 2)
    vol_m = round(random.uniform(1.2, 45.0), 1)
    day_high = round(price + abs(change) * random.uniform(0.5, 1.2), 2)
    day_low = round(price - abs(change) * random.uniform(0.5, 1.2), 2)
    prev_close = round(price - change, 2)
    return {
        "rank": rank,
        "symbol": symbol,
        "name": name,
        "sector": sector,
        "weight": round(weight, 3),
        "price": price,
        "change": change,
        "changePercent": chg_pct,
        "volume": f"{vol_m}M",
        "marketCap": fmt_cap(cap_b, curr),
        "dayHigh": day_high,
        "dayLow": day_low,
        "prevClose": prev_close,
        "exchange": exchange,
        "marketStatus": "REGULAR"
    }

print("Generator script created.")
