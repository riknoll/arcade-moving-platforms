namespace movingPlatforms {
    export class Platform extends tiles.TileMap {
        left = Fx.zeroFx8;
        top = Fx.zeroFx8;
        vx = Fx.zeroFx8;
        vy = Fx.zeroFx8;

        public _map: tiles.TileMapData;

        constructor(scale: TileScale = TileScale.Sixteen) {
            super(scale);
        }

        protected draw(target: Image, camera: scene.Camera) {
            if (!this.enabled) return;

            // render tile map
            const l = Fx.toInt(this.left) - camera.drawOffsetX;
            const t = Fx.toInt(this.top) - camera.drawOffsetY;

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