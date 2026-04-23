import Map "mo:map/Map";
import { phash } "mo:map/Map";
import Types "types";
import { now } "mo:core/Time";


module {
	
	public type User = Types.User;
	public type UserDB = Types.UserDB;

	public func initState(principal: Principal): UserDB {
		let firstAdmin: User = {Types.baseUser with name = ?"Admin Deployer"; principal; registrationDate = now()};
		{
			users = Map.new<Principal, User>();
			admins = [firstAdmin]
		}
	};


	public func signUp(db: UserDB, caller: Principal, name: Text): {#Ok: User; #Err: Text} {
		if (Map.has(db.users, phash, caller)){return #Err("Caller is allready user")};
		let newUser: User = {
			Types.baseUser with 
			name = ?name; 
			principal = caller; 
			registrationDate = now()
		};
		ignore Map.put(db.users, phash, caller, newUser);
		#Ok(newUser)
	};

	public func login(db: UserDB, caller: Principal): ?User {
		Map.get(db.users, phash, caller)
	};

	

};
