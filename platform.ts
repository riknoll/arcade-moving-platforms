namespace movingPlatforms {
    export class Platform extends tiles.TileMap {
        sprite: PlatformSprite;
        kind: number;

        get width() {
            if (!this._map) return 0;
            return this._map.width << this.scale
        }

        get height() {
            if (!this._map) return 0;
            return this._map.height << this.scale
        }

        constructor(data: tiles.TileMapData, scale: TileScale = TileScale.Sixteen, kind: number) {
            super(scale);
            this.setData(data);
            this.kind = kind;
            this.renderable.destroy();
            this.sprite = new PlatformSprite(this);
            this.sprite.z = -1;
            this.sprite.left = 0;
            this.sprite.top = 0;
        }

        setData(data: tiles.TileMapData) {
            super.setData(data);
            if (this.sprite) {
                this.sprite.setDimensions(this.width, this.height);
            }
        }

        getMap() {
            return this._map;
        }

        public isObstacle(col: number, row: number): boolean {
            if (!this.enabled) return false;

            const isOuterTilemap = game.currentScene().tileMap === this;
            if (this._map.isOutsideMap(col, row)) return isOuterTilemap;

            return this._map.isWall(col, row);
        }

        draw(target: Image, camera: scene.Camera) {
            if (!this.enabled) return;

            // render tile map
            const l = Fx.toInt(this.sprite._x) - camera.drawOffsetX;
            const t = Fx.toInt(this.sprite._y) - camera.drawOffsetY;

            const x0 = Math.max(0, -l >> this.scale);
            const xn = Math.min(this._map.width, ((-l + target.width) >> this.scale) + 1);
            const y0 = Math.max(0, -t >> this.scale);
            const yn = Math.min(this._map.height, ((-t + target.height) >> this.scale) + 1);


            for (let x = x0; x <= xn; ++x) {
                for (let y = y0; y <= yn; ++y) {
                    const index = this._map.getTile(x, y);
                    const tile = this._map.getTileImage(index);
                    if (tile) {
                        target.drawTransparentImage(
                            tile,
                            l + (x << this.scale),
                            t + (y << this.scale)
                        );
                    }
                }
            }
        }
    }
}