const fs = require('fs');
const path = require('path');

const years = [];
for (let y = 2021; y <= 2033; y++) years.push(String(y));

const geographies = [
  "South Africa", "Ghana", "Mali", "Burkina Faso", "Tanzania",
  "Côte d'Ivoire", "Zimbabwe", "Democratic Republic of the Congo",
  "Guinea", "Sudan", "Russia", "Australia"
];

// Market size multipliers per country (relative scale)
const countryScale = {
  "South Africa": 1.0,
  "Ghana": 0.75,
  "Mali": 0.35,
  "Burkina Faso": 0.30,
  "Tanzania": 0.45,
  "Côte d'Ivoire": 0.38,
  "Zimbabwe": 0.28,
  "Democratic Republic of the Congo": 0.40,
  "Guinea": 0.22,
  "Sudan": 0.25,
  "Russia": 0.90,
  "Australia": 0.85
};

// Seeded pseudo-random (simple deterministic)
let seed = 42;
function rand() {
  seed = (seed * 16807 + 0) % 2147483647;
  return (seed - 1) / 2147483646;
}

function generateLeaf(baseValue, growthRate, isVolume) {
  const data = {};
  let val = baseValue * (0.85 + rand() * 0.30); // some randomness on base
  for (const year of years) {
    if (isVolume) {
      data[year] = Math.round(val);
    } else {
      data[year] = Math.round(val * 100) / 100;
    }
    // Annual growth with slight randomness
    const annualGrowth = growthRate * (0.7 + rand() * 0.6);
    val *= (1 + annualGrowth);
  }
  return data;
}

function buildSegments(scale, isVolume) {
  // Base values differ for value (USD M) vs volume (Tons)
  const vMult = isVolume ? 1 : 1;

  // By Raw Material Source
  const byRawMaterial = {
    "Coal-Based Activated Carbon": {
      "Bituminous Coal-Based": generateLeaf((isVolume ? 800 : 8.5) * scale, 0.08, isVolume),
      "Lignite/Sub-Bituminous Coal-Based": generateLeaf((isVolume ? 500 : 5.2) * scale, 0.07, isVolume),
      "Anthracite Coal-Based": generateLeaf((isVolume ? 300 : 3.5) * scale, 0.06, isVolume)
    },
    "Coconut Shell-Based Activated Carbon": generateLeaf((isVolume ? 900 : 10.0) * scale, 0.09, isVolume),
    "Wood-Based Activated Carbon": generateLeaf((isVolume ? 400 : 4.5) * scale, 0.07, isVolume),
    "Peat-Based Activated Carbon": generateLeaf((isVolume ? 200 : 2.2) * scale, 0.06, isVolume),
    "Other Biomass-Based Activated Carbon (Bamboo-Based, etc.)": generateLeaf((isVolume ? 150 : 1.8) * scale, 0.10, isVolume)
  };

  // By Product Form
  const byProductForm = {
    "Powdered Activated Carbon (PAC)": generateLeaf((isVolume ? 700 : 7.5) * scale, 0.08, isVolume),
    "Granular Activated Carbon (GAC)": generateLeaf((isVolume ? 1000 : 11.0) * scale, 0.09, isVolume),
    "Extruded / Pelletized Activated Carbon (EAC)": generateLeaf((isVolume ? 350 : 4.0) * scale, 0.07, isVolume),
    "Others (Bead / Spherical Activated Carbon, etc.)": generateLeaf((isVolume ? 150 : 1.8) * scale, 0.06, isVolume)
  };

  // By Supply Type
  const bySupplyType = {
    "Virgin Activated Carbon": generateLeaf((isVolume ? 1500 : 16.0) * scale, 0.08, isVolume),
    "Reactivated / Regenerated Activated Carbon": generateLeaf((isVolume ? 700 : 7.0) * scale, 0.10, isVolume)
  };

  // By Application - Gold Mining should be larger for African countries
  const isAfrican = true; // we'll handle per-country below but scale is already set
  const byApplication = {
    "Gold Mining": {
      "Carbon-in-Leach (CIL)": generateLeaf((isVolume ? 600 : 6.5) * scale, 0.09, isVolume),
      "Carbon-in-Pulp (CIP)": generateLeaf((isVolume ? 500 : 5.5) * scale, 0.08, isVolume),
      "Carbon-in-Column (CIC)": generateLeaf((isVolume ? 250 : 2.8) * scale, 0.07, isVolume),
      "Others": generateLeaf((isVolume ? 150 : 1.5) * scale, 0.08, isVolume)
    },
    "Water Treatment": {
      "Potable / Drinking Water Treatment": generateLeaf((isVolume ? 300 : 3.2) * scale, 0.08, isVolume),
      "Industrial Water Treatment": generateLeaf((isVolume ? 250 : 2.8) * scale, 0.07, isVolume),
      "Wastewater / Effluent Treatment": generateLeaf((isVolume ? 200 : 2.2) * scale, 0.09, isVolume),
      "Mine Water Treatment": generateLeaf((isVolume ? 180 : 2.0) * scale, 0.08, isVolume)
    }
  };

  return {
    "By Raw Material Source": byRawMaterial,
    "By Product Form": byProductForm,
    "By Supply Type": bySupplyType,
    "By Application": byApplication
  };
}

function buildSpecialSegments(geo, scale, isVolume) {
  // For Russia and Australia, Gold Mining should be smaller relative to Water Treatment
  // For African countries, Gold Mining larger
  const isNonAfrican = (geo === "Russia" || geo === "Australia");

  seed = hashCode(geo + (isVolume ? "vol" : "val"));

  const byRawMaterial = {
    "Coal-Based Activated Carbon": {
      "Bituminous Coal-Based": generateLeaf((isVolume ? 800 : 8.5) * scale, 0.08, isVolume),
      "Lignite/Sub-Bituminous Coal-Based": generateLeaf((isVolume ? 500 : 5.2) * scale, 0.07, isVolume),
      "Anthracite Coal-Based": generateLeaf((isVolume ? 300 : 3.5) * scale, 0.06, isVolume)
    },
    "Coconut Shell-Based Activated Carbon": generateLeaf((isVolume ? 900 : 10.0) * scale, 0.09, isVolume),
    "Wood-Based Activated Carbon": generateLeaf((isVolume ? 400 : 4.5) * scale, 0.07, isVolume),
    "Peat-Based Activated Carbon": generateLeaf((isVolume ? 200 : 2.2) * scale, 0.06, isVolume),
    "Other Biomass-Based Activated Carbon (Bamboo-Based, etc.)": generateLeaf((isVolume ? 150 : 1.8) * scale, 0.10, isVolume)
  };

  const byProductForm = {
    "Powdered Activated Carbon (PAC)": generateLeaf((isVolume ? 700 : 7.5) * scale, 0.08, isVolume),
    "Granular Activated Carbon (GAC)": generateLeaf((isVolume ? 1000 : 11.0) * scale, 0.09, isVolume),
    "Extruded / Pelletized Activated Carbon (EAC)": generateLeaf((isVolume ? 350 : 4.0) * scale, 0.07, isVolume),
    "Others (Bead / Spherical Activated Carbon, etc.)": generateLeaf((isVolume ? 150 : 1.8) * scale, 0.06, isVolume)
  };

  const bySupplyType = {
    "Virgin Activated Carbon": generateLeaf((isVolume ? 1500 : 16.0) * scale, 0.08, isVolume),
    "Reactivated / Regenerated Activated Carbon": generateLeaf((isVolume ? 700 : 7.0) * scale, 0.10, isVolume)
  };

  // Gold Mining vs Water Treatment scaling
  const goldScale = isNonAfrican ? 0.6 : 1.0;
  const waterScale = isNonAfrican ? 1.4 : 1.0;

  const byApplication = {
    "Gold Mining": {
      "Carbon-in-Leach (CIL)": generateLeaf((isVolume ? 600 : 6.5) * scale * goldScale, 0.09, isVolume),
      "Carbon-in-Pulp (CIP)": generateLeaf((isVolume ? 500 : 5.5) * scale * goldScale, 0.08, isVolume),
      "Carbon-in-Column (CIC)": generateLeaf((isVolume ? 250 : 2.8) * scale * goldScale, 0.07, isVolume),
      "Others": generateLeaf((isVolume ? 150 : 1.5) * scale * goldScale, 0.08, isVolume)
    },
    "Water Treatment": {
      "Potable / Drinking Water Treatment": generateLeaf((isVolume ? 300 : 3.2) * scale * waterScale, 0.08, isVolume),
      "Industrial Water Treatment": generateLeaf((isVolume ? 250 : 2.8) * scale * waterScale, 0.07, isVolume),
      "Wastewater / Effluent Treatment": generateLeaf((isVolume ? 200 : 2.2) * scale * waterScale, 0.09, isVolume),
      "Mine Water Treatment": generateLeaf((isVolume ? 180 : 2.0) * scale * waterScale, 0.08, isVolume)
    }
  };

  return {
    "By Raw Material Source": byRawMaterial,
    "By Product Form": byProductForm,
    "By Supply Type": bySupplyType,
    "By Application": byApplication
  };
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 2147483647 + 1;
}

function generateFile(isVolume) {
  const result = {};
  for (const geo of geographies) {
    const scale = countryScale[geo];
    result[geo] = buildSpecialSegments(geo, scale, isVolume);
  }
  return result;
}

// Add aggregated year data to parent nodes by summing children
// depth: 0 = segment type level, 1 = first segment level (level 2), 2 = sub-segment level (level 3), etc.
function addParentAggregations(obj, depth) {
  if (depth === undefined) depth = 0;
  const keys = Object.keys(obj);
  // If this node has year data, it's a leaf - return it
  if (keys.includes('2021')) {
    return obj;
  }
  // Otherwise, recurse into children and aggregate
  const childYearSums = {};
  let hasChildWithYears = false;
  for (const key of keys) {
    const child = addParentAggregations(obj[key], depth + 1);
    obj[key] = child;
    const childKeys = Object.keys(child);
    // Check if child has year data (directly or after aggregation)
    if (childKeys.includes('2021')) {
      hasChildWithYears = true;
      for (const y of years) {
        if (child[y] !== undefined) {
          childYearSums[y] = (childYearSums[y] || 0) + child[y];
        }
      }
    }
  }
  // If children had year data, add aggregated sums to this parent
  if (hasChildWithYears) {
    for (const y of years) {
      if (childYearSums[y] !== undefined) {
        // Round appropriately
        obj[y] = Math.round(childYearSums[y] * 100) / 100;
      }
    }
    obj['_aggregated'] = true;
    // depth 0 = segment type root (level 1), depth 1 = first segment (level 2), etc.
    obj['_level'] = depth + 1;
  }
  return obj;
}

// Generate both files
const valueData = generateFile(false);
const volumeData = generateFile(true);

// Add parent aggregations to all geographies and segment types
for (const geo of geographies) {
  for (const segType of Object.keys(valueData[geo])) {
    addParentAggregations(valueData[geo][segType]);
  }
  for (const segType of Object.keys(volumeData[geo])) {
    addParentAggregations(volumeData[geo][segType]);
  }
}

const outDir = path.join(__dirname, 'public', 'data');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'value.json'), JSON.stringify(valueData, null, 2), 'utf8');
fs.writeFileSync(path.join(outDir, 'volume.json'), JSON.stringify(volumeData, null, 2), 'utf8');

console.log('Generated value.json and volume.json');

// Verification
function verify(data, label) {
  const geos = Object.keys(data);
  console.log(`\n${label}: ${geos.length} geographies`);
  if (geos.length !== 12) console.log('  ERROR: expected 12 geographies');

  for (const geo of geos) {
    const segments = data[geo];
    const segTypes = Object.keys(segments);
    if (segTypes.length !== 4) console.log(`  ERROR: ${geo} has ${segTypes.length} segment types, expected 4`);

    // Check leaf nodes have all years
    let leafCount = 0;
    function checkNode(node, path) {
      const keys = Object.keys(node);
      if (keys.includes('2021')) {
        // This is a leaf
        leafCount++;
        if (keys.length !== 13) console.log(`  ERROR: ${path} has ${keys.length} years, expected 13`);
        for (const y of years) {
          if (!(y in node)) console.log(`  ERROR: ${path} missing year ${y}`);
        }
        // Check growth trend
        if (node['2033'] <= node['2021']) console.log(`  WARNING: ${path} no growth trend`);
      } else {
        // Parent node - should NOT have year data
        for (const y of years) {
          if (y in node) console.log(`  ERROR: ${path} parent has year data`);
        }
        for (const k of keys) {
          checkNode(node[k], path + ' > ' + k);
        }
      }
    }
    for (const st of segTypes) {
      checkNode(segments[st], geo + ' > ' + st);
    }
    if (geo === geos[0]) console.log(`  ${geo}: ${leafCount} leaf segments`);
  }
}

verify(valueData, 'value.json');
verify(volumeData, 'volume.json');

// Show sample
console.log('\nSample - South Africa > By Raw Material Source > Coal-Based > Bituminous (value):');
console.log(JSON.stringify(valueData['South Africa']['By Raw Material Source']['Coal-Based Activated Carbon']['Bituminous Coal-Based'], null, 2));
console.log('\nSample - Guinea > By Application > Gold Mining > CIL (volume):');
console.log(JSON.stringify(volumeData['Guinea']['By Application']['Gold Mining']['Carbon-in-Leach (CIL)'], null, 2));
