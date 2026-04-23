import Map "mo:map/Map";

module {
    public type Key = Text;
    public type Value = {
        #Text: Text;
        #Nat: Nat;
        #Blob: Blob;
        #Principal: Principal;
        #Bool: Bool;
        #TextArray: [Text];
        #NatArray: [Nat];
        #BlobArray: [Blob];
        #PrincipalArray: [Principal];
        #BoolArray: [Bool];
    };
    public type MetadataItem = (Key, Value);
    public type MetadataArray = [(Key, Value)];
    public type MetadataMap = Map.Map<Key, Value>;
    

}