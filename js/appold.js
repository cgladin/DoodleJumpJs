
class Doodle {
    constructor() {
        this.x = 200;
        this.y = 400;
        this.dx = 0;
        this.dy = 0;
        this.gravity = 0.4;
        this.jumpHeight = 150;
        this.img = document.getElementById('doodle');
    }

    draw(ctx) {
        this.dy += this.gravity;
        if (this.x <= 0) {
            this.x = 400;
        } else if (this.x >= 400) {
            this.x = 0;
        }

        this.y += this.dy;
        this.x += this.dx;

        ctx.fillStyle = "blue";

        ctx.drawImage(
            this.img, this.x - 40, this.y - 80, 80, 80
        );

        ctx.fill();
    }

    jump() {
        this.dy = -10;
        this.jumpHeight = 100;

    }
}
class Block {
    constructor(x, y, type = 1) {
        this.x = x;
        this.y = y;
        this.dy = 0;
        this.dx = 0;
        this.type = type;
        this.width = 60;
        this.height = 20;
        this.color = "green";
        if (type === 2) {
            this.dx = 2;
            this.color = "blue";
        }
    }

    draw(ctx) {
        if (this.x <= this.width/2 || this.x >= 400 - this.width/2) {
            this.dx *= -1;
        }
        this.y += this.dy;
        this.x += this.dx;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    }

}
class Game {
    constructor(ctx) {
        this.height= 600;
        this.width=400;
        this.ctx = ctx;
        this.doodle = new Doodle(ctx);
        this.blocks= [];
        for(let i=0;i<5;i++) {
            this.blocks.push(new Block(200, 500))
        }
        this.start = this.start.bind(this);
        this.drawMenu();
    }

    drawMenu() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.doodle.draw(this.ctx);
        this.ctx.fillStyle = "#A51834";
        this.ctx.fillText("press space to begin", 60, 250);
        this.drawMap(this.ctx);
    }

    start() {
        this.interval = setInterval(this.draw.bind(this), 18, this.ctx);
    }

    pause() {
        clearInterval(this.interval);
        this.interval = undefined;
    }

    gameOver() {
        clearInterval(this.interval);
        this.interval = undefined;

        this.ctx.clearRect(0, 0,  this.width, this.height);
        this.ctx.font = "50px Gloria Hallelujah";
        this.ctx.fillStyle = "#A51834";
        this.ctx.fillText("game over!", 70, 150);
        this.ctx.font = "28px Gloria Hallelujah";
        this.ctx.fillStyle = "black";
        this.ctx.fillText(`your score: ${Math.round(this.blocks[0].y - this.doodle.lastJump.y)}`, 100, 240);
        this.ctx.fillText(`your highscore: ${Math.round(this.blocks[0].y - this.doodle.lastJump.y)}`, 80, 300);
        this.ctx.font = "20px Gloria Hallelujah";
        this.ctx.fillText('Select a character to jump again!', 30, 400);
        this.drawMap(this.ctx);
    }

    handleKeyPress(e) {
        switch (e.code) {
            case "Space": this.interval ? this.pause() : this.start() ;
                break;
            case "Enter": this.restart();
                break;
            case "ArrowLeft": this.doodle.dx = -5;
                break;
            case "ArrowRight": this.doodle.dx = 5;
                break;
        }
    }

    allObjects() {
        return this.blocks.concat([this.doodle]);
    }

    moveScreen() {
        this.doodle.lastJump = this.doodle.lastJump
            ? this.doodle.lastJump
            : this.blocks[0];

        if (this.doodle.lastJump.y < 200) {
            for(let i = 0; i < this.blocks.length; i++) {
                this.blocks[i].dy = 20;
            }
        } else if (this.doodle.lastJump.y < 400) {
            for(let i = 0; i < this.blocks.length; i++) {
                this.blocks[i].dy = 15;
            }
        } else if (this.doodle.lastJump.y < 500) {
            for(let i = 0; i < this.blocks.length; i++) {
                this.blocks[i].dy = 10;
            }
        } else if (this.doodle.lastJump.y >= 400) {
            for(let i = 0; i < this.blocks.length; i++) {
                this.blocks[i].dy = 0;
            }
        }
    }

    jumpCheck() {
        this.blocks.forEach( block => {
            // hit block horizontally
            if ( this.doodle.x <= block.x + 40
                && this.doodle.x >= block.x - 40) {

                // hits block height while falling
                if (this.doodle.y <= block.y + block.height/2
                    && this.doodle.y >= block.y -block.height/2
                    && this.doodle.dy > 0) {
                    // jump from new block
                    this.doodle.lastJump = block;
                    this.doodle.jumpFrom = block.y;
                    this.doodle.jump();
                }
            }
        });
    }


    newRandomBlock(maxY) {
        let x = (Math.random() * (this.width - 40)) + 20;
        let y = Math.random() * 80;
        let type = 1;
        type = Math.random() < 0.7 ? type : 2 ;
        type = Math.random() < 0.9 ? type : 3 ;
        this.blocks.push(new Block(x, y, type));
    }
    ensureMoreBlocks() {
        if (this.blocks[this.blocks.length -1].y > 120) {
            this.newRandomBlock(80);
        }
    }

    drawMap(ctx) {

        // line
        ctx.beginPath();
        ctx.moveTo(0, 70);
        ctx.lineTo(400,60);
        ctx.stroke();

        // blue rect
        ctx.fillStyle = "rgba(135,206,250,0.7)";
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(0,70);
        ctx.lineTo(400, 60);
        ctx.lineTo(400, 0);
        ctx.closePath();
        ctx.fill();

        // text
        ctx.font = "30px Veranda";
        ctx.fillStyle = "black";
        if (this.doodle.lastJump) {
            ctx.fillText(
                `${Math.round(this.blocks[0].y - this.doodle.lastJump.y)}`,
                10, 50
            );
        } else {
            ctx.fillText(`0`, 10, 50);
        }
    }

    draw() {
        this.moveScreen();
        this.ensureMoreBlocks();

        this.ctx.clearRect(0, 0, this.width, this.height);

        // Doodle Checks
        if (this.doodle.y <= this.doodle.jumpFrom - this.doodle.jumpHeight && this.doodle.dy < 0) {
            this.doodle.dy = this.doodle.dy * -1;
        }
        this.jumpCheck();

        this.allObjects().forEach((object) => {
            object.draw(this.ctx);
        });
        this.drawMap(this.ctx);
        this.doodle.y > this.height ? this.gameOver() : null;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const c = document.getElementById('canvas');
    const ctx = c.getContext('2d');
    let game = new Game(ctx);

    document.addEventListener('keydown', e => {
        game.handleKeyPress(e);
    });
    document.addEventListener('keyup', () => {
        game.doodle.dx = 0;
    });
});
