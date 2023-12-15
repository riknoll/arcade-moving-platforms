
//% block="Moving Platforms"
//% color="#0381a3"
namespace movingPlatforms {
    //% blockId=movingPlatforms_createPlatform
    //% block="create platform $tilemap of kind $kind"
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

        return p.sprite;
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


    /**
     * Check if the given platform is being hit in the given direction
     * @param direction
     */
    //% blockId=movingPlatforms_isHittingPlatform
    //% block="is $sprite hitting $platform $direction"
    //% platform.shadow=variables_get
    //% platform.defl=myPlatform
    //% sprite.shadow=variables_get
    //% sprite.defl=mySprite
    export function isHittingPlatform(sprite: Sprite, platform: Platform,  direction: CollisionDirection) {
        return platformInDirection(sprite, direction) === platform;
    }

    /**
     * returns platform sprite is hitting in given direction, if one exists.
     */
    //% blockId=movingPlatforms_platformInDirection
    //% block="platform $sprite is hitting to $direction"
    //% sprite.shadow=variables_get
    //% sprite.defl=mySprite
    export function platformInDirection(sprite: Sprite, direction: CollisionDirection) {
        const obstacles = movingPlatforms.getObstacles(sprite);
        const inDirection = obstacles[direction];
        return inDirection && inDirection.tilemap;
    }

    /**
     * Run code when two kinds of sprites overlap
     */
    //% blockId=movingPlatforms_onSquish
    //% block="on $sprite of kind $kind squished by $platform"
    //% kind.shadow=spritekind
    //% draggableParameters="reporter"
    export function onSquish(kind: number, handler: (sprite: Sprite, platform: PlatformSprite) => void) {
        if (kind == undefined || !handler) return;
        const physics = game.currentScene().physicsEngine as MovingPlatformsPhysics;
        const sh = physics.squishHandlers; //

        sh.push(
            new SquishHandler(
                kind,
                handler
            )
        );
    }

    /**
     * Run code when two kinds of sprites overlap
     */
    //% blockId=movingPlatforms_onEvent
    //% block="on $sprite of kind $spriteKind $event $platform of kind $platformKind"
    //% spriteKind.shadow=spritekind
    //% platformKind.shadow=movingplatforms_platformkind
    //% draggableParameters="reporter"
    export function onEvent(event: PlatformEvent, spriteKind: number, platformKind: number, handler: (sprite: Sprite, platform: PlatformSprite) => void) {
        const physics = game.currentScene().physicsEngine as MovingPlatformsPhysics;
        physics.addEventHandler(event, spriteKind, platformKind, handler);
    }
}