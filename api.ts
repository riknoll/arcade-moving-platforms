
//% block="Moving Platforms"
//% color="#0381a3"
namespace movingPlatforms {
    //% blockId=movingPlatforms_createPlatform
    //% block="create platform $tilemap"
    //% tilemap.shadow=tiles_tilemap_editor
    //% kind.shadow=movingplatforms_platformkind
    //% blockSetVariable="myPlatform"
    //% duplicateShadowOnDrag
    //% weight=100
    export function createPlatform(tilemap: tiles.TileMapData, kind: number) {
        const p = new Platform(tilemap.scale, kind);
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

    /**
     * Gets the "kind" of platform
     */
    //% shim=KIND_GET
    //% blockId=movingplatforms_platformkind
    //% block="$kind"
    //% kindNamespace=PlatformKind kindMemberName=kind kindPromptHint="e.g. Elevator, Obstacle, etc..."
    export function _platformKind(kind: number): number {
        return kind;
    }
}