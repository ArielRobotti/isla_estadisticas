import Map "mo:map/Map";
import Principal "mo:core/Principal";
import Shared "../shared";

module {
	public type User = {
		name : ?Text;
		email: ?Text;
		registrationDate: Int;
		principal: Principal;
		fortniteUserName : ?Text;
		fortniteID : ?Text;
		avatar : ?Blob;
		extraData : Shared.MetadataArray;
	};

	public type UserEditableData= {
		name : Text;
		email: Text;
		fortniteUserName : Text;
		fortniteID : Text;
		extraData : Shared.MetadataArray;
	};


	public type UserDB = {
		users : Map.Map<Principal, User>;
		var admins : [User];
	};

	public let baseUser = {
		avatar : ?Blob = null;
    extraData : Shared.MetadataArray = [];
    fortniteID : ?Text = null;
    fortniteUserName : ?Text = null;
    name : ?Text = null;
		email = null;
	}

};
