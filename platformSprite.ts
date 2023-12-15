namespace movingPlatforms {
    export class PlatformSprite extends Sprite {
        constructor(public platform: Platform) {
            super(img`0`);

            this.flags |= sprites.Flag.HitboxOverlaps;
            this.setKind(platform.kind);
        }

        setDimensions(width: number, height: number) {
            this._width = Fx8(width);
            this._height = Fx8(height);
            this.resetHitbox();
        }

        setHitbox() {
            this._hitbox = new game.Hitbox(this, this._width, this._height, Fx.zeroFx8, Fx.zeroFx8)
        }

        protected drawSprite(drawLeft: number, drawTop: number): void {
            this.platform.draw(screen, game.currentScene().camera);
        }

        protected recalcSize() {
            // intentionally do nothing
        }

        destroy(effect?: effects.ParticleEffect, duration?: number): void {
            super.destroy(effect, duration);
            const physics = game.currentScene().physicsEngine as MovingPlatformsPhysics;
            physics.tilemaps.removeElement(this.platform);
        }
    }
}