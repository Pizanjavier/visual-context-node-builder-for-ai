# Spec Check

Audit the current implementation against SPEC.md and report any drift.

**Steps:**
1. Read SPEC.md in full
2. Scan src/ for all implemented features
3. For each spec section (incl. §4.4 Git-Aware Context Seeding), verify implementation exists and matches
4. List: ✅ Implemented | ⚠️ Partial | ❌ Missing | 🔀 Drifted (implemented differently than spec)
5. Propose resolution for any ⚠️, ❌, or 🔀 items

$ARGUMENTS
