/// Seal V2 access gate — key servers call seal_approve via dry-run before releasing keys.
module tamind::seal_policy;

use tamind::escrow::PurchaseReceipt;
use tamind::registry::DatasetRegistry;

const ENoAccess: u64 = 77;

fun policy_matches(id: &vector<u8>, expected: &vector<u8>): bool {
    if (id.length() != expected.length()) {
        return false
    };
    let mut i = 0;
    while (i < id.length()) {
        if (id[i] != expected[i]) {
            return false
        };
        i = i + 1;
    };
    true
}

/// Seal key servers evaluate this entry via dry_run_transaction_block.
/// Buyer must pass their PurchaseReceipt + registry + dataset_id.
public entry fun seal_approve(
    id: vector<u8>,
    receipt: &PurchaseReceipt,
    registry: &DatasetRegistry,
    dataset_id: u64,
) {
    let expected_policy = tamind::registry::seal_policy_id(registry, dataset_id);
    assert!(policy_matches(&id, &expected_policy), ENoAccess);
    assert!(tamind::escrow::receipt_dataset_id(receipt) == dataset_id, ENoAccess);
    assert!(policy_matches(&id, &tamind::escrow::receipt_seal_policy_id(receipt)), ENoAccess);
}
