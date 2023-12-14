namespace movingPlatforms {
    export class Obstacle extends sprites.StaticObstacle {
        tilemap: Platform;

        constructor(image: Image, top: number, left: number, layer: number, tileIndex?: number, tilemap?: Platform) {
            super(image, top, left, layer, tileIndex);
            this.tilemap = tilemap;
        }
    }
}