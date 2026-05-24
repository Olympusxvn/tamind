/// Escrow purchase flow — buyer pays SUI, receives PurchaseReceipt for Seal decrypt.
module tamind::escrow;

use sui::coin::{Self, Coin};
use sui::event;
use sui::sui::SUI;
use tamind::registry::{Self, DatasetRegistry};

const EInsufficientPayment: u64 = 10;
const ENotFound: u64 = 11;

public struct PurchaseReceipt has key, store {
    id: UID,
    dataset_id: u64,
    buyer: address,
    blob_id: vector<u8>,
    seal_policy_id: vector<u8>,
}

public struct PurchaseEvent has copy, drop {
    dataset_id: u64,
    buyer: address,
    blob_id: vector<u8>,
    seal_policy_id: vector<u8>,
    price: u64,
}

public fun purchase_dataset(
    registry: &DatasetRegistry,
    dataset_id: u64,
    payment: Coin<SUI>,
    ctx: &mut TxContext,
): PurchaseReceipt {
    let price = registry::price(registry, dataset_id);
    assert!(payment.value() >= price, EInsufficientPayment);

    let seller = registry::seller(registry, dataset_id);
    let blob_id = registry::blob_id(registry, dataset_id);
    let seal_policy_id = registry::seal_policy_id(registry, dataset_id);
    let buyer = ctx.sender();

    let mut paid = payment;
    let fee = coin::split(&mut paid, price, ctx);
    transfer::public_transfer(fee, seller);
    if (coin::value(&paid) > 0) {
        transfer::public_transfer(paid, buyer);
    } else {
        coin::destroy_zero(paid);
    };

    let receipt = PurchaseReceipt {
        id: object::new(ctx),
        dataset_id,
        buyer,
        blob_id,
        seal_policy_id,
    };

    event::emit(PurchaseEvent {
        dataset_id,
        buyer,
        blob_id,
        seal_policy_id,
        price,
    });

    receipt
}

public fun deliver_receipt(receipt: PurchaseReceipt, ctx: &TxContext) {
    transfer::public_transfer(receipt, ctx.sender());
}

public fun receipt_dataset_id(receipt: &PurchaseReceipt): u64 {
    receipt.dataset_id
}

public fun receipt_buyer(receipt: &PurchaseReceipt): address {
    receipt.buyer
}

public fun receipt_seal_policy_id(receipt: &PurchaseReceipt): vector<u8> {
    receipt.seal_policy_id
}

public fun receipt_blob_id(receipt: &PurchaseReceipt): vector<u8> {
    receipt.blob_id
}

#[test]
fun test_purchase() {
    use sui::test_scenario::{Self as ts};

    let seller = @0xA;
    let buyer = @0xB;
    let mut scenario = ts::begin(seller);
    {
        let mut registry = registry::init_for_testing(scenario.ctx());
        let blob = b"blob123";
        let policy = b"policy456";
        let title = b"Sui txs 7d";
        registry::register_dataset(
            &mut registry,
            title,
            blob,
            policy,
            1_000_000_000,
            0,
            scenario.ctx(),
        );
        ts::return_shared(registry);
    };

    scenario.next_tx(buyer);
    {
        let registry = ts::take_shared<DatasetRegistry>(&scenario);
        let payment = coin::mint_for_testing<SUI>(1_000_000_000, scenario.ctx());
        let receipt = purchase_dataset(&registry, 0, payment, scenario.ctx());
        assert!(receipt.dataset_id == 0);
        assert!(receipt.buyer == buyer);
        transfer::transfer(receipt, buyer);
        ts::return_shared(registry);
    };

    ts::end(scenario);
}
