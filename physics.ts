namespace movingPlatforms {
    export let debug = false;
    const OBSTACLE_DATA_KEY = "%OBSTACLE_DATA_KEY"

    /**
    * A physics engine that does simple AABB bounding box check
    */
    class MovingPlatformsPhysics extends ArcadePhysicsEngine {
        tilemaps: Platform[];

        constructor(maxVelocity = 500, minSingleStep = 2, maxSingleStep = 4) {
            super(maxVelocity, minSingleStep, maxSingleStep);
            this.tilemaps = [];
        }

        move(dt: number) {
            // Sprite movement logic is done in milliseconds to avoid rounding errors with Fx8 numbers
            const dtMs = Math.min(MAX_TIME_STEP, dt * 1000);
            const dt2 = Math.idiv(dtMs, 2);

            const scene = game.currentScene();

            const tileMap = scene.tileMap;
            const movingSprites = this.sprites
                .map(sprite => this.createMovingSprite(sprite, dtMs, dt2));

            // clear obstacles if moving on that axis
            this.sprites.forEach(s => {
                if (s.vx || s.vy) clearObstacles(s);
                else {
                    for (const ob of getObstacles(s)) {
                        if (ob && (ob.tilemap.vx || ob.tilemap.vy)) {
                            clearObstacles(s);
                            break;
                        }
                    }
                }
            });

            this.map.clear();
            this.map.resizeBuckets(this.sprites);

            const MAX_STEP_COUNT = Fx.toInt(
                Fx.idiv(
                    Fx.imul(
                        Fx.div(
                            this.maxVelocity,
                            this.minSingleStep
                        ),
                        dtMs
                    ),
                    1000
                )
            );
            const overlapHandlers = scene.overlapHandlers.slice();

            // buffers store the moving sprites on each step; switch back and forth between the two
            let selected = 0;
            let buffers = [movingSprites, []];
            for (let count = 0; count < MAX_STEP_COUNT && buffers[selected].length !== 0; ++count) {
                const currMovers = buffers[selected];
                selected ^= 1;
                const remainingMovers = buffers[selected];

                for (let ms of currMovers) {
                    const s = ms.sprite;
                    // if still moving and speed has changed from a collision or overlap;
                    // reverse direction if speed has reversed
                    if (ms.cachedVx !== s._vx) {
                        if (s._vx == Fx.zeroFx8) {
                            ms.dx = Fx.zeroFx8;
                        } else if (s._vx < Fx.zeroFx8 && ms.cachedVx > Fx.zeroFx8
                            || s._vx > Fx.zeroFx8 && ms.cachedVx < Fx.zeroFx8) {
                            ms.dx = Fx.neg(ms.dx);
                            ms.xStep = Fx.neg(ms.xStep);
                        }

                        ms.cachedVx = s._vx;
                    }
                    if (ms.cachedVy !== s._vy) {
                        if (s._vy == Fx.zeroFx8) {
                            ms.dy = Fx.zeroFx8;
                        } else if (s._vy < Fx.zeroFx8 && ms.cachedVy > Fx.zeroFx8
                            || s._vy > Fx.zeroFx8 && ms.cachedVy < Fx.zeroFx8) {
                            ms.dy = Fx.neg(ms.dy);
                            ms.yStep = Fx.neg(ms.yStep);
                        }

                        ms.cachedVy = s._vy;
                    }

                    // identify how much to move in this step
                    const stepX = Fx.abs(ms.xStep) > Fx.abs(ms.dx) ? ms.dx : ms.xStep;
                    const stepY = Fx.abs(ms.yStep) > Fx.abs(ms.dy) ? ms.dy : ms.yStep;
                    ms.dx = Fx.sub(ms.dx, stepX);
                    ms.dy = Fx.sub(ms.dy, stepY);

                    s._lastX = s._x;
                    s._lastY = s._y;
                    s._x = Fx.add(s._x, stepX);
                    s._y = Fx.add(s._y, stepY);

                    if (!(s.flags & SPRITE_NO_SPRITE_OVERLAPS)) {
                        this.map.insertAABB(s);
                    }
                    if (tileMap && tileMap.enabled) {
                        this.platformCollisions(ms, [tileMap as Platform].concat(this.tilemaps));
                    }

                    // check for screen edge collisions
                    const bounce = s.flags & sprites.Flag.BounceOnWall;
                    if (s.flags & sprites.Flag.StayInScreen || (bounce && !tileMap)) {
                        this.screenEdgeCollisions(ms, bounce, scene.camera);
                    }

                    // if sprite still needs to move, add it to the next step of movements
                    if (Fx.abs(ms.dx) > MIN_MOVE_GAP || Fx.abs(ms.dy) > MIN_MOVE_GAP) {
                        remainingMovers.push(ms);
                    }
                }

                // this step is done; check collisions between sprites
                this.spriteCollisions(currMovers, overlapHandlers);
                // clear moving sprites buffer for next step
                while (currMovers.length) currMovers.pop();
            }

            for (const tm of this.tilemaps) {
                if (tm.vx || tm.vy) {
                    const nonRiders: Sprite[] = [];
                    const riders: Sprite[] = [];

                    let dx = Fx.idiv(
                        Fx.imul(
                            tm.vx,
                            dtMs
                        ),
                        1000
                    );

                    let dy = Fx.idiv(
                        Fx.imul(
                            tm.vy,
                            dtMs
                        ),
                        1000
                    );


                    for (const sprite of this.sprites) {
                        let isRider = false;
                        for (const ob of getObstacles(sprite)) {
                            if (ob && ob.tilemap === tm) {
                                isRider = true;
                                if (movingPlatforms.debug) {
                                    if (___overlapsTilemap(sprite, tm)) {
                                        console.log("RIDER overlapping before")
                                    }
                                }
                                riders.push(sprite);
                                this.moveSprite(sprite, dx, dy);
                                break;
                            }
                        }
                        if (!isRider && !(sprite.flags & (sprites.Flag.GhostThroughWalls | sprites.Flag.IsClipping))) {
                            nonRiders.push(sprite);
                        }
                    }

                    let compX = Fx.compare(dx, Fx.zeroFx8);
                    let compY = Fx.compare(dy, Fx.zeroFx8);

                    while (compX !== 0 || compY !== 0) {
                        let ddx = Fx.zeroFx8;
                        if (compX < 0) {
                            ddx = Fx.max(dx, Fx.neg(Fx.oneFx8));
                            dx = Fx.sub(dx, ddx);
                        }
                        else if (compX > 0) {
                            ddx = Fx.min(dx, Fx.oneFx8);
                            dx = Fx.sub(dx, ddx);
                        }

                        let ddy = Fx.zeroFx8;
                        if (compY < 0) {
                            ddy = Fx.max(dy, Fx.neg(Fx.oneFx8));
                            dy = Fx.sub(dy, ddy);
                        }
                        else if (compY > 0) {
                            ddy = Fx.min(dy, Fx.oneFx8);
                            dy = Fx.sub(dy, ddy);
                        }

                        tm.left = Fx.add(ddx, tm.left);
                        tm.top = Fx.add(ddy, tm.top);

                        for (const sprite of nonRiders) {
                            let wasPushed = false;
                            if (compX !== 0) {
                                if (___overlapsTilemap(sprite, tm)) {
                                    sprite._x = Fx.add(ddx, sprite._x);
                                    wasPushed = true;
                                }
                            }
                            if (compY !== 0) {
                                if (___overlapsTilemap(sprite, tm)) {
                                    sprite._y = Fx.add(ddy, sprite._y);
                                    wasPushed = true;
                                }
                            }

                            let squished = false;

                            if (wasPushed) {
                                if (movingPlatforms.debug) {
                                    console.log("pushed")
                                }
                                for (const otherMap of this.tilemaps) {
                                    if (otherMap === tm) continue;

                                    if (___overlapsTilemap(sprite, otherMap)) {
                                        squished = true;
                                        break;
                                    }
                                }

                                if (!squished) {
                                    if (___overlapsTilemap(sprite, tileMap as Platform)) {
                                        squished = true;
                                    }
                                }

                                if (squished) {
                                    sprite.flags |= sprites.Flag.IsClipping;
                                    if (movingPlatforms.debug) {
                                        console.log("squished!")
                                    }
                                    continue;
                                }
                            }
                            if (movingPlatforms.debug) {
                                if (___overlapsTilemap(sprite, tm)) {
                                    console.log("Still overlapping")
                                }
                                else {
                                    console.log("No longer overlapping")
                                }
                            }
                        }

                        compX = Fx.compare(dx, Fx.zeroFx8);
                        compY = Fx.compare(dy, Fx.zeroFx8);
                    }

                    if (movingPlatforms.debug) {
                        for (const rider of riders) {
                            if (___overlapsTilemap(rider, tm)) {
                                console.log("Rider overlaps after move")
                            }
                        }
                    }
                }
            }

            if (movingPlatforms.debug) {
                for (const sprite of this.sprites) {
                    for (const tilemap of this.tilemaps) {
                        if (___overlapsTilemap(sprite, tilemap)) {
                            console.log("BAD OVERLAP")
                        }
                    }
                }
            }
        }

        protected platformCollisions(movingSprite: MovingSprite, tms: Platform[]) {
            const s = movingSprite.sprite;
            // if the sprite is already clipping into a wall,
            // allow free movement rather than randomly 'fixing' it
            if (s.flags & sprites.Flag.IsClipping) {
                s.flags &= ~sprites.Flag.IsClipping;
                for (const tm of tms) {
                    if (tm.isOnWall(s)) {
                        s.flags |= sprites.Flag.IsClipping;
                        break;
                    }
                }
            }
            if (!s.isStatic()) s.setHitbox();
            const hbox = s._hitbox;
            const tileScale = tms[0].scale;
            const tileSize = 1 << tileScale;

            const xDiff = Fx.sub(
                s._x,
                s._lastX
            );

            const yDiff = Fx.sub(
                s._y,
                s._lastY
            );

            if (!(s.flags & SPRITE_NO_WALL_COLLISION)) {
                if (xDiff !== Fx.zeroFx8) {
                    const right = xDiff > Fx.zeroFx8;
                    const collidedTiles: Obstacle[] = [];

                    // check collisions with tiles sprite is moving towards horizontally
                    for (
                        let y = Fx.sub(hbox.top, yDiff);
                        y < Fx.iadd(tileSize, Fx.sub(hbox.bottom, yDiff));
                        y = Fx.iadd(tileSize, y)
                    ) {
                        for (const tm of tms) {
                            const x0 = Fx.toIntShifted(
                                Fx.sub(
                                    Fx.add(
                                        right ?
                                            Fx.add(hbox.right, Fx.oneFx8)
                                            :
                                            Fx.sub(hbox.left, Fx.oneFx8),
                                        Fx.oneHalfFx8
                                    ),
                                    tm.left
                                ),
                                tileScale
                            );

                            const y0 = Fx.toIntShifted(
                                Fx.sub(
                                    Fx.add(
                                        Fx.min(
                                            y,
                                            Fx.sub(
                                                hbox.bottom,
                                                yDiff
                                            )
                                        ),
                                        Fx.oneHalfFx8
                                    ),
                                    tm.top
                                ),
                                tileScale
                            );

                            if (tm.isObstacle(x0, y0)) {
                                const obstacle = getObstacle(tm, x0, y0);
                                if (!collidedTiles.some(o => o.tileIndex === obstacle.tileIndex)) {
                                    collidedTiles.push(obstacle);
                                }
                            }
                        }
                    }

                    if (collidedTiles.length) {
                        if (right) {
                            for (const tile of collidedTiles) {
                                s._x = Fx.min(
                                    Fx.sub(
                                        Fx.sub(
                                            Fx8(tile.left),
                                            hbox.width
                                        ),
                                        hbox.ox
                                    ),
                                    s._x
                                )
                            }

                            for (const tile of collidedTiles) {
                                if (!(s.flags & SPRITE_NO_WALL_COLLISION)) {
                                    registerObstacle(s, CollisionDirection.Right, tile, tile.tilemap);
                                }
                            }
                        }
                        else {
                            for (const tile of collidedTiles) {
                                s._x = Fx.max(
                                    Fx.sub(
                                        Fx8(tile.right),
                                        hbox.ox
                                    ),
                                    s._x
                                );
                            }

                            for (const tile of collidedTiles) {
                                if (!(s.flags & SPRITE_NO_WALL_COLLISION)) {
                                    registerObstacle(s, CollisionDirection.Left, tile, tile.tilemap);
                                }
                            }
                        }

                        if (s.flags & sprites.Flag.DestroyOnWall) {
                            s.destroy();
                        } else if (s._vx === movingSprite.cachedVx && !(s.flags & SPRITE_NO_WALL_COLLISION)) {
                            // sprite collision event didn't change velocity in this direction;
                            // apply normal updates
                            if (s.flags & sprites.Flag.BounceOnWall) {
                                if ((!right && s.vx < 0) || (right && s.vx > 0)) {
                                    s._vx = Fx.neg(s._vx);
                                    movingSprite.xStep = Fx.neg(movingSprite.xStep);
                                    movingSprite.dx = Fx.neg(movingSprite.dx);
                                }
                            } else {
                                movingSprite.dx = Fx.zeroFx8;
                                s._vx = Fx.zeroFx8;
                            }
                        } else if (Math.sign(Fx.toInt(s._vx)) === Math.sign(Fx.toInt(movingSprite.cachedVx))) {
                            // sprite collision event changed velocity,
                            // but still facing same direction; prevent further movement this update.
                            movingSprite.dx = Fx.zeroFx8;
                        }
                    }
                }

                if (yDiff !== Fx.zeroFx8) {
                    const down = yDiff > Fx.zeroFx8;
                    const collidedTiles: Obstacle[] = [];

                    // check collisions with tiles sprite is moving towards vertically
                    for (
                        let x = hbox.left;
                        x < Fx.iadd(tileSize, hbox.right);
                        x = Fx.iadd(tileSize, x)
                    ) {

                        for (const tm of tms) {
                            const y0 = Fx.toIntShifted(
                                Fx.sub(
                                    Fx.add(
                                        down ?
                                            Fx.add(hbox.bottom, Fx.oneFx8)
                                            :
                                            Fx.sub(hbox.top, Fx.oneFx8),
                                        Fx.oneHalfFx8
                                    ),
                                    tm.top
                                ),
                                tileScale
                            );
                            const x0 = Fx.toIntShifted(
                                Fx.sub(
                                    Fx.add(
                                        Fx.min(
                                            x,
                                            hbox.right
                                        ),
                                        Fx.oneHalfFx8
                                    ),
                                    tm.left
                                ),
                                tileScale
                            );
                            if (tm.isObstacle(x0, y0)) {
                                const obstacle = getObstacle(tm, x0, y0);
                                if (!collidedTiles.some(o => o.tileIndex === obstacle.tileIndex)) {
                                    collidedTiles.push(obstacle);
                                }
                            }
                        }
                    }

                    if (collidedTiles.length) {
                        if (down) {
                            for (const tile of collidedTiles) {
                                s._y = Fx.min(
                                    Fx.sub(
                                        Fx.sub(
                                            Fx8(tile.top),
                                            hbox.height
                                        ),
                                        hbox.oy
                                    ),
                                    s._y
                                );
                                if (!(s.flags & SPRITE_NO_WALL_COLLISION)) {
                                    registerObstacle(s, CollisionDirection.Bottom, tile, tile.tilemap);
                                }
                            }
                        }
                        else {
                            for (const tile of collidedTiles) {
                                s._y = Fx.max(
                                    Fx.sub(
                                        Fx8(tile.bottom),
                                        hbox.oy
                                    ),
                                    s._y
                                );
                                if (!(s.flags & SPRITE_NO_WALL_COLLISION)) {
                                    registerObstacle(s, CollisionDirection.Top, tile, tile.tilemap);
                                }
                            }
                        }


                        if (s.flags & sprites.Flag.DestroyOnWall) {
                            s.destroy();
                        } else if (s._vy === movingSprite.cachedVy && !(s.flags & SPRITE_NO_WALL_COLLISION)) {
                            // sprite collision event didn't change velocity in this direction;
                            // apply normal updates
                            if (s.flags & sprites.Flag.BounceOnWall) {
                                if ((!down && s.vy < 0) || (down && s.vy > 0)) {
                                    s._vy = Fx.neg(s._vy);
                                    movingSprite.yStep = Fx.neg(movingSprite.yStep);
                                    movingSprite.dy = Fx.neg(movingSprite.dy);
                                }
                            } else {
                                movingSprite.dy = Fx.zeroFx8;
                                s._vy = Fx.zeroFx8;
                            }
                        } else if (Math.sign(Fx.toInt(s._vy)) === Math.sign(Fx.toInt(movingSprite.cachedVy))) {
                            // sprite collision event changed velocity,
                            // but still facing same direction; prevent further movement this update.
                            movingSprite.dy = Fx.zeroFx8;
                        }
                    }
                }
            }


            if (!(s.flags & SPRITE_NO_TILE_OVERLAPS)) {
                // Now that we've moved, check all of the tiles underneath the current position
                // for overlaps
                const overlappedTiles: tiles.Location[] = [];
                for (
                    let x = hbox.left;
                    x < Fx.iadd(tileSize, hbox.right);
                    x = Fx.iadd(tileSize, x)
                ) {
                    for (
                        let y = hbox.top;
                        y < Fx.iadd(tileSize, hbox.bottom);
                        y = Fx.iadd(tileSize, y)
                    ) {
                        for (const tm of tms) {
                            const x0 = Fx.toIntShifted(
                                Fx.sub(
                                    Fx.add(
                                        Fx.min(
                                            x,
                                            hbox.right
                                        ),
                                        Fx.oneHalfFx8
                                    ),
                                    tm.left
                                ),
                                tileScale
                            );

                            const y0 = Fx.toIntShifted(
                                Fx.sub(
                                    Fx.add(
                                        Fx.min(
                                            y,
                                            hbox.bottom
                                        ),
                                        Fx.oneHalfFx8
                                    ),
                                    tm.top
                                ),
                                tileScale
                            );

                            // if the sprite can move through walls, it can overlap the underlying tile.
                            if (!tm.isObstacle(x0, y0) || !!(s.flags & sprites.Flag.GhostThroughWalls)) {
                                overlappedTiles.push(tm.getTile(x0, y0));
                            }
                        }

                    }
                }

                if (overlappedTiles.length) {
                    this.tilemapOverlaps(s, overlappedTiles);
                }
            }
        }

        /** moves a sprite explicitly outside of the normal velocity changes **/
        public moveSprite(s: Sprite, dx: Fx8, dy: Fx8) {
            s._lastX = s._x;
            s._lastY = s._y;
            s._x = Fx.add(s._x, dx);
            s._y = Fx.add(s._y, dy);

            // if the sprite can collide with things, check tile map
            const tm = game.currentScene().tileMap;
            if (tm && tm.enabled) {
                const maxDist = Fx.toInt(this.maxSingleStep);
                // only check tile map if moving within a single step
                if (Math.abs(Fx.toInt(dx)) <= maxDist && Math.abs(Fx.toInt(dy)) <= maxDist) {
                    const ms = new MovingSprite(
                        s,
                        s._vx,
                        s._vy,
                        dx,
                        dy,
                        dx,
                        dy
                    );
                    this.platformCollisions(ms, [tm as Platform].concat(this.tilemaps));
                    // otherwise, accept movement...
                } else if (tm.isOnWall(s) && !this.canResolveClipping(s, tm)) {
                    // if no luck, flag as clipping into a wall
                    s.flags |= sprites.Flag.IsClipping;
                } else {
                    // or clear clipping if no longer clipping
                    s.flags &= ~sprites.Flag.IsClipping;
                }
            }
        }
    }

    function ___overlapsTilemap(sprite: Sprite, tilemap: Platform) {
        let x0 = Fx.toIntShifted(Fx.sub(sprite._hitbox.left, tilemap.left), tilemap.scale);
        let y0 = Fx.toIntShifted(Fx.sub(sprite._hitbox.top, tilemap.top), tilemap.scale);
        let x1 = Fx.toIntShifted(Fx.sub(sprite._hitbox.right, tilemap.left), tilemap.scale);
        let y1 = Fx.toIntShifted(Fx.sub(sprite._hitbox.bottom, tilemap.top), tilemap.scale);

        for (let x = Math.max(0, x0); x <= x1; x++) {
            for (let y = Math.max(0, y0); y <= y1; y++) {
                if (tilemap.isObstacle(x, y)) return true;
            }
        }

        return false;
    }

    function getObstacle(tilemap: Platform, col: number, row: number) {
        const index = tilemap._map.isOutsideMap(col, row) ? 0 : tilemap._map.getTile(col, row);
        const tile = tilemap._map.getTileImage(index);
        return new Obstacle(
            tile,
            row << this.scale,
            col << this.scale,
            this.layer,
            index,
            tilemap
        );
    }

    function registerObstacle(sprite: Sprite, direction: CollisionDirection, other: Obstacle, tm?: tiles.TileMap) {
        sprite.registerObstacle(direction, other, tm);

        getObstacles(sprite)[direction] = other;
    }

    function getObstacles(sprite: Sprite) {
        let obstacles: Obstacle[] = sprite.data[OBSTACLE_DATA_KEY];

        if (!obstacles) {
            obstacles = (sprite.data[OBSTACLE_DATA_KEY] = []);
        }

        return obstacles;
    }

    function clearObstacles(sprite: Sprite) {
        sprite.data[OBSTACLE_DATA_KEY] = [];
    }

    export function __init() {
        patchScene(game.currentScene());

        game.addScenePushHandler(() => {
            patchScene(game.currentScene());
        })
    }

    function patchScene(scene: scene.Scene) {
        scene.physicsEngine = new MovingPlatformsPhysics();
        scene.tileMap = new Platform();
    }
}