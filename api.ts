
//% block="Moving Platforms"
//% color="#0381a3"
namespace movingPlatforms {
    //% blockId=movingPlatforms_createPlatform
    //% block="create platform $tilemap"
    //% tilemap.shadow=tiles_tilemap_editor
    //% blockSetVariable="myPlatform"
    //% duplicateShadowOnDrag
    //% weight=100
    export function createPlatform(tilemap: tiles.TileMapData) {
        const p = new Platform(tilemap.scale);
        p.setData(tilemap);

        const physics = game.currentScene().physicsEngine as MovingPlatformsPhysics;
        physics.tilemaps.push(p);

        return p;
    }

    //% blockId=movingPlatforms_destroy
    //% block="destroy platform $platform"
    //% platform.shadow=variables_get
    //% platform.defl=myPlatform
    export function destroy(platform: Platform) {
        const physics = game.currentScene().physicsEngine as MovingPlatformsPhysics;
        physics.tilemaps.removeElement(platform);
        platform.renderable.destroy();
    }
}