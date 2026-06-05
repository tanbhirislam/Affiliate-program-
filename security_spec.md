# Security Specification - Affiliate Marketing Web Showroom

## 1. Data Invariants

Our system enforces high-ground security assumptions structured across three entities: `Product` listings, interaction telemetry `ClickEvent` logs, and administrative authorization rules `/admins/{id}`.

- **Identity Access Constraints (Admin Protection)**:
  - Only users designated inside the administrative Firestore mapping `/admins/{adminId}` can create, update, or delete `Product` items.
  - The designated administrative record requires explicit validation. Anonymous configurations are blocked.
  - Standard users can read the catalog (`allow get, list`) but are completely restricted from writing products or modifying admin structures.

- **Data Integrity Constraints**:
  - A `Product` must contain valid visual schemas (title, description, price, imageUrl, affiliateUrl) before creation.
  - Standard users can write interaction logs (`allow create` on `/clickEvents/{eventId}`) to register traffic but are strictly forbidden from list/get queries or deletes on telemetry logs. This mitigates competition spying or query scraping.
  - `createdAt` and `updatedAt` properties must correspond exactly to `request.time`.

---

## 2. The "Dirty Dozen" Attack Vectors (Malicious Payloads)

The following malicious client actions must be unconditionally blocked via `PERMISSION_DENIED`:

### Payload #1: No-Auth Product Spawning
*   **Vector**: Unauthenticated intruder attempts to append a high-margin custom product directly.
*   **Payload**: `POST /databases/$(database)/documents/products/malicious_item`
    ```json
    { "title": "Free Money", "affiliateUrl": "https://scam.com", "price": 999 }
    ```

### Payload #2: Authenticated Non-Admin Spawning
*   **Vector**: Standard Google user tries to write a product without having an entry in the `/admins` collection.
*   **Payload**: `POST /databases/$(database)/documents/products/rogue_item` with `request.auth.uid = "user_99"` (not white-listed).
    ```json
    { "title": "Rogue Deal", "affiliateUrl": "https://rogue.com", "price": 10 }
    ```

### Payload #3: Missing Blueprint Schema Creation
*   **Vector**: An admin attempts to push a malformed product lacking required schema properties.
*   **Payload**: `POST /databases/$(database)/documents/products/bad_item` with `request.auth.uid = "admin_user"` (whitelisted).
    ```json
    { "title": "Draft Idea", "price": 5.99 } // Missing imageUrl, affiliateUrl, shortDescription
    ```

### Payload #4: Initial State Poisoning
*   **Vector**: Malicious admin or attacker attempts to bypass incrementers by creating a product seeded with high initial click volume.
*   **Payload**:
    ```json
    { "title": "Sofa", "clickCount": 99999, "affiliateUrl": "https://deal", "imageUrl": "https://img", "category": "Tech", "shortDescription": "comfy", "description": "very comfortable sofa", "price": 200 }
    ```

### Payload #5: Standard User Overwriting Catalog Items
*   **Vector**: Intruders trying to update a valid product's destination URL to hijack traffic earnings.
*   **Payload**: `PATCH /databases/$(database)/documents/products/genuine_product` with standard user session credentials.
    ```json
    { "affiliateUrl": "https://hacker-payout.com" }
    ```

### Payload #6: Immutable Date Injection Attack
*   **Vector**: An editor tries to fake product history by changing the `createdAt` date backward during an update.
*   **Payload**: `PATCH /databases/$(database)/documents/products/genuine_product` with altered timestamps.
    ```json
    { "createdAt": "2020-01-01T00:00:00Z" }
    ```

### Payload #7: Non-Admin Deletion Attack
*   **Vector**: Competitor trying to wipe out the product database using an authenticated client script.
*   **Payload**: `DELETE /databases/$(database)/documents/products/genuine_product` while authenticated but non-admin.

### Payload #8: clickEvents Telemetry Overflow (Wallet Exhaustion)
*   **Vector**: Attacker tries to bloat databases by sending high-volume telemetry with a 10MB text blob to exhaust storage.
*   **Payload**: `POST /databases/$(database)/documents/clickEvents/click_99`
    ```json
    { "productId": "p1", "productTitle": "A", "buttonType": "buy_now", "referrer": "A".repeat(1000000), "timestamp": "request.time" }
    ```

### Payload #9: Token Variable Poisoning (Unicode Attacks)
*   **Vector**: Path traversal attempts using special characters as a document ID in `/clickEvents`.
*   **Payload**: `POST /databases/$(database)/documents/clickEvents/../../bad_path`

### Payload #10: Competitor Scraping clickEvents Lists
*   **Vector**: Spy script attempts to read transaction telemetry logs to scrape top-selling items.
*   **Payload**: `GET /databases/$(database)/documents/clickEvents` (Should fail listing outright).

### Payload #11: Rogue Auth Escalation
*   **Vector**: Standard user trying to write themselves into the `/admins` list.
*   **Payload**: `POST /databases/$(database)/documents/admins/user_99`
    ```json
    { "email": "hacker@domain.com", "createdAt": "request.time" }
    ```

### Payload #12: Telemetry Identifier Poisoning (Denial of Wallet)
*   **Vector**: Attacker logs click events with malicious string values inside `productId` to corrupt relationship indexes.
*   **Payload**: `POST /databases/$(database)/documents/clickEvents/evt_1`
    ```json
    { "productId": "A".repeat(10000), "productTitle": "Poison", "buttonType": "buy_now", "timestamp": "request.time" }
    ```

---

## 3. Test Script Framework (Conceptual Representation)

Below is the structure of checks modeled under our TDD design:

```typescript
// firestore.rules.test.ts
// Recreated conceptually in application modules to handle verification bounds.
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('Affiliate Web Application Security Protocol', () => {
  let testEnv;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'gen-lang-client-0807011147',
    });
  });

  it('Blocks unauthenticated user product injections (Payload 1)', async () => {
    const unauthDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(unauthDb.collection('products').add({ title: 'Rogue App' }));
  });

  it('Blocks standard auth logs listings parsing (Payload 10)', async () => {
    const authDb = testEnv.authenticatedContext('user_123').firestore();
    await assertFails(authDb.collection('clickEvents').get());
  });

  it('Permits standard user to log a valid click action under strict validators', async () => {
    const authDb = testEnv.authenticatedContext('user_123').firestore();
    await assertSucceeds(authDb.collection('clickEvents').add({
      productId: 'prod_99',
      productTitle: 'Standard Laptop',
      buttonType: 'view_deal',
      timestamp: new Date()
    }));
  });
});
```
