import Map "mo:map/Map";
import { phash } "mo:map/Map";
import Types "types";
import { now } "mo:core/Time";

module {

	public type User = Types.User;
	public type UserEditableData = Types.UserEditableData;
	public type UserDB = Types.UserDB;

	public func initState(principal : Principal) : UserDB {
		let firstAdmin : User = {
			Types.baseUser with name = ?"Admin Deployer";
			principal;
			registrationDate = now();
		};
		{
			users = Map.new<Principal, User>();
			admins = [firstAdmin];
		};
	};

	public func signUp(db : UserDB, caller : Principal, name : Text) : {
		#Ok : User;
		#Err : Text;
	} {
		if (Map.has(db.users, phash, caller)) {
			return #Err("Caller is allready user");
		};
		let newUser : User = {
			Types.baseUser with
			name = ?name;
			principal = caller;
			registrationDate = now();
		};
		ignore Map.put(db.users, phash, caller, newUser);
		#Ok(newUser);
	};

	public func login(db : UserDB, caller : Principal) : ?User {
		Map.get(db.users, phash, caller);
	};

	public func editProfile(db : UserDB, caller : Principal, data : UserEditableData) : {
		#Ok : User;
		#Err : Text;
	} {
		switch (Map.get(db.users, phash, caller)) {
			case null return #Err("Caller is not User");
			case (?user) {
				let updatedUser: User = {
					user with
					name = ?data.name;
					email = ?data.email;
					fortniteUserName = ?data.fortniteUserName;
					fortniteID = ?data.fortniteID;
					extraData = data.extraData;
				};
				ignore Map.put(db.users, phash, caller, updatedUser);
				#Ok(updatedUser)
			};
		};
	};

	public func loadAvatar(db: UserDB, caller: Principal, avatar: ?Blob) : {#Ok: User; #Err: Text} {
		switch (Map.get(db.users, phash, caller)) {
			case null return #Err("Caller is not user");
			case ( ?user ) {
				let updatedUser = {user with avatar};
				ignore Map.put(db.users, phash, caller, updatedUser);
				return #Ok(updatedUser)
			} 
		}
	};

	public func isUser(db: UserDB, p: Principal): Bool {
		Map.has(db.users, phash, p)
	};

	public func getUserName(db: UserDB, p: Principal): {#Ok: Text; #Err} {
		switch (Map.get(db.users, phash, p)) {
			case null #Err;
			case ( ?user ) #Ok(switch(user.name) {case null ""; case (?name) name})
		}
	};

};
