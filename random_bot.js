
class uuu {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }

    decodeJson(jsonVision) {
        return JSON.parse(jsonVision.replace(/'/g,"\"").replace(/"s/g,"'"));
    }

    think(visionObject) {
        
    }
}

o = {Name: "Charn",
    ID:"KAK"};

inp = "{'Id': -294, 'Name': 'ManualTank', 'Type': 'Tank', 'X': 8.277814865112305, 'Y': -25.688796997070312, 'Heading': 138.75985717773438, 'TurretHeading': 138.75985717773438, 'Health': 5, 'Ammo': 10}"
inp2 = "{'Id': -342, 'Name': '', 'Type': 'HealthPickup', 'X': -24.239286422729492, 'Y': 30.22211265563965, 'Heading': 0.0, 'TurretHeading': 0.0, 'Health': 0, 'Ammo': 0}";

console.log("{'Id': -294, 'Name': 'ManualTank', 'Type': 'Tank', 'X': 8.277814865112305, 'Y': -25.688796997070312, 'Heading': 138.75985717773438, 'TurretHeading': 138.75985717773438, 'Health': 5, 'Ammo': 10}".replace(/'/g,"\""))

