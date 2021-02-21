class Entity {
    constructor(x,y,width,height) {
        //position
        this.x = x;
        this.y = y;

        //taille
        this.width = width;
        this.height = height;

        this.img = document.getElementById("sprite");
    }

}

class Doodle extends Entity{
    constructor(x, y) {
        super(x,y,55,40)
        //deplacement
        this.vy = 10;
        this.vx = 0;
        this.vMax = 3;

        //Sprite clipping
        this.cx = 0;
        this.cy = 365;
        this.cwidth = 110;
        this.cheight = 80;


        //Pour arreter le movement ou non
        this.stateMovingLeft = false;
        this.stateMovingRight = false;

        this.gravity = 0.2;
        this.jumpHeight = 200;
        this.dirSprite = "right";

        //clipping de l'image en fonction de la direction
        this.clipDirection = {
            right: 120,
            left: 200,
            right_jump: 290,
            left_jump: 365
        };

        this.img = document.getElementById("sprite");
    }

    draw(ctx) {
        this.cy = this.clipDirection[this.dirSprite];
        ctx.drawImage(
            this.img,
            this.cx, this.cy, this.cwidth, this.cheight,
            this.x, this.y, this.width, this.height
        );
    }

    move(width) {
        if (this.stateMovingRight === true || this.stateMovingLeft === true) {
            if (this.stateMovingRight === true) {
                this.x += this.vx;
                this.vx += 0.1;//augmente la vitesse de déplacement
                if (this.vx > this.vMax) this.vx = this.vMax; //limit la vitesse
            }
            if (this.stateMovingLeft === true) {
                this.x += this.vx;
                this.vx -= 0.1; //augmente la vitesse de déplacement
                if (this.vx < -this.vMax) this.vx = -this.vMax; //limit la vitesse
            }
        } else {
            this.x += this.vx;
            //on baisse la vitesse jusqu'à 0
            if (this.vx < 0) this.vx += 0.1;
            if (this.vx > 0) this.vx -= 0.1;

            //On arrete le doodle
            if (this.vx < 0 && this.vx > -0.1) this.vx = 0;
            if (this.vx > 0 && this.vx < 0.1) this.vx = 0;
        }

        //Fait apparaître le doodle de l'autre coté
        if (this.x > width)
            this.x = 0 - this.width;
        else if (this.x < 0 - this.width)
            this.x = width;
    }

    isAffectByGravity(height) {
        //affecte le doodle de la gravité si il dépasse le centre du canvas
        if (this.y >= (height / 2) - (this.height / 2)) {
            this.affectByGravity();
            return true;
        }
        return false;
    }

    affectByGravity(){
        this.y += this.vy;
        this.vy += this.gravity;
    }

    jump() {
        this.vy = -8;
    }
}

class Block extends Entity{
    constructor(x, y,width,height) {
        super(x,y,width,height)

        //Sprite clipping
        this.cx = 0;
        this.cy = 0;
        this.cwidth = 0;
        this.cheight = 0;
    }

    draw(ctx) {
        ctx.drawImage(
            this.img,
            this.cx, this.cy, this.cwidth, this.cheight,
            this.x, this.y, this.width, this.height
        );
    }

    collision(x, y, width, height) {
        return ((x >= this.x && x <= this.x + this.width) || (x + width >= this.x && x + width <= this.x + this.width)) && (y - height <= this.y && y - height >= this.y - this.height);
    }
}

class Platform extends Block{
    constructor(x,y) {
        super(x,y,60,17.5);

        //Sprite clipping
        this.cx = 0;
        this.cy = 0;
        this.cwidth = 105;
        this.cheight = 31;

        this.type = 1;
    }
}

class BasePlatform extends Block {
    constructor(width,height) {
        super(0,height-5,width,5);
        //Sprite clipping
        this.cx = 0;
        this.cy = 614;
        this.cwidth = this.width;
        this.cheight = 5;
    }
}

class Game {
    constructor() {

        this.blocks = [];
        this.nbBlock = 8;
        this.score = 0;
        this.ctx = document.querySelector("#game").getContext("2d");

        this.height = this.ctx.canvas.height;
        this.width = this.ctx.canvas.width;

        this.doodle = new Doodle(Math.floor(this.width / 2) - 40, this.height - 140);//40 car l'image fais 80px

        this.event();
        this.blocks.push(new Block(Math.floor(this.width) - 60, this.height - 50));//60 width block
        this.blockSpawner();
        this.base= new BasePlatform(this.width,this.height);

        this.animationID = window.requestAnimationFrame(this.start.bind(this));
    }

    start() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.findCollision()
        this.doodle.draw(this.ctx)
        this.blocks.forEach(b => {
            b.draw(this.ctx);
        })
        this.moveDoodle();

        //si le doodle est deplacement vertical
        if (this.doodle.vy < -7 && this.doodle.vy > -15) this.doodle.dir = "left_jump";
        //si le doodle est deplacement vertical
        if (this.doodle.vy < -7 && this.doodle.vy > -15) this.doodle.dir = "right_jump";
        this.animationID = window.requestAnimationFrame(this.start.bind(this));
    }

    pause() {
        cancelAnimationFrame(this.animationID);
        this.animationID = undefined;
    }

    event() {
        document.addEventListener('keydown', ev => {
            switch (ev.code) {
                case "Space":
                    this.animationID ? this.pause() : this.start();
                    break;
                case "Enter":
                    this.restart();
                    break;
                case "ArrowLeft":
                    if (this.animationID) {
                        this.doodle.dirSprite = "left";
                        this.doodle.stateMovingLeft = true;
                    }
                    break;
                case "ArrowRight":
                    if (this.animationID) {
                        this.doodle.dirSprite = "right";
                        this.doodle.stateMovingRight = true;
                    }
                    break;
            }
        });
        document.addEventListener('keyup', ev => {
            switch (ev.code) {
                case "ArrowLeft":
                    if (this.animationID) {
                        this.doodle.stateMovingLeft = false;
                    }
                    break;
                case "ArrowRight":
                    if (this.animationID) {
                        this.doodle.stateMovingRight = false;
                    }
                    break;
            }
        })
    }

    blockSpawner() {
        for (let i = 1; i < this.nbBlock; i++) {
            let yPrevious = this.blocks[i - 1].y + this.blocks[i - 1].height;
            let yMax = yPrevious - this.doodle.jumpHeight - this.doodle.height;
            if (yMax < 0) yMax = 0;
            let x = Math.floor(Math.random() * (this.width - this.blocks[i - 1].width));
            let y = Math.floor(Math.random() * (yPrevious - yMax) + yMax);
            this.blocks[i] = new Block(x, y);
        }
    }

    findCollision() {
        this.blocks.forEach(block => {
            if (block.collision(this.doodle.x, this.doodle.y, this.doodle.width, this.doodle.height)) {
                this.doodle.fallingState = false;
            }
        });
    }

    moveDoodle() {
        this.doodle.move(this.width);//on envoie les dimensions pour les contrainte de déplacement
        let isAffectByGravity = this.doodle.isAffectByGravity(this.height);
        if (isAffectByGravity === false) {
            this.moveBlock();
            if (this.doodle.vy >= 0) { //si le doodle tombe
                this.doodle.affectByGravity();
            }
            this.score++;
        }
    }

    moveBlock() {
        this.blocks.forEach((block, i) => {
            if (this.doodle.vy < 0) { //si le doodle saute
                block.y -= this.doodle.vy; //on déplace le block
            }
            if (block.y > this.height) { //si un block sort du jeu
                this.blocks[i] = new Platform();
                this.blocks[i].y = block.y - this.height;
            }
        })
    }

}

let game = new Game();
