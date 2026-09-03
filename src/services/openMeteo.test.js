import { parseWMOCode } from "./openMeteo.js";

/**
 * Unit tests for WMO weather code mapping and condition parsing.
 */
function testWMOCodeMapping() {
  const tests = [
    { code: 0, isNight: false, expectedKey: "clear-day" },
    { code: 0, isNight: true, expectedKey: "clear-night" },
    { code: 1, isNight: false, expectedKey: "partly-cloudy" },
    { code: 3, isNight: false, expectedKey: "cloudy" },
    { code: 61, isNight: false, expectedKey: "rain" },
    { code: 95, isNight: false, expectedKey: "storm" },
    { code: 71, isNight: false, expectedKey: "snow" },
    { code: 45, isNight: false, expectedKey: "fog" },
  ];

  let passed = 0;
  for (const t of tests) {
    const result = parseWMOCode(t.code, t.isNight);
    if (result.key === t.expectedKey) {
      passed++;
    } else {
      console.error(`Test failed for code ${t.code}: expected ${t.expectedKey}, got ${result.key}`);
    }
  }

  console.log(`WMO Code Mapping Unit Test Results: ${passed}/${tests.length} passed.`);
  return passed === tests.length;
}

if (typeof window === "undefined") {
  testWMOCodeMapping();
}

export { testWMOCodeMapping };
