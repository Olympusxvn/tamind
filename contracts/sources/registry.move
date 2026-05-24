/// TaMind dataset registry — on-chain listing of Walrus blob IDs + Seal policy identities.
module tamind::registry;

use sui::event;

const ENotOwner: u64 = 1;
const EDuplicateBlob: u64 = 2;
const ENotFound: u64 = 3;

public struct Dataset has store, copy, drop {
    title: vector<u8>,
    blob_id: vector<u8>,
    seal_policy_id: vector<u8>,
    price: u64,
    seller: address,
    created_at: u64,
}

public struct DatasetRegistry has key {
    id: UID,
    datasets: vector<Dataset>,
}

public struct DatasetRegistered has copy, drop {
    dataset_id: u64,
    blob_id: vector<u8>,
    seal_policy_id: vector<u8>,
    price: u64,
    seller: address,
}

public fun create_registry(ctx: &mut TxContext): DatasetRegistry {
    DatasetRegistry {
        id: object::new(ctx),
        datasets: vector::empty(),
    }
}

public fun register_dataset(
    registry: &mut DatasetRegistry,
    title: vector<u8>,
    blob_id: vector<u8>,
    seal_policy_id: vector<u8>,
    price: u64,
    clock_ms: u64,
    ctx: &mut TxContext,
): u64 {
    let seller = ctx.sender();
    let len = registry.datasets.length();
    let mut i = 0;
    while (i < len) {
        let existing = registry.datasets[i];
        assert!(existing.blob_id != blob_id, EDuplicateBlob);
        i = i + 1;
    };

    let dataset = Dataset {
        title,
        blob_id,
        seal_policy_id,
        price,
        seller,
        created_at: clock_ms,
    };
    registry.datasets.push_back(dataset);

    let dataset_id = len;
    event::emit(DatasetRegistered {
        dataset_id,
        blob_id: registry.datasets[dataset_id].blob_id,
        seal_policy_id: registry.datasets[dataset_id].seal_policy_id,
        price,
        seller,
    });
    dataset_id
}

public fun dataset_count(registry: &DatasetRegistry): u64 {
    registry.datasets.length()
}

public fun get_dataset(registry: &DatasetRegistry, dataset_id: u64): Dataset {
    assert!(dataset_id < registry.datasets.length(), ENotFound);
    registry.datasets[dataset_id]
}

public fun blob_id(registry: &DatasetRegistry, dataset_id: u64): vector<u8> {
    get_dataset(registry, dataset_id).blob_id
}

public fun seal_policy_id(registry: &DatasetRegistry, dataset_id: u64): vector<u8> {
    get_dataset(registry, dataset_id).seal_policy_id
}

public fun price(registry: &DatasetRegistry, dataset_id: u64): u64 {
    get_dataset(registry, dataset_id).price
}

public fun seller(registry: &DatasetRegistry, dataset_id: u64): address {
    get_dataset(registry, dataset_id).seller
}

public fun publish_registry(ctx: &mut TxContext) {
    transfer::share_object(create_registry(ctx));
}

#[test_only]
public fun init_for_testing(ctx: &mut TxContext): DatasetRegistry {
    create_registry(ctx)
}
