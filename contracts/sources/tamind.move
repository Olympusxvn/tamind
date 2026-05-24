/// Package init — publish shared DatasetRegistry.
module tamind::tamind;

use tamind::registry::{Self, DatasetRegistry};

public struct AdminCap has key, store {
    id: UID,
}

fun init(ctx: &mut TxContext) {
    registry::publish_registry(ctx);
    transfer::transfer(
        AdminCap { id: object::new(ctx) },
        ctx.sender(),
    );
}

entry fun register_dataset_entry(
    registry: &mut DatasetRegistry,
    title: vector<u8>,
    blob_id: vector<u8>,
    seal_policy_id: vector<u8>,
    price: u64,
    clock: &sui::clock::Clock,
    ctx: &mut TxContext,
) {
    let _id = registry::register_dataset(
        registry,
        title,
        blob_id,
        seal_policy_id,
        price,
        clock.timestamp_ms(),
        ctx,
    );
}

entry fun purchase_dataset_entry(
    registry: &DatasetRegistry,
    dataset_id: u64,
    payment: sui::coin::Coin<sui::sui::SUI>,
    ctx: &mut TxContext,
) {
    let receipt = tamind::escrow::purchase_dataset(registry, dataset_id, payment, ctx);
    tamind::escrow::deliver_receipt(receipt, ctx);
}
