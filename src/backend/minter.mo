import ICRC2 "./interfaces/icrc2";
import User "./modules/user";
import Map "mo:map/Map";
import {n64hash } "mo:map/Map";
import Types "types";
import Principal "mo:core/Principal";
import { now } "mo:core/Time";
import { print } "mo:core/Debug";
import Nat "mo:core/Nat";
import Random "mo:random/Rand";
import Iter "mo:core/Iter";

shared ({caller = DEPLOYER }) persistent actor class() = This {
  
 //-------------------------- Tipos ---- ----------------------------------//

  type Account = ICRC2.Account;
  type Coupon = Types.Coupon;
  public type User = User.User;

 //-------------------------- Constantes ----------------------------------//

  let MinterSubaccount: Blob =  "minter00000000000000000000000000";
  let FeeCollectorSubaccount: Blob = "feecollector00000000000000000000";
  let MinterAccount: Account = {owner = Principal.fromActor(This); subaccount = ?MinterSubaccount};
  let FeeCollectorAccount: Account = {owner = Principal.fromActor(This); subaccount = ?FeeCollectorSubaccount};

  let NXST_ledger = Types.ledgerActor("ls35s-zaaaa-aaaap-qumfa-cai");

 //------------------- Objetos no persistentes ----------------------------//
  transient let rand = Random.Rand(); // Autoreferencial jeje https://mops.one/random
  rand.setRange(0, 9999999999999);

 //--------------------------- Datos persistentes -------------------------//


  let availableCoupons = Map.new<Nat64, Coupon>();
  let claimedCoupons = Map.new<Nat64, Coupon>();
  let userDB = User.initState(DEPLOYER);
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

  func _getUserSubaccount(p: Principal) : Blob {
    Principal.toLedgerAccount(p, null)
  };

  func getUserAccount(p: Principal): Account {
    {owner = Principal.fromActor(This); subaccount = ?_getUserSubaccount(p)}
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
  public shared ({ caller }) func generateCoupons({qty: Nat; value: Nat }): async [Nat] {
    assert (User.isAdmin(userDB, caller));
    let codes = await rand.randArray(qty);
    for (code in codes.vals()) {
      let coupon = {id = Nat.toNat64(code); value; claimed = null};
      ignore Map.put(availableCoupons, n64hash, coupon.id, coupon);
    };
    codes
  };

  public shared ({ caller }) func addAdmin(user: Principal): async {#Ok; #Err: Text} {
    if (not User.isAdmin(userDB, caller)) return #Err("Caller is not admin");
    User.addAdminUser(userDB, user);
  };

  public shared composite query ({ caller }) func getCollectedFees(): async Nat{
    assert (User.isAdmin(userDB, caller));
    await NXST_ledger.icrc1_balance_of(FeeCollectorAccount)
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

  public shared query ({ caller }) func getUserSubaccount(u: Principal): async Blob {
    assert (Principal.isController(caller));
    _getUserSubaccount(u)
  };

  public shared query ({ caller }) func getCouponsInfo(): async [Coupon] {
    assert (Principal.isController(caller));
    Iter.toArray(Map.vals(availableCoupons))
  };
  
 // -------------------------- User Functions ----------------------------//

  public shared ({ caller }) func signUp(name: Text): async {#Ok: User; #Err: Text}{
    User.signUp(userDB, caller, name)
  };

  public shared query ({ caller }) func login(): async ?User {
    User.login(userDB, caller)
  };

  public shared ({ caller }) func imAdmin(): async Bool {
    User.isAdmin(userDB, caller)
  };

  public shared ({ caller }) func editProfile(data: User.UserEditableData): async {#Ok: User; #Err: Text}{
    User.editProfile(userDB, caller, data)
  };

  public shared ({ caller }) func loadAvatar(avatar: ?Blob): async {#Ok: User; #Err: Text}{
    User.loadAvatar(userDB, caller, avatar);
  };

  public shared composite query ({ caller }) func balance(): async Nat{
    let account: Account = {
      owner = Principal.fromActor(This);
      subaccount = ?_getUserSubaccount(caller)
    };
    await NXST_ledger.icrc1_balance_of(account)
  };

  public shared ({ caller }) func redeem_coupon(couponId: Nat64) : async {#Ok; #Err: Text} {
    if (Principal.isAnonymous(caller)){
      return #Err("Anonymous caller")
    };
    let to: Account = {
      owner = Principal.fromActor(This);
      subaccount = ?_getUserSubaccount(caller)
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

  public shared ({ caller }) func withdraw({amount: Nat; to: Text; subaccount: ?Blob}): async {#Ok: Nat; #Err: Text}{
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
          from_subaccount = ?_getUserSubaccount(caller);
          memo = generateMemo();
          to = {owner = Principal.fromText(to); subaccount}
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

  public shared query ({ caller }) func getSubaccount(): async Blob {
    _getUserSubaccount(caller)
  };

  public shared query ({ caller }) func icpAccountId(): async Blob {
    (Principal.toLedgerAccount(caller, ?_getUserSubaccount(caller)))
  };


  public query func getUserName(p: Text): async {#Ok: Text; #Err} {
    User.getUserName(userDB, Principal.fromText(p))
  };

  public shared ({ caller }) func sendNXST({to: Text; amount: Nat}): async ICRC2.Result_2 {
    let transferArg: ICRC2.TransferArg = {
      amount : Nat;
      created_at_time = null;
      fee = null;
      from_subaccount = ?_getUserSubaccount(caller);
      memo = generateMemo();
      to = getUserAccount(Principal.fromText(to))
    };
    await NXST_ledger.icrc1_transfer(transferArg)
  };

  
  
};
