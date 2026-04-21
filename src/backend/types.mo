import ICRC2 "./interfaces/icrc2";
import Principal "mo:core/Principal";
module {
    public type Coupon = {
        id: Nat64;
        value: Nat;
        claimed: ?{claimer: Principal; date: Int; blockIndex: Nat};
    };
    public func ledgerActor(cid: Text): ICRC2.LedgerActor {
        actor(cid)
    } 
}