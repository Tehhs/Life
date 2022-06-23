import { useState, useRef, useEffect } from 'react'
import Game from "./game/Game"
import GameObject from './game/GameObject'
import Grid from "./game/Grid"

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const urlSeed = urlParams.get('seed') ?? ""
console.log("URL SEED = ", urlSeed)

//--constants 
const grid_w = 190
const grid_h = 190
const grid_sq_size = 5

const eater_tick_timing = 1
const food_count = 200
const eater_count = 200

const canvas_w = 2000 
const canvas_h = 800


const grid = new Grid(grid_w,grid_h,grid_sq_size); 
//--end constants 

const spawnFood = (amt=0) => { 
  for(let i = 0 ; i < amt; i++) { 
    const newFood = new FoodSquare() 
    newFood.setPosition(randInt(0,grid_w-1)*grid_sq_size,randInt(0,grid_h-1) * grid_sq_size)
    newFood.setSize(grid_sq_size,grid_sq_size)
    newFood.setColor("grey")

    Game.addObject(newFood)
  }
}
function cyrb128(str) {
  let h1 = 1779033703, h2 = 3144134277,
      h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
      k = str.charCodeAt(i);
      h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
      h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
      h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
      h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}
function sfc32(a, b, c, d) {
  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
    var t = (a + b) | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}

// Create cyrb128 state:
var seed = cyrb128(urlSeed);
// Four 32-bit component hashes provide the seed for sfc32.
var rando = sfc32(seed[0], seed[1], seed[2], seed[3]);

// Only one 32-bit component hash is needed for mulberry32.
//var rand = mulberry32(seed[0]);



const rgbToHex = (r=0,g=0,b=0) => { 
  r = Math.min(255, Math.abs(Math.round(r)))
  g = Math.min(255, Math.abs(Math.round(g)))
  b = Math.min(255, Math.abs(Math.round(b)))
  const componentToHex = (c) => { 
    let hex = c.toString(16) 
    if(hex.length <= 1) { 
      hex = "0"+hex 
    }
    return hex 
  }

  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`
}
window.pineapple = rgbToHex

const objToIdMap = new Map() 
const timePassed = (obj, id, passed) => { 
  if( !objToIdMap.has(obj) ) {
    objToIdMap.set(obj, {})
  }
    
  const now = performance.now() 
  const idMap = objToIdMap.get(obj) 
  let time = idMap[id] 
  let ret = false 
  if(time == undefined) { 
    time = now 
    ret = true 
  }
  if(now - time >= passed) { 
    time = now 
    ret = true 
  }
  objToIdMap.get(obj)[id] = time 
  return ret 
}

const distance_between = (pos1, pos2) => { 
  const x_2 = pos2[0]
  const y_2 = pos2[1]
  const x_1 = pos1[0]
  const y_1 = pos1[1]
  const distance = Math.sqrt(
    Math.pow((x_2-x_1), 2) + Math.pow(y_2-y_1, 2)
  )
  return distance
}
window.disssss = distance_between

//-------START LEVEL STUFF ------------
const gos = [] 

class FoodSquare extends GameObject { 
  constructor() { 
    super()
    gos.push(this) 
  }
  update(dt) { 
    
    
  }
}

class EaterSquare extends GameObject { 

  energyMax = 30
  energy = this.energyMax ?? 100 
  eaten = 0 

  update() { 
    if(timePassed(this, "move", eater_tick_timing)) { 

      const sorted_near = gos.filter( go => go instanceof FoodSquare).sort( (a,b) => { 
        const distance1 = distance_between(this.getPosition(), a.getPosition())
        const distance2 = distance_between(this.getPosition(), b.getPosition())

        return distance1 - distance2
      })


      const nearest = sorted_near[0]
      const nearPos = nearest.getPosition()
      const thisPos = this.getPosition() 
      if(thisPos[0] < nearPos[0]) { 
        this.movePosition(grid_sq_size,0)
        this.energy -= 1
      }
      else if(thisPos[0] > nearPos[0]) { 
        this.movePosition(-grid_sq_size,0)
        this.energy -= 1
      }
      else if(thisPos[1] < nearPos[1]) { 
        this.movePosition(0, grid_sq_size)
        this.energy -= 1
      }
      else if(thisPos[1] > nearPos[1]) { 
        this.movePosition(0, -grid_sq_size)
        this.energy -= 1
      }

      if(this.energy <= 0) { 
        this.delete(true)
        
        spawnFood(this.eaten)
      }
      
      const eneryMax = 30

      if(this.energy >= eneryMax) { 
        const newEater = new EaterSquare()
        newEater.setPosition(this.getPosition()[0], this.getPosition()[1] + (2*grid_h))
        newEater.setSize(grid_sq_size,grid_sq_size)
        newEater.setColor("white")

        //Game.addObject(newEater)

        this.energy = Math.round(this.energy/2)
        console.log("JAMM")
      }

      if(distance_between(nearest.getPosition(), this.getPosition()) < (grid_sq_size*1.5)) { 
        nearest.delete(true)
        gos.splice(gos.findIndex((e) => e === nearest), 1)
        this.energy = Math.min(eneryMax, this.energy+10)
        this.eaten += 1 
      }

      
      const gLevel = (this.energy / eneryMax) * 255
      const rLevel = 255-gLevel
      const colors = rgbToHex(rLevel, gLevel, 0)
      this.setColor(colors)
    }
  }
}

//-------END LEVEL STUFF ------------

const randInt = (min=0, max=30) => { 
  return Math.round(min + (rando() * (max-min)))
}

const colors = ["red", "orange", "pink", "green", "blue", "yellow", "white"]


let x = 0
function App() {
  const canvasRef = useRef() 
  const [drawTicksPerSecond, setDrawTicksPerSecond] = useState(undefined)
  useEffect(()=>{
    const canvas = canvasRef.current 
    if(canvas == undefined) { 
      return 
    }

    Game.addObject(grid)
    

    const ctx = canvas.getContext("2d")
    Game.setDrawingContext(ctx)
    Game.startGameLoop()

    //food 
    spawnFood(food_count)

    //eaters 
    for(let i = 0; i < eater_count; i++) { 
      const gameObject = new EaterSquare()
      gameObject.setPosition(randInt(0,grid_w-1)*grid_sq_size,randInt(0,grid_h-1) * grid_sq_size)
      gameObject.setSize(grid_sq_size,grid_sq_size)
      gameObject.setColor("green")

      Game.addObject(gameObject)
    }

   
    

    setInterval(()=>{
      const secondsPassed = (performance.now() - Game._beginDrawTime) / 1000
      setDrawTicksPerSecond(Game._drawTicks / secondsPassed)
    }, 1000)

  }, [])

  return (<div>
    <div> {drawTicksPerSecond??"undefined"} dtps </div>
    <canvas width={canvas_w} height={canvas_h} ref={canvasRef}/>
  </div>)
}

export default App
