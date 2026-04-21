import ICRC2 "./interfaces/icrc2";
import Map "mo:map/Map";
import {phash; ihash; n64hash } "mo:map/Map";
import Types "types";
import Principal "mo:core/Principal";
import { now } "mo:core/Time";
import { print } "mo:core/Debug";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Random "mo:core/Random";
import Iter "mo:core/Iter";

persistent actor This = {
  
 //-------------------------- Tipos ---- ----------------------------------//

  type Account = ICRC2.Account;
  type Coupon = Types.Coupon;

 //-------------------------- Constantes ----------------------------------//

  let MinterSubaccount: Blob =  "minter00000000000000000000000000";
  let FeeCollectorSubaccount: Blob = "feecollector00000000000000000000";
  let MinterAccount: Account = {owner = Principal.fromActor(This); subaccount = ?MinterSubaccount};
  let FeeCollectorAccount: Account = {owner = Principal.fromActor(This); subaccount = ?FeeCollectorSubaccount};

  let NXST_ledger = Types.ledgerActor("ls35s-zaaaa-aaaap-qumfa-cai");

 //--------------------------- Datos persistentes -------------------------//

  let availableCoupons = Map.new<Nat64, Coupon>();
  let claimedCoupons = Map.new<Nat64, Coupon>();
 //------------------------------------------------------------------------//

  func mintNXST(amount: Nat, to: Account): async ICRC2.Result_2 {
    await NXST_ledger.icrc1_transfer({
      amount; 
      to; 
      from_subaccount = ?MinterSubaccount; 
      fee = null; 
      memo = null;
      created_at_time = null
    })
  };

  func getUserSubacount(p: Principal) : Blob {
    Principal.toLedgerAccount(p, null)
  };

  func getUserAccount(p: Principal): Account {
    {owner = Principal.fromActor(This); subaccount = ?getUserSubacount(p)}
  };

  func checkWithdraw(_user: Principal, _amount: Nat): {#Ok; #Err: Text} {
    //TODO
    #Ok
  };

  func generateMemo(): ?Blob {
    //TODO
    null
  };

 //--------------------------- Admin functions ---------------------------//
  public shared ({ caller }) func generateCoupons({qty: Nat; value: Nat }): async [Nat64] {
    assert (Principal.isController(caller));
    var i = qty;
    var arrayCodes: [Nat64] = [];
    // let firstCode = now();
    while (i > 0){
      let rand = await Random.nat64();
      // let digits: Nat64 = 8;
      // let baseCode = rand % 10 ** digits;
      // let code: Nat64 = baseCode + (if(baseCode < 10 ** digits) 10 ** digits else 0);
      let coupon: Coupon = {id = rand; value; claimed = null};
      ignore Map.put(availableCoupons, n64hash, coupon.id, coupon);
      arrayCodes := Array.concat(arrayCodes, [rand]);
      i -= 1;
    };
    arrayCodes
  };

  public shared ({ caller }) func burnFees(): async {#Ok: Nat; #Err: ICRC2.TransferError} {
    assert (Principal.isController(caller));

    let fee = await NXST_ledger.icrc1_fee();
    let availableBalance = await NXST_ledger.icrc1_balance_of(FeeCollectorAccount);
    let transferArg: ICRC2.TransferArg = {
      amount = availableBalance - fee;
      created_at_time = null;
      fee = null;
      from_subaccount = ?FeeCollectorSubaccount;
      memo = generateMemo();
      to = MinterAccount;
    }; 
    await NXST_ledger.icrc1_transfer(transferArg);
  };

  public shared ({ caller }) func getCouponsInfo(): async [Coupon] {
    assert (Principal.isController(caller));
    Iter.toArray(Map.vals(availableCoupons))
  };
  
 // -------------------------- User Functions ----------------------------//

  public shared composite query ({ caller }) func balance(): async Nat{
    let account: Account = {
      owner = Principal.fromActor(This);
      subaccount = ?getUserSubacount(caller)
    };
    await NXST_ledger.icrc1_balance_of(account)
  };

  public shared ({ caller }) func redeem_coupon(couponId: Nat64) : async {#Ok; #Err: Text} {
    let to: Account = {
      owner = Principal.fromActor(This);
      subaccount = ?getUserSubacount(caller)
    };
    let coupon = switch (Map.remove(availableCoupons, n64hash, couponId)){
      case null return #Err("Coupon code invalid");
      case (?coupon) { coupon }
    };

    let mintResponse = await mintNXST(coupon.value, to);
    switch mintResponse {
      case (#Err(e)) {
        print(debug_show(e));
        ignore Map.put(availableCoupons, n64hash, couponId, coupon);
        return #Err("MintError")
      };
      case (#Ok(blockIndex)) {
        ignore Map.put(
          claimedCoupons,
          n64hash,
          couponId,
          {
            coupon with 
            claimed = ?{ blockIndex; claimer = caller; date = now() }
          }
        );
        return #Ok
      }
    }
  };

  public shared ({ caller }) func withdraw({amount: Nat; to: Principal; subaccount: ?Blob}): async {#Ok: Nat; #Err: Text}{
    switch (checkWithdraw(caller, amount)) {
      case (#Err(e)) return #Err(e);
      case _ {
        let fee = await NXST_ledger.icrc1_fee();
        let availableBalance = await NXST_ledger.icrc1_balance_of(getUserAccount(caller));

        if(amount > (availableBalance - fee: Nat)) {
          return #Err("Efective available balance: " # Nat.toText(availableBalance - fee: Nat))
        };
        let transferArg: ICRC2.TransferArg = {
          amount : Nat;
          created_at_time = null;
          fee = null;
          from_subaccount = ?getUserSubacount(caller);
          memo = generateMemo();
          to = {owner = to; subaccount}
        };
        let trasferResult = await NXST_ledger.icrc1_transfer(transferArg);
        switch trasferResult {
          case (#Err(e)) {
            print(debug_show(e));
            return #Err("Transfer Error")
          };
          case (#Ok(blockInmdex)) #Ok(blockInmdex)
        }
      }
    };
  };

  public shared ({ caller }) func getSubaccount(): async Blob {
    getUserSubacount(caller)
  };

  public shared ({ caller }) func sendNXST({to: Principal; amount: Nat}): async ICRC2.Result_2 {
    let transferArg: ICRC2.TransferArg = {
      amount : Nat;
      created_at_time = null;
      fee = null;
      from_subaccount = ?getUserSubacount(caller);
      memo = generateMemo();
      to = getUserAccount(to)
    };
    await NXST_ledger.icrc1_transfer(transferArg)
  };
  
  
  
};
