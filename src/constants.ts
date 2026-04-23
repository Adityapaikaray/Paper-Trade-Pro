/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Stock } from './types.ts';

export const INITIAL_BALANCES = {
  '$': 100000,
  '₹': 1000000
};

export const MOCK_STOCKS: Stock[] = [
  // NASDAQ 100 Components (Selection)
  { symbol: 'AAPL', name: 'Apple Inc.', price: 185.92, change: 1.25, changePercent: 0.68, volume: '52.4M', marketCap: '2.89T', description: 'Tech leader.', sector: 'Technology', country: 'USA', currency: '$' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 405.18, change: 2.34, changePercent: 0.58, volume: '22.1M', marketCap: '3.01T', description: 'Software giant.', sector: 'Technology', country: 'USA', currency: '$' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 147.22, change: -1.15, changePercent: -0.77, volume: '28.4M', marketCap: '1.85T', description: 'Search & Cloud.', sector: 'Communication Services', country: 'USA', currency: '$' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 168.31, change: 0.85, changePercent: 0.51, volume: '38.5M', marketCap: '1.74T', description: 'E-commerce & Cloud.', sector: 'Consumer Cyclical', country: 'USA', currency: '$' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 726.13, change: 15.40, changePercent: 2.17, volume: '42.8M', marketCap: '1.79T', description: 'AI hardware.', sector: 'Technology', country: 'USA', currency: '$' },
  { symbol: 'META', name: 'Meta Platforms', price: 473.32, change: 5.21, changePercent: 1.11, volume: '18.9M', marketCap: '1.21T', description: 'Social Media.', sector: 'Communication Services', country: 'USA', currency: '$' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 238.45, change: -4.12, changePercent: -1.70, volume: '115.2M', marketCap: '758.4B', description: 'EV pioneer.', sector: 'Consumer Cyclical', country: 'USA', currency: '$' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', price: 1245.12, change: 12.45, changePercent: 1.01, volume: '2.1M', marketCap: '578.4B', description: 'Semiconductors.', sector: 'Technology', country: 'USA', currency: '$' },
  { symbol: 'COST', name: 'Costco Wholesale', price: 725.10, change: 3.20, changePercent: 0.44, volume: '1.8M', marketCap: '321.4B', description: 'Retail leader.', sector: 'Consumer Defensive', country: 'USA', currency: '$' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', price: 168.45, change: -0.15, changePercent: -0.09, volume: '4.5M', marketCap: '231.2B', description: 'Beverages & Snacks.', sector: 'Consumer Defensive', country: 'USA', currency: '$' },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 585.12, change: 8.45, changePercent: 1.46, volume: '3.2M', marketCap: '254.1B', description: 'Streaming giant.', sector: 'Communication Services', country: 'USA', currency: '$' },
  { symbol: 'ADBE', name: 'Adobe Inc.', price: 595.20, change: 2.15, changePercent: 0.36, volume: '2.4M', marketCap: '268.4B', description: 'Creative software.', sector: 'Technology', country: 'USA', currency: '$' },
  { symbol: 'CSCO', name: 'Cisco Systems', price: 48.92, change: -0.12, changePercent: -0.24, volume: '15.4M', marketCap: '198.4B', description: 'Networking.', sector: 'Technology', country: 'USA', currency: '$' },
  { symbol: 'INTC', name: 'Intel Corp.', price: 43.12, change: -0.45, changePercent: -1.03, volume: '32.4M', marketCap: '182.1B', description: 'Semiconductors.', sector: 'Technology', country: 'USA', currency: '$' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', price: 175.45, change: 4.12, changePercent: 2.41, volume: '58.4M', marketCap: '283.4B', description: 'Semiconductors.', sector: 'Technology', country: 'USA', currency: '$' },
  { symbol: 'QCOM', name: 'Qualcomm Inc.', price: 172.90, change: 1.20, changePercent: 0.70, volume: '12.4M', marketCap: '192.1B', description: 'Mobile tech.', sector: 'Technology', country: 'USA', currency: '$' },
  { symbol: 'TXN', name: 'Texas Instruments', price: 168.40, change: -0.50, changePercent: -0.30, volume: '5.4M', marketCap: '152.1B', description: 'Analog chips.', sector: 'Technology', country: 'USA', currency: '$' },
  { symbol: 'AMAT', name: 'Applied Materials', price: 198.20, change: 3.40, changePercent: 1.74, volume: '6.2M', marketCap: '162.1B', description: 'Process equipment.', sector: 'Technology', country: 'USA', currency: '$' },
  { symbol: 'ISRG', name: 'Intuitive Surgical', price: 385.40, change: 5.20, changePercent: 1.37, volume: '1.2M', marketCap: '136.4B', description: 'Robotic surgery.', sector: 'Healthcare', country: 'USA', currency: '$' },
  { symbol: 'HON', name: 'Honeywell Intl', price: 198.12, change: -1.20, changePercent: -0.60, volume: '2.8M', marketCap: '130.1B', description: 'Conglomerate.', sector: 'Industrials', country: 'USA', currency: '$' },
  { symbol: 'V', name: 'Visa Inc.', price: 275.45, change: 1.25, changePercent: 0.46, volume: '6.2M', marketCap: '568.4B', description: 'Payments network.', sector: 'Financial Services', country: 'USA', currency: '$' },
  { symbol: 'MA', name: 'Mastercard Inc.', price: 465.12, change: 3.45, changePercent: 0.75, volume: '2.8M', marketCap: '432.1B', description: 'Payments network.', sector: 'Financial Services', country: 'USA', currency: '$' },
  { symbol: 'JPM', name: 'JPMorgan Chase', price: 185.32, change: 0.85, changePercent: 0.46, volume: '10.4M', marketCap: '534.2B', description: 'Banking giant.', sector: 'Financial Services', country: 'USA', currency: '$' },
  { symbol: 'UNH', name: 'UnitedHealth Group', price: 525.12, change: 5.20, changePercent: 1.00, volume: '3.1M', marketCap: '487.4B', description: 'Healthcare giant.', sector: 'Healthcare', country: 'USA', currency: '$' },
  { symbol: 'DIS', name: 'Walt Disney Co.', price: 112.45, change: -1.25, changePercent: -1.10, volume: '12.4M', marketCap: '205.4B', description: 'Entertainment.', sector: 'Communication Services', country: 'USA', currency: '$' },
  { symbol: 'ORCL', name: 'Oracle Corp.', price: 115.32, change: 0.45, changePercent: 0.39, volume: '8.4M', marketCap: '315.4B', description: 'Cloud & Database.', sector: 'Technology', country: 'USA', currency: '$' },
  { symbol: 'CRM', name: 'Salesforce Inc.', price: 295.12, change: 4.12, changePercent: 1.42, volume: '5.2M', marketCap: '286.4B', description: 'CRM software.', sector: 'Technology', country: 'USA', currency: '$' },
  { symbol: 'NKE', name: 'Nike Inc.', price: 105.45, change: -0.85, changePercent: -0.80, volume: '7.4M', marketCap: '160.1B', description: 'Athletic apparel.', sector: 'Consumer Cyclical', country: 'USA', currency: '$' },
  { symbol: 'PYPL', name: 'PayPal Holdings', price: 62.15, change: -0.45, changePercent: -0.72, volume: '15.2M', marketCap: '68.4B', description: 'Digital payments.', sector: 'Financial Services', country: 'USA', currency: '$' },
  { symbol: 'SBUX', name: 'Starbucks Corp.', price: 95.32, change: 0.25, changePercent: 0.26, volume: '6.4M', marketCap: '108.4B', description: 'Coffee chain.', sector: 'Consumer Cyclical', country: 'USA', currency: '$' },

  // NIFTY 50 Components (Selection)
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2950.50, change: 12.30, changePercent: 0.42, volume: '8.2M', marketCap: '20.1T', description: 'Energy & Retail.', sector: 'Energy', country: 'India', currency: '₹' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 4120.80, change: -45.20, changePercent: -1.08, volume: '1.5M', marketCap: '14.8T', description: 'IT Services.', sector: 'Technology', country: 'India', currency: '₹' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: 1450.20, change: 5.10, changePercent: 0.35, volume: '12.4M', marketCap: '11.2T', description: 'Banking leader.', sector: 'Financial Services', country: 'India', currency: '₹' },
  { symbol: 'INFY', name: 'Infosys Ltd.', price: 1680.45, change: 12.15, changePercent: 0.73, volume: '4.2M', marketCap: '6.9T', description: 'IT consulting.', sector: 'Technology', country: 'India', currency: '₹' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', price: 1085.60, change: 8.40, changePercent: 0.78, volume: '9.4M', marketCap: '7.6T', description: 'Banking.', sector: 'Financial Services', country: 'India', currency: '₹' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', price: 2350.20, change: -12.40, changePercent: -0.52, volume: '1.2M', marketCap: '5.5T', description: 'Consumer Goods.', sector: 'Consumer Defensive', country: 'India', currency: '₹' },
  { symbol: 'SBIN', name: 'State Bank of India', price: 760.45, change: 15.20, changePercent: 2.04, volume: '18.4M', marketCap: '6.7T', description: 'Public Banking.', sector: 'Financial Services', country: 'India', currency: '₹' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', price: 1120.80, change: 5.40, changePercent: 0.48, volume: '5.2M', marketCap: '6.3T', description: 'Telecom giant.', sector: 'Communication Services', country: 'India', currency: '₹' },
  { symbol: 'LICI', name: 'LIC of India', price: 1050.20, change: 2.15, changePercent: 0.21, volume: '3.4M', marketCap: '6.6T', description: 'Insurance.', sector: 'Financial Services', country: 'India', currency: '₹' },
  { symbol: 'ITC', name: 'ITC Ltd.', price: 412.50, change: -2.30, changePercent: -0.55, volume: '10.4M', marketCap: '5.1T', description: 'Conglomerate.', sector: 'Consumer Defensive', country: 'India', currency: '₹' },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd.', price: 3450.40, change: 45.20, changePercent: 1.33, volume: '1.5M', marketCap: '4.8T', description: 'Engineering.', sector: 'Industrials', country: 'India', currency: '₹' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', price: 1720.80, change: -5.40, changePercent: -0.31, volume: '2.1M', marketCap: '3.4T', description: 'Banking.', sector: 'Financial Services', country: 'India', currency: '₹' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', price: 1080.45, change: 4.12, changePercent: 0.38, volume: '5.4M', marketCap: '3.3T', description: 'Banking.', sector: 'Financial Services', country: 'India', currency: '₹' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd.', price: 2850.12, change: 12.45, changePercent: 0.44, volume: '0.8M', marketCap: '2.7T', description: 'Paints.', sector: 'Consumer Defensive', country: 'India', currency: '₹' },
  { symbol: 'TITAN', name: 'Titan Company Ltd.', price: 3650.45, change: 58.45, changePercent: 1.63, volume: '0.9M', marketCap: '3.2T', description: 'Watches & Jewelry.', sector: 'Consumer Cyclical', country: 'India', currency: '₹' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India', price: 11450.20, change: 120.40, changePercent: 1.06, volume: '0.4M', marketCap: '3.5T', description: 'Automobile.', sector: 'Consumer Cyclical', country: 'India', currency: '₹' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharma Ltd.', price: 1540.80, change: 12.40, changePercent: 0.81, volume: '1.2M', marketCap: '3.7T', description: 'Pharmaceuticals.', sector: 'Healthcare', country: 'India', currency: '₹' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', price: 6540.20, change: -45.20, changePercent: -0.69, volume: '0.8M', marketCap: '4.1T', description: 'Financial Services.', sector: 'Financial Services', country: 'India', currency: '₹' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd.', price: 3120.45, change: 58.45, changePercent: 1.91, volume: '2.4M', marketCap: '3.6T', description: 'Infrastructure.', sector: 'Industrials', country: 'India', currency: '₹' },
  { symbol: 'WIPRO', name: 'Wipro Ltd.', price: 480.12, change: 2.45, changePercent: 0.51, volume: '8.4M', marketCap: '2.5T', description: 'IT services.', sector: 'Technology', country: 'India', currency: '₹' },
  { symbol: 'HCLTECH', name: 'HCL Technologies', price: 1545.32, change: 15.20, changePercent: 0.99, volume: '2.1M', marketCap: '3.8T', description: 'IT services.', sector: 'Technology', country: 'India', currency: '₹' },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd.', price: 8450.12, change: 125.45, changePercent: 1.51, volume: '0.2M', marketCap: '2.4T', description: 'Automobiles.', sector: 'Consumer Cyclical', country: 'India', currency: '₹' },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd.', price: 145.32, change: 2.15, changePercent: 1.50, volume: '25.4M', marketCap: '1.8T', description: 'Steel leader.', sector: 'Materials', country: 'India', currency: '₹' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement', price: 9850.45, change: 145.20, changePercent: 1.49, volume: '0.3M', marketCap: '2.8T', description: 'Cement leader.', sector: 'Materials', country: 'India', currency: '₹' },
  { symbol: 'POWERGRID', name: 'Power Grid Corp.', price: 285.12, change: 4.12, changePercent: 1.47, volume: '12.4M', marketCap: '2.1T', description: 'Power transmission.', sector: 'Utilities', country: 'India', currency: '₹' },
  { symbol: 'NTPC', name: 'NTPC Ltd.', price: 345.12, change: 5.20, changePercent: 1.53, volume: '15.4M', marketCap: '3.3T', description: 'Power generation.', sector: 'Utilities', country: 'India', currency: '₹' },
  { symbol: 'ONGC', name: 'ONGC Ltd.', price: 275.45, change: 3.12, changePercent: 1.15, volume: '18.4M', marketCap: '3.4T', description: 'Oil & Gas.', sector: 'Energy', country: 'India', currency: '₹' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra', price: 1950.45, change: 45.20, changePercent: 2.37, volume: '2.1M', marketCap: '2.4T', description: 'Automobiles.', sector: 'Consumer Cyclical', country: 'India', currency: '₹' },
  { symbol: 'COALINDIA', name: 'Coal India Ltd.', price: 450.12, change: 8.45, changePercent: 1.91, volume: '10.4M', marketCap: '2.8T', description: 'Mining.', sector: 'Energy', country: 'India', currency: '₹' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', price: 985.45, change: 25.45, changePercent: 2.65, volume: '12.1M', marketCap: '3.2T', description: 'Automobiles.', sector: 'Consumer Cyclical', country: 'India', currency: '₹' },
];
