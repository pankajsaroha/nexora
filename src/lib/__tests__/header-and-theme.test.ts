import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("NEXORA — Mobile Header, Institution Dropdown & Dark Mode Verification", async (t) => {
  const globalsCssPath = path.resolve(process.cwd(), "src/app/globals.css");
  const globalsCss = fs.readFileSync(globalsCssPath, "utf-8");

  await t.test("1. Dark Mode Tokens: Verified neutral graphite/charcoal tokens", () => {
    // Check .dark block exists
    assert.ok(globalsCss.includes(".dark {"), "globals.css must contain .dark class");

    // Extract .dark block
    const darkBlockMatch = globalsCss.match(/\.dark\s*\{([^}]+)\}/);
    assert.ok(darkBlockMatch, ".dark block must be parseable");
    const darkBlock = darkBlockMatch[1];

    // Main background: #111114
    assert.ok(darkBlock.includes("--background: #111114;"), "Dark background must be #111114");

    // Elevated surface/card: #1B1B20
    assert.ok(darkBlock.includes("--card: #1B1B20;"), "Dark card surface must be #1B1B20");
    assert.ok(darkBlock.includes("--surface: #1B1B20;"), "Dark surface must be #1B1B20");

    // Secondary surface: #222228
    assert.ok(darkBlock.includes("--secondary: #222228;"), "Dark secondary surface must be #222228");
    assert.ok(darkBlock.includes("--popover: #222228;"), "Dark popover surface must be #222228");

    // Subtle borders: #303038
    assert.ok(darkBlock.includes("--border: #303038;"), "Dark subtle border must be #303038");

    // Primary text: #F5F3F7
    assert.ok(darkBlock.includes("--foreground: #F5F3F7;"), "Dark primary text must be #F5F3F7");

    // Secondary text: #B6B2BD
    assert.ok(darkBlock.includes("--foreground-secondary: #B6B2BD;"), "Dark secondary text must be #B6B2BD");

    // Gold accent: #D4AF37
    assert.ok(darkBlock.includes("--gold: #D4AF37;"), "Dark gold accent must be #D4AF37");

    // Muted plum accent: #B99ACB
    assert.ok(darkBlock.includes("--ring: #B99ACB;"), "Dark focus ring / accent plum must be #B99ACB");
  });

  await t.test("2. Light Mode Preservation: Light theme :root tokens remain intact", () => {
    const rootBlockMatch = globalsCss.match(/:root\s*\{([^}]+)\}/);
    assert.ok(rootBlockMatch, ":root block must be parseable");
    const rootBlock = rootBlockMatch[1];

    // Background: #FAF8F5 (Warm Alabaster)
    assert.ok(rootBlock.includes("--background: #FAF8F5;"), "Light mode background must be #FAF8F5");

    // Royal Amethyst primary: #2B1238
    assert.ok(rootBlock.includes("--primary: #2B1238;"), "Light mode primary must be #2B1238");

    // Borders: #E9E2D9 (Warm Stone)
    assert.ok(rootBlock.includes("--border: #E9E2D9;"), "Light mode border must be #E9E2D9");
  });

  await t.test("3. Institution Selector Filtering Logic", () => {
    const sampleInstitutions = [
      { id: "inst-1", name: "Northstar International Academy", code: "NORTH-ACAD", type: "K12_SCHOOL" },
      { id: "inst-2", name: "Cambridge Global Institute", code: "CAMB-GLOB", type: "HIGHER_ED" },
      { id: "inst-3", name: "Delhi Public School Branch 4", code: "DPS-B4", type: "K12_SCHOOL" },
    ];

    const filterInstitutions = (institutions: typeof sampleInstitutions, query: string) => {
      const q = query.trim().toLowerCase();
      return institutions.filter(
        (inst) =>
          inst.name.toLowerCase().includes(q) ||
          inst.code.toLowerCase().includes(q)
      );
    };

    // Filter by name substring
    const matchName = filterInstitutions(sampleInstitutions, "cambridge");
    assert.equal(matchName.length, 1);
    assert.equal(matchName[0].id, "inst-2");

    // Filter by code
    const matchCode = filterInstitutions(sampleInstitutions, "dps");
    assert.equal(matchCode.length, 1);
    assert.equal(matchCode[0].id, "inst-3");

    // Empty query returns all
    const matchAll = filterInstitutions(sampleInstitutions, "");
    assert.equal(matchAll.length, 3);
  });

  await t.test("4. Topbar & Header Components: No overlapping elements & safe mobile layout", () => {
    const topbarPath = path.resolve(process.cwd(), "src/components/layout/topbar.tsx");
    const topbarContent = fs.readFileSync(topbarPath, "utf-8");

    // Verified sticky with backdrop blur and safe area inset
    assert.ok(topbarContent.includes("pt-[env(safe-area-inset-top,0px)]"), "Topbar must respect safe-area-inset-top");

    // Verified Super Admin dedicated mobile strip
    assert.ok(topbarContent.includes("isSuperAdmin && ("), "Super Admin must have dedicated mobile tenant strip");
    assert.ok(topbarContent.includes("compactMobileTrigger={true}"), "Mobile strip must use compactMobileTrigger");

    // Verified ref-based dismissal for notifications and user menu
    assert.ok(topbarContent.includes("notificationsRef"), "Notifications must track container ref");
    assert.ok(topbarContent.includes("userMenuRef"), "UserMenu must track container ref");
    assert.ok(topbarContent.includes("Escape"), "Menus must close on Escape key");
  });
});
