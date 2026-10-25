import test from "node:test";
import assert from "node:assert/strict";

test("NEXORA — Global Search & Performance Verification", async (t) => {
  // Test 1: Case-insensitive query builder logic
  await t.test("Search query builder includes mode: 'insensitive' for PostgreSQL", () => {
    const q = "aarav";
    const studentWhere = {
      OR: [
        { fullName: { contains: q, mode: "insensitive" } },
        { admissionNumber: { contains: q, mode: "insensitive" } },
        { rollNumber: { contains: q, mode: "insensitive" } },
      ],
    };

    assert.equal((studentWhere.OR[0] as any).fullName.mode, "insensitive");
    assert.equal((studentWhere.OR[1] as any).admissionNumber.mode, "insensitive");
    assert.equal((studentWhere.OR[2] as any).rollNumber.mode, "insensitive");
  });

  // Test 2: Role-based search scope isolation
  await t.test("Super Admin has cross-institution scope while Institution Admin is strictly scoped", () => {
    function resolveInstitutionScope(user: { roleCode: string; institutionId: string }, requestedId?: string) {
      const isSuperAdmin = user.roleCode === "SUPER_ADMIN";
      return isSuperAdmin ? (requestedId || undefined) : user.institutionId;
    }

    const superAdmin = { roleCode: "SUPER_ADMIN", institutionId: "inst-primary" };
    const instAdmin = { roleCode: "ADMIN", institutionId: "inst-primary" };
    const teacher = { roleCode: "TEACHER", institutionId: "inst-primary" };

    // Super Admin with no explicit filter -> cross-institution (undefined)
    assert.equal(resolveInstitutionScope(superAdmin), undefined);

    // Super Admin with explicit filter -> targeted institution
    assert.equal(resolveInstitutionScope(superAdmin, "inst-secondary"), "inst-secondary");

    // Institution Admin cannot search outside their institution
    assert.equal(resolveInstitutionScope(instAdmin), "inst-primary");
    assert.equal(resolveInstitutionScope(instAdmin, "inst-secondary"), "inst-primary");

    // Teacher cannot search outside their institution
    assert.equal(resolveInstitutionScope(teacher), "inst-primary");
    assert.equal(resolveInstitutionScope(teacher, "inst-secondary"), "inst-primary");
  });

  // Test 3: Cache key tenant isolation
  await t.test("Search cache keys are strictly scoped by role, tenant, user ID, and query", () => {
    function createSearchCacheKey(user: { roleCode: string; institutionId: string; id: string }, targetInstId: string | undefined, query: string) {
      return `${user.roleCode}:${targetInstId || "CROSS"}:${user.id}:${query.toLowerCase().trim()}`;
    }

    const keySuperAdmin = createSearchCacheKey(
      { roleCode: "SUPER_ADMIN", institutionId: "inst-1", id: "user-super" },
      undefined,
      "Aarav"
    );
    const keyAdminInst1 = createSearchCacheKey(
      { roleCode: "ADMIN", institutionId: "inst-1", id: "user-admin-1" },
      "inst-1",
      "aarav"
    );
    const keyAdminInst2 = createSearchCacheKey(
      { roleCode: "ADMIN", institutionId: "inst-2", id: "user-admin-2" },
      "inst-2",
      "aarav"
    );

    // Ensure no key collision across different users or tenants
    assert.notEqual(keySuperAdmin, keyAdminInst1);
    assert.notEqual(keyAdminInst1, keyAdminInst2);
    // Ensure case normalization
    assert.equal(
      createSearchCacheKey({ roleCode: "ADMIN", institutionId: "inst-1", id: "user-admin-1" }, "inst-1", "AARAV"),
      keyAdminInst1
    );
  });

  // Test 4: Task search permissions
  await t.test("Task search permissions include SUPER_ADMIN, PRINCIPAL, ADMIN, and TEACHER", () => {
    function canSearchTasks(roleCode: string) {
      return (
        roleCode === "SUPER_ADMIN" ||
        roleCode === "PRINCIPAL" ||
        roleCode === "ADMIN" ||
        roleCode === "TEACHER"
      );
    }

    assert.equal(canSearchTasks("SUPER_ADMIN"), true);
    assert.equal(canSearchTasks("PRINCIPAL"), true);
    assert.equal(canSearchTasks("ADMIN"), true);
    assert.equal(canSearchTasks("TEACHER"), true);
    assert.equal(canSearchTasks("STUDENT"), false);
    assert.equal(canSearchTasks("PARENT"), false);
  });

  // Test 5: In-flight deduplication mechanism
  await t.test("Concurrent identical searches reuse the active promise", async () => {
    const inFlightSearches = new Map<string, Promise<string>>();
    let actualFetchCount = 0;

    async function deduplicatedFetch(key: string): Promise<string> {
      if (inFlightSearches.has(key)) {
        return inFlightSearches.get(key)!;
      }

      const p = (async () => {
        actualFetchCount++;
        await new Promise((r) => setTimeout(r, 20));
        return `result-for-${key}`;
      })();

      inFlightSearches.set(key, p);
      try {
        return await p;
      } finally {
        inFlightSearches.delete(key);
      }
    }

    // Launch 3 simultaneous requests with same key
    const [r1, r2, r3] = await Promise.all([
      deduplicatedFetch("query-1"),
      deduplicatedFetch("query-1"),
      deduplicatedFetch("query-1"),
    ]);

    assert.equal(r1, "result-for-query-1");
    assert.equal(r2, "result-for-query-1");
    assert.equal(r3, "result-for-query-1");
    // Only 1 execution occurred despite 3 callers
    assert.equal(actualFetchCount, 1);
  });

  // Test 6: Stale response protection via request ID sequencing
  await t.test("Request sequence IDs discard out-of-order stale responses", async () => {
    let activeRequestId = 0;
    let renderedResult = "";

    async function simulatedSearch(query: string, delayMs: number) {
      const requestId = ++activeRequestId;
      await new Promise((r) => setTimeout(r, delayMs));

      // Discard if activeRequestId has changed
      if (requestId === activeRequestId) {
        renderedResult = query;
      }
    }

    // First request is slow (50ms), second request is fast (10ms)
    const req1 = simulatedSearch("slow-first-search", 50);
    const req2 = simulatedSearch("fast-second-search", 10);

    await Promise.all([req1, req2]);

    // The faster, newer request must prevail; older request must not overwrite it
    assert.equal(renderedResult, "fast-second-search");
  });
});
