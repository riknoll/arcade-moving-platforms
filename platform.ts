namespace movingPlatforms {
    export class Platform extends tiles.TileMap {
        _left = Fx.zeroFx8;
        _top = Fx.zeroFx8;
        _vx = Fx.zeroFx8;
        _vy = Fx.zeroFx8;
        _ax = Fx.zeroFx8;
        _ay = Fx.zeroFx8;
        _fx = Fx.zeroFx8;
        _fy = Fx.zeroFx8;
        kind: number;

        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="x" callInDebugger
        get x(): number {
            return Fx.toFloat(Fx.add(this._left, Fx.div(Fx8(this.width), Fx.twoFx8)));
        }
        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="x"
        set x(v: number) {
            this.left = v - (this.width / 2)
        }

        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="y" callInDebugger
        get y(): number {
            return Fx.toFloat(Fx.add(this._top, Fx.div(Fx8(this.height), Fx.twoFx8)));
        }
        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="y"
        set y(v: number) {
            this.top = v - (this.height / 2)
        }

        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="width" callInDebugger
        get width() {
            return (this._map.width << this.scale)
        }
        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="height" callInDebugger
        get height() {
            return (this._map.height << this.scale);
        }

        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="left" callInDebugger
        get left() {
            return Fx.toFloat(this._left)
        }
        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="left"
        set left(value: number) {
            this._left = Fx8(value);
        }

        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="right" callInDebugger
        get right() {
            return this.left + this.width
        }
        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="right"
        set right(value: number) {
            this.left = value - this.width
        }

        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="top" callInDebugger
        get top() {
            return Fx.toFloat(this._top);
        }
        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="top"
        set top(value: number) {
            this._top = Fx8(value);
        }

        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="bottom" callInDebugger
        get bottom() {
            return this.top + this.height;
        }
        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="bottom"
        set bottom(value: number) {
            this.top = value - this.height;
        }

        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="vx (velocity x)" callInDebugger
        get vx(): number {
            return Fx.toFloat(this._vx)
        }
        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="vx (velocity x)"
        set vx(v: number) {
            this._vx = Fx8(v)
        }

        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="vy (velocity y)" callInDebugger
        get vy(): number {
            return Fx.toFloat(this._vy)
        }
        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="vy (velocity y)"
        set vy(v: number) {
            this._vy = Fx8(v)
        }

        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="ax (acceleration x)" callInDebugger
        get ax(): number {
            return Fx.toFloat(this._ax)
        }
        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="ax (acceleration x)"
        set ax(v: number) {
            this._ax = Fx8(v)
        }

        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="ay (acceleration y)" callInDebugger
        get ay(): number {
            return Fx.toFloat(this._ay)
        }
        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="ay (acceleration y)"
        set ay(v: number) {
            this._ay = Fx8(v)
        }

        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="fx (friction x)" callInDebugger
        get fx(): number {
            return Fx.toFloat(this._fx)
        }
        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="fx (friction x)"
        set fx(v: number) {
            this._fx = Fx8(Math.max(0, v))
        }
        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="fy (friction y)" callInDebugger
        get fy(): number {
            return Fx.toFloat(this._fy)
        }
        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="fy (friction y)"
        set fy(v: number) {
            this._fy = Fx8(Math.max(0, v))
        }

        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="z (depth)"
        set z(v: number) {
            this.renderable.z = v;
        }

        //% group="Physics" blockSetVariable="myPlatform"
        //% blockCombine block="z (depth)"
        get z() {
            return this.renderable.z
        }

        constructor(scale: TileScale = TileScale.Sixteen, kind: number) {
            super(scale);
            this.kind = kind;
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

        protected draw(target: Image, camera: scene.Camera) {
            if (!this.enabled) return;

            // render tile map
            const l = Fx.toInt(this._left) - camera.drawOffsetX;
            const t = Fx.toInt(this._top) - camera.drawOffsetY;

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