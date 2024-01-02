// Auto-generated code. Do not edit.
movingPlatforms.__init();
namespace myTiles {

    export const transparency16 = img`
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
`;

    export const tile1 = img`
c c c c c c c c c c c c c c c c
e e e e e e e e e e e c e e e e
e e e e e e e e e e e c e e e e
e e e e e e e e e e e c e e e e
e e e e e e e e e e e c e e e e
e e e e e e e e e e e c e e e e
e e e e e e e e e e e c e e e e
e e e e e e e e e e e c e e e e
c c c c c c c c c c c c c c c c
e e e e c e e e e e e e e e e e
e e e e c e e e e e e e e e e e
e e e e c e e e e e e e e e e e
e e e e c e e e e e e e e e e e
e e e e c e e e e e e e e e e e
e e e e c e e e e e e e e e e e
e e e e c e e e e e e e e e e e
`;

    helpers._registerFactory("tilemap", function(name: string) {
        switch(helpers.stringTrim(name)) {
            case "level1":
            case "level1":return tiles.createTilemap(hex`1000100001010101010101010101010101010101010000000000000000000000000000010100000000000000000000000000000101000000000000000000000000000001010000000000000000000000000000010100000000000000000000000000000101000000000000000000000000000001010000000000000000000000000000010100000000000000000000000000000101000000000000000000000000000001010000000000000000000000000000010100000000000000000000000000000101000000000000000000000000000001010000000000000000000000000000010100000000000000000000000000000101010101010101010101010101010101`, img`
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
2 . . . . . . . . . . . . . . 2
2 . . . . . . . . . . . . . . 2
2 . . . . . . . . . . . . . . 2
2 . . . . . . . . . . . . . . 2
2 . . . . . . . . . . . . . . 2
2 . . . . . . . . . . . . . . 2
2 . . . . . . . . . . . . . . 2
2 . . . . . . . . . . . . . . 2
2 . . . . . . . . . . . . . . 2
2 . . . . . . . . . . . . . . 2
2 . . . . . . . . . . . . . . 2
2 . . . . . . . . . . . . . . 2
2 . . . . . . . . . . . . . . 2
2 . . . . . . . . . . . . . . 2
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
`, [myTiles.transparency16,myTiles.tile1], TileScale.Sixteen);
            case "level2":
            case "level2":return tiles.createTilemap(hex`0400010001010101`, img`
2 2 2 2
`, [myTiles.transparency16,myTiles.tile1], TileScale.Sixteen);
        }
        return null;
    })

    helpers._registerFactory("tile", function(name: string) {
        switch(helpers.stringTrim(name)) {
            case "transparency16":return transparency16;
            case "myTile":
            case "tile1":return tile1;
        }
        return null;
    })

}
// Auto-generated code. Do not edit.

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    mySprite.vy = -200
})
function moveTo (x: number, y: number, speed: number, sprite: Sprite) {
    time = distance(sprite, x, y) / speed * 1000
    sprite.setVelocity(Math.cos(angle(sprite, x, y)) * speed, Math.sin(angle(sprite, x, y)) * speed)
    while (distance(sprite, x, y) > 1) pause(1)
    sprite.setVelocity(0, 0)
    sprite.setPosition(x, y)
}
function distance (sprite: Sprite, x: number, y: number) {
    return Math.sqrt((x - sprite.x) ** 2 + (y - sprite.y) ** 2)
}
function angle (sprite: Sprite, x: number, y: number) {
    return Math.atan2(y - sprite.y, x - sprite.x)
}
let time = 0
let mySprite: Sprite = null
mySprite = sprites.create(img`
    3 3 3 3 3 3 3 3
    3 3 3 3 3 3 3 3
    3 3 3 3 3 3 3 3
    3 3 3 3 3 3 3 3
    3 3 3 3 3 3 3 3
    3 3 3 3 3 3 3 3
    3 3 3 3 3 3 3 3
    3 3 3 3 3 3 3 3
    3 3 3 3 3 3 3 3
    3 3 3 3 3 3 3 3
    3 3 3 3 3 3 3 3
    3 3 3 3 3 3 3 3
    `, SpriteKind.Player)
controller.moveSprite(mySprite, 100, 0)
scene.setBackgroundColor(9)
mySprite.ay = 1000
tiles.setCurrentTilemap(tilemap`level1`)
let myPlatform = movingPlatforms.createPlatform(tiles.createTilemap(hex`0400010001010101`, img`
2 2 2 2
`, [myTiles.transparency16,myTiles.tile1], TileScale.Sixteen), PlatformKind.Platform)
myPlatform.setPosition(80, 80)
forever(function () {
    moveTo(120, 120, 40, myPlatform)
    moveTo(60, 60, 40, myPlatform)
})
scene.cameraFollowSprite(mySprite)
// movingPlatforms._enableDebug()