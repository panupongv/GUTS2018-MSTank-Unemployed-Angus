class TankData {
    constructor(actionParams) {
        this.updateData(actionParams);
    }

    updateData(actionParams) {
        this.x = actionParams["X"];
        this.y = actionParams["Y"];
        this.id = actionParams["Id"];
        this.name = actionParams["Name"];
        this.type = actionParams["Type"];
        this.heading = actionParams["Heading"];
        this.turretHeading = actionParams["TurretHeading"];
        this.health = actionParams["Health"];
        this.ammo = actionParams["Ammo"];
        this.updateTime = Date.now();
    }

    isOutDate(){
        return (Date.now() - this.updateTime) >= 500;
    }
}

module.exports = TankData;