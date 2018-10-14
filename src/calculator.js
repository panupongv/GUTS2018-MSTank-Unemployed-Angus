class Calculator {
    constructor(mainTank){
        this.mainTank = mainTank
    }

    closeToHealthPickup(){
        //waring : may not check all 360 degree
        var h = this.findNearestByType("healthPickup")
        return this.distance(this.mainTank.data.x,h.x,this.mainTank.data.y,h.y) < 30
    }

    shouldTakeHealth(){
        return (this.mainTank.data.health < 2 || this.mainTank.data.ammo <= 5 || this.mainTank.killStack >=  2)
    }

    enoughHealth(){
        return this.mainTank.data.health >= 3
    }

    enoughAmmo(ammo){
        return this.mainTank.data.ammo >= 3
    }

    distance(x1,x2,y1,y2){
        var dis = Math.sqrt((x1 - x2)**2 + (y1 - y2)**2)
        return dis
    }

    findNearestByType(type){
        var obj = null
        var nearest = 10000000000
        switch(type){
            case "tank" : {
                var min = null
                for( var i=0; i< this.otherTanks.length; i++){
                    min = this.distance(this.otherTanks[i].x,this.mainTank.data.x,this.otherTanks[i].y,this.mainTank.data.y)
                    if ( min < nearest ){
                        nearest = min
                        obj = this.otherTanks[i]
                    }
                }
                break;
            }
            case "healthPickup" : {
                var min = null
                for( var i=0; i< this.healthPickups.length; i++){
                    min = this.distance(this.healthPickups[i].x,this.mainTank.data.x,this.healthPickups[i].y,this.mainTank.data.y)
                    if ( min < nearest ){
                        nearest = min
                        obj = this.healthPickups[i]
                    }
                }
                break;
            }
            case "ammoPickup" : {
                var min = null
                for( var i=0; i< this.ammoPickups.length; i++){
                    min = this.distance(this.ammoPickups[i].x,this.mainTank.data.x,this.ammoPickups[i].y,this.mainTank.data.y)
                    if ( min < nearest ){
                        nearest = min
                        obj = this.ammoPickups[i]
                    }
                }
                break;
            }
        }
        return obj
    }

    currentX(){
        return this.mainTank.data.x
    }

    currentY(){
        return this.mainTank.data.y
    }

    degreeBetween(fx,fy,tx,ty){
        var dx = tx-fx;
        var dy = ty - fy;
        // angle in radians
        var angleRadians = Math.atan2(dx, dy);

        // angle in degrees
        var angleDeg = Math.atan2(dx, dy) * 180 / Math.PI + 180 + 90;
        angleDeg = angleDeg > 360 ? angleDeg - 360 : angleDeg
        // if(angleDeg > 180)
        //     angleDeg = -180 + (angleDeg-180)
        return angleDeg
    }

    squarePath(x, y, width=40) {
        // var ar =  [[x-width/2,y-width/x],[x-width/2,y+width/x],[x+width/2,y+width/x],[x+width/2,y-width/x]]

        var ar =  [[x-width/2,y-width/2],[x-width/2,y+width/2],[x+width/2,y+width/2],[x+width/2,y-width/2]];

        return this.rotateToNearestFirst(ar);
    }

    coverPath(){
        return this.rotateToNearestFirst([[-20,-50],[-20,50],[20,50],[20,-50]]);
    }

    rotateToNearestFirst(ar)
    {
        var minDist = 1000
        var minI = 0;
        for(var i = 0 ; i < ar.length ; i++)
        {
            var dist = this.distance(ar[i][0],this.mainTank.data.x,ar[i][1],this.mainTank.data.y);
            if(dist < minDist) {
                minDist = dist;
                minI = i;
            }
        }

        var newAr = []
        for(var j = 0 ; j < ar.length ; j++)
        {
            newAr.push(ar[(minI+j)%ar.length])
        }

        return newAr;
    }

    distanceTo(x,y){
        return this.distance(x, this.mainTank.data.x, y, this.mainTank.data.y)
    }

    diffDegreeAbs(x,y, degree){
        var degree1 = this.degreeBetween(this.mainTank.data.x, this.mainTank.data.y, x, y);
        var diffDegree = Math.abs(degree1 - degree);
        return diffDegree;
    }
}

module.exports = Calculator;