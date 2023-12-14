namespace movingPlatforms {
    export enum PlatformEvent {
        //% block="collides with"
        Collide,
        //% block="is pushed by"
        Push,
        //% block="is squished by"
        Squish,
        //% block="rides"
        Ride,
    }

    export class EventHandler {
        constructor(
            public event: PlatformEvent,
            public spriteKind: number,
            public platformKind: number,
            public handler: (sprite: Sprite, platform: Platform) => void
        ) {}
    }

    export class SquishHandler {
        constructor (
            public kind: number,
            public handler: (sprite: Sprite, platform: Platform) => void,
        ) { }
    }
}