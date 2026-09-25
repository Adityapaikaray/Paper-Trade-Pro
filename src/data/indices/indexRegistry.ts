/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IndexDefinition, IndexConstituent } from './types.ts';

// Direct static imports of all 13 supported index constituent definitions
import dowData from './constituents/dow.json';
import sandp100Data from './constituents/sandp100.json';
import nasdaqData from './constituents/nasdaq.json';
import sandp500Data from './constituents/sandp500.json';
import russell2000Data from './constituents/russell2000.json';

import niftyData from './constituents/nifty.json';
import niftybankData from './constituents/niftybank.json';
import niftyitData from './constituents/niftyit.json';
import niftyfinData from './constituents/niftyfin.json';
import niftymidcap100Data from './constituents/niftymidcap100.json';
import niftysmallcap100Data from './constituents/niftysmallcap100.json';
import sensexData from './constituents/sensex.json';
import bse500Data from './constituents/bse500.json';

export const US_INDEX_KEYS = [
  'sandp500',
  'nasdaq',
  'dow',
  'russell2000',
  'sandp100'
] as const;

export const INDIA_INDEX_KEYS = [
  'nifty',
  'niftybank',
  'niftyit',
  'niftyfin',
  'niftymidcap100',
  'niftysmallcap100',
  'sensex',
  'bse500'
] as const;

export const ALL_SUPPORTED_INDEX_KEYS = [
  ...US_INDEX_KEYS,
  ...INDIA_INDEX_KEYS
] as const;

export type SupportedIndexKey = typeof ALL_SUPPORTED_INDEX_KEYS[number];

export const ALL_SUPPORTED_INDICES: Record<string, IndexDefinition> = {
  // U.S. Indices
  sandp500: sandp500Data as unknown as IndexDefinition,
  nasdaq: nasdaqData as unknown as IndexDefinition,
  dow: dowData as unknown as IndexDefinition,
  russell2000: russell2000Data as unknown as IndexDefinition,
  sandp100: sandp100Data as unknown as IndexDefinition,

  // Indian Indices
  nifty: niftyData as unknown as IndexDefinition,
  niftybank: niftybankData as unknown as IndexDefinition,
  niftyit: niftyitData as unknown as IndexDefinition,
  niftyfin: niftyfinData as unknown as IndexDefinition,
  niftymidcap100: niftymidcap100Data as unknown as IndexDefinition,
  niftysmallcap100: niftysmallcap100Data as unknown as IndexDefinition,
  sensex: sensexData as unknown as IndexDefinition,
  bse500: bse500Data as unknown as IndexDefinition,
};

/**
 * Helper to get the canonical index configuration
 */
export function getIndexDefinition(key: string): IndexDefinition {
  const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  return ALL_SUPPORTED_INDICES[normKey] || ALL_SUPPORTED_INDICES.nifty;
}
