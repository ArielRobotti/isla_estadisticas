#!/bin/bash
dfx deps pull
dfx deps init icp_ledger --argument "(variant { 
    Init = record {
        minting_account = \"$(dfx --identity icp_minter ledger account-id)\";
        initial_values = vec {};
        send_whitelist = vec {};
        transfer_fee = opt record { e8s = 10_000 : nat64; };
        token_symbol = opt \"LICP\";
        token_name = opt \"Local ICP\"; 
    }
})"
dfx deps deploy