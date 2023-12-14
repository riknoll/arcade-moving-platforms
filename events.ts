// Add your code here

namespace movingPlatforms {

    export class SquishHandler {
        constructor (
            public kind: number,
            public handler: (sprite: Sprite, platform: Platform) => void,
        ) { }
    }
}