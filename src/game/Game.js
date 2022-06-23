
let _animationFramesStarted = false 
function requestAnimationFrameFunction() { 
  const games = Game._instances

  for(const game of games) { 
    game._gameLoop() 
  }
  
  window.requestAnimationFrame(requestAnimationFrameFunction)
}


class Game { 

  static _instances = []
  _ctx = undefined 
  _started = false 

  _drawTicks = 0 
  _beginDrawTime = undefined  
  _beginTickTime = undefined 
  _ticksPerSecond = 60 
  _lastTickTime = 0 

  _objects = []

  constructor() { 
    Game._instances.push(this)
  }

  
  
  setDrawingContext(context) { 
    this._ctx = context
  }

  startGameLoop() { 
    this._started = true 

    if(_animationFramesStarted != true) { 
      _animationFramesStarted =true 
      requestAnimationFrameFunction() 
    }

    //for updates 
    this._beginTickTime = performance.now() 
    const tickTimeGap = 1000 / this._ticksPerSecond
    setInterval(()=>{
      if(performance.now() >= this._lastTickTime + tickTimeGap) {
        const newTickTime = performance.now()
        const deltaTime = newTickTime - this._lastTickTime 
        this._lastTickTime = newTickTime
        
        const shouldDelete = []

        //update goes here
        for(const go of this._objects) { 
          if(go._shouldDelete == true) { 
            shouldDelete.push(go) 
            continue 
          }
          else if(go.update != undefined) go.update(deltaTime) 
        }

        //deletion of gObjects //IMPORTANT DONT DO IN UPDATE BECAUSE UPDATE FUNCS CAN ADD NEW GO 
        for(const deleteObject of shouldDelete) { 
          this._objects.splice(this._objects.indexOf(deleteObject),1)
          
        }


      }
    },1)
  }

  addObject(gameObject) { 
    if(gameObject == undefined) { return }
    this._objects.push(gameObject)
  }

  _gameLoop() { 
    if(this._beginDrawTime == undefined) { 
      this._beginDrawTime = performance.now() 
    }
    if(this._started != true) return 

    //clear 
    this._ctx.rect(0,0,9999999,9999999) 
    this._ctx.fillStyle = "black"; 
    this._ctx.fill()


    //set some defaults 
    this._ctx.fillStyle = "red"; 
    this._ctx.strokeStyle = "red"; 


    this._ctx.beginPath() 
    this._ctx.stroke()

    for(const go of this._objects) { 
      if(go._shouldDelete == true) {
        continue //will be deleted in update 
      }
      this._ctx.beginPath() 
      if(go.draw != undefined) go.draw(this._ctx) 
    }


    this._drawTicks++ 
  }


}


export default new Game() 