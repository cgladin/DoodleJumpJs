class Entity {
    constructor(x, y, width, height) {
        //position
        this.x = x;
        this.y = y;

        //taille
        this.width = width;
        this.height = height;

        this.img = document.getElementById("sprite");
    }

}

class Doodle extends Entity {
    constructor(x, y) {
        super(x, y, 55, 40)
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

        this.gravity = 0.1;

        this.jumpHeight = 127; //car -5 - 0.1 à chaque frame il parcours 127.5 quand vy =0

        this.isDead=false;

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

    moveX(width) {
        if (this.stateMovingRight === true || this.stateMovingLeft === true) {
            if (this.stateMovingRight === true) {
                this.x += this.vx;
                //augmente la vitesse de déplacement
                this.vx += 0.1;
                //limit la vitesse
                if (this.vx > this.vMax) this.vx = this.vMax;
            }
            if (this.stateMovingLeft === true) {
                this.x += this.vx;
                //augmente la vitesse de déplacement
                this.vx -= 0.1;
                //limit la vitesse
                if (this.vx < -this.vMax) this.vx = -this.vMax;
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
        if (!((this.y < (height / 2) - (this.height / 2)) && this.vy < 0)) {
            this.affectByGravity();
            return true;
        } else {
            this.y = (height / 2) - (this.height / 2) - 1;
            return false
        }
    }

    affectByGravity() {
        this.y += this.vy;
        this.vy += this.gravity;
    }

    jump() {
        //déplace de 5 pixel à chaque frame vers le haut
        this.vy = -5;
    }
}

class Block extends Entity {
    constructor(width, height, type) {
        super(0, 0, width, height)
        this.type = type;

        if (this.type === 2 || this.type === 7) this.vx = 0.8;

        if (this.type === 4 || this.type === 8) {
            this.vTickMax = 100;
            this.vTick = this.vTickMax;
            this.vy = 0.4;
        }

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

    collision(doodle) {
        return ((doodle.x >= this.x && doodle.x <= this.x + this.width) || (doodle.x + doodle.width >= this.x && doodle.x + doodle.width <= this.x + this.width)) && (doodle.y - doodle.height <= this.y && doodle.y + doodle.height >= this.y - this.height);
    }

    setXAndY(x, y) {
        this.x = x;
        this.y = y;
    }

    setDead() {
        this.isDead=true;
    }
}

class Platform extends Block {
    constructor(type = 1) {
        super(60, 17.5, type);

        this.setSpriteClippingByType();
    }

    //Sprite clipping
    setSpriteClippingByType() {
        /*
         * type:
         * 1 : plateforme normale
         * 2 : plateforme qui se déplace horizontallement
         * 3 : plateforme pourrie
         * 3.5 : animation platforme pourrie
         * 4 : plateforme qui se déplace verticalement
         */
        if (this.type === 1) {
            this.cx = 0;
            this.cy = 0;
            this.cwidth = 105;
            this.cheight = 31;
        }
        if (this.type === 2 || this.type === 4) {
            this.cx = 0;
            this.cy = 60;
            this.cwidth = 105;
            this.cheight = 31;
        }
        if (this.type === 3) {
            this.cx = 0;
            this.cy = 30;
            this.cwidth = 105;
            this.cheight = 31;
        }
        if (this.type === 3.5) {
            this.cx = 0;
            this.cy = 555;
            this.cwidth = 105;
            this.cheight = 55;
        }
    }
}

class BasePlatform extends Block {
    constructor(width, height) {
        super(width, 5, 0);
        //Sprite clipping
        this.cx = 0;
        this.cy = 614;
        this.cwidth = 100;
        this.cheight = 5;
        this.setXAndY(0, height - 5);
    }
}

class Monster extends Block {
    constructor(type) {
        super(50, 60, type);

        //Sprite clipping
        this.cx = 0;
        this.cy = 630;
        this.cwidth = 110;
        this.cheight = 140;
    }
    collision(doodle) {
        if(((doodle.x >= this.x && doodle.x <= this.x + this.width) || (doodle.x + doodle.width >= this.x && doodle.x + doodle.width <= this.x + this.width)) && doodle.y <= this.y+this.height){
            doodle.setDead();
            return true;
        }
        return ((doodle.x >= this.x && doodle.x <= this.x + this.width) || (doodle.x + doodle.width >= this.x && doodle.x + doodle.width <= this.x + this.width)) && (doodle.y - doodle.height <= this.y && doodle.y + doodle.height >= this.y - this.height);
    }

}

class Game {
    constructor() {
        this.menu();
    }

    menu() {
        let menu = document.querySelector('#mainMenu');

        this.buttonEvent(menu, "Play");
    }

    initGame() {
        this.ctx = document.querySelector("#game").getContext("2d");

        this.height = this.ctx.canvas.height;
        this.width = this.ctx.canvas.width;

        this.blocks = [];
        this.nbBlock = 8;
        this.score = 0;

        this.event();

        this.doodle = new Doodle(Math.floor(this.width / 2) - 40, this.height - 140);

        this.blockInit();

        this.base = new BasePlatform(this.width, this.height);

        this.stateGameOver = false;

        this.animationID = window.requestAnimationFrame(this.start.bind(this));
    }

    start() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.base.draw(this.ctx);

        this.findCollision()
        this.doodle.draw(this.ctx)
        this.blocks.forEach(b => {
            b.draw(this.ctx);
        })
        this.moveBlocks();
        this.moveDoodle();

        // if (this.doodle.vy > -3 && this.doodle.dirSprite === "left") this.doodle.dirSprite = "left_jump";
        // else this.doodle.dirSprite = "left";
        // if (this.doodle.vy > -2 && this.doodle.dirSprite === "right") this.doodle.dirSprite = "right_jump" ;
        // else this.doodle.dirSprite = "right";

        this.updateScore();

        this.gameOver()

        if (this.stateGameOver !== true)
            this.animationID = window.requestAnimationFrame(this.start.bind(this));
    }

    gameOver() {
        if (this.doodle.y > this.height) {
            this.menuGameOver();
        }
    }

    menuGameOver() {
        this.pause();
        this.ctx.clearRect(0, 0, this.width, this.height);

        let menu = document.querySelector("#gameOverMenu");
        let score = document.querySelector("#score");
        let scoreGO = document.querySelector("#gameOverScore");

        scoreGO.textContent = this.score;

        menu.style.zIndex = "2";
        score.style.zIndex = "-1";

        this.buttonEvent(menu, "Restart");
        this.stateGameOver = true;
    }

    pause() {
        cancelAnimationFrame(this.animationID);
        this.animationID = undefined;
    }

    buttonEvent(menu, txtContent) {
        let button = document.createElement("div");
        button.className = "button";
        button.textContent = txtContent;

        menu.appendChild(button);
        button.addEventListener("click", () => {
            menu.removeChild(button);
            menu.style.zIndex = "-1";
            let scoreDOM = document.querySelector("#score");
            scoreDOM.style.zIndex = "2";
            this.initGame();
        });
    }

    event() {
        document.addEventListener('keydown', ev => {
            switch (ev.code) {
                case "Space":
                    this.animationID ? this.pause() : this.start();
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
        });
    }

    blockInit() {
        this.blocks.push(new Platform());
        this.blocks[0].setXAndY(Math.floor(this.width - this.blocks[0].width), 50);

        for (let i = 1; i < this.nbBlock; i++) {
            this.blocks[i] = new Platform();

            let yPrevious = this.blocks[i - 1].y + this.blocks[i - 1].height;
            let yMax = yPrevious + this.doodle.jumpHeight;

            let x = Math.floor(Math.random() * (this.width - this.blocks[i].width));
            let y = Math.floor(Math.random() * (yPrevious - yMax) + yMax);

            this.blocks[i].setXAndY(x, y);

        }
        this.maxplateforme = this.blocks[0].y;
        this.tailleLastPlateforme = this.blocks[0].height;
        this.g = this.blocks[this.nbBlock - 1];
    }

    findCollision() {
        this.blocks.forEach((block,index)  => {
            this.clearBlockDestroyed(block,index)
            if (block.collision(this.doodle) && this.doodle.vy > 0) {
                //si le block est un monstre
                if(block.type === 6 || block.type === 7 || block.type === 8) {
                    this.menuGameOver();
                }
                else {
                    if(block.type === 3 ) {
                        block.type+=0.5;
                        block.renderTick=15;
                        block.setSpriteClippingByType();
                    }

                    this.doodle.jump();
                }
            }
        });
        if (this.base.collision(this.doodle) && this.base.y < this.height) {
            this.doodle.jump();
        }
    }

    moveDoodle() {
        //on envoie les dimensions pour les contrainte de déplacement
        this.doodle.moveX(this.width);
        let isAffectByGravity = this.doodle.isAffectByGravity(this.height);

        if (isAffectByGravity === false) {
            this.moveBase();
            this.moveToDownBlocks();

            this.doodle.affectByGravity();

            this.score++;
        }

    }

    moveToDownBlocks() {
        let lowerBlock = this.blocks[this.nbBlock - 1];
        //si un block sort du jeu
        if (lowerBlock.y > this.height) {
            this.blocks.pop()

            this.addBlock();
        }
        if (this.doodle.vy < 0) {
            this.maxplateforme -= this.doodle.vy;
        }
        this.blocks.forEach(block => {
            if (this.doodle.vy < 0) { //si le doodle saute
                block.y -= this.doodle.vy; //on déplace le block
            }
        })
    }

    moveBase() {
        if (this.base.y < this.height) {
            this.base.y -= this.doodle.vy;
        }
    }

    moveBlocks() {
        this.blocks.forEach(block => {
            //déplacement Horizontal
            if (block.type === 2 || block.type === 7) {
                let x = block.x + block.vx
                if (x + block.width > this.width) {
                    block.vx = -block.vx;
                }
                if (x < 0) {
                    block.vx = Math.abs(block.vx);
                }
                block.x = x;

            }
            //déplacement Vertical
            if (block.type === 4 || block.type === 8) {
                block.y += block.vy;
                block.vTick--;
                if (block.vTick === 0) {
                    block.vTick = block.vTickMax;
                    if (block.vy > 0) block.vy = -block.vy;
                    else block.vy = Math.abs(block.vy);
                }

            }
        })
    }

    spawnBlock() {
        let probaType;
        /*
         * type:
         * 1 : plateforme normale
         * 2 : plateforme qui se déplace horizontallement
         * 3 : plateforme pourrie
         * 4 : plateforme qui se déplace verticalement
         * 5 : plateforme avec power up
         * 6 : monstre immobile
         * 7 : monstre qui se déplace horizontallement
         * 8 : monstre qui se déplace verticalement
         */

        if (this.score <= 500) probaType = [1];
        else if (this.score <= 1000) probaType = [1, 1, 1, 1, 1, 2, 2];
        else if (this.score <= 1500) probaType = [1, 1, 1, 1, 1, 2, 2, 2, 2, 7, 7];

        let type = probaType[Math.floor(Math.random() * probaType.length)];

        if (type >= 1 && type < 6) return new Platform(type);

        if (type >= 6 && type <= 8) return new Monster(type);

    }

    addBlock(){
        //ajoute au début du tableau
        this.blocks.unshift(this.spawnBlock());

        let yPrevious = this.maxplateforme - this.tailleLastPlateforme;
        let yMax = yPrevious - this.doodle.jumpHeight;
        let x = Math.floor(Math.random() * (this.width - this.blocks[0].width));
        let y = Math.floor(Math.random() * (yPrevious - yMax) + yMax);
        this.blocks[0].setXAndY(x, y);
        this.maxplateforme = y;
        this.tailleLastPlateforme = this.blocks[0].height;
    }

    clearBlockDestroyed(block,index){
        if(block.type === 3.5 && block.renderTick === 0){
            this.blocks.splice(index,1);
            this.addBlock();
        } else  if(block.type === 3.5){
            block.renderTick--;
        }
    }

    updateScore() {
        let scoreDiv = document.querySelector("#score");
        scoreDiv.innerHTML = this.score;
    }

}

let game = new Game();
