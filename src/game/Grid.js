import PositionSystem from "./PositionSystem"

class Grid extends PositionSystem { 

  _objects = []
  _placements = new Map() 

  _rows = [ ]
  _size = 50
  _width = 10 
  _height = 10 

  constructor(w=100,h=100,size=10) { 
    
    super() 

    this._size = size 
    this._width = w 
    this._height = h 

    let newRows = []
    for(let x = 0; x < w; x++) { 
      newRows[x] = Array(h)
    }
    this._rows = newRows

  }

  draw(ctx) { 
    for(let x = 0; x <= this._width; x++) { 
      ctx.beginPath() 
      ctx.strokeStyle = '#222222'
      ctx.moveTo(x*this._size, 0)
      ctx.lineTo(x*this._size,1000)
      ctx.stroke() 
    }
    for(let y = 0; y <= this._height; y++) { 
      ctx.beginPath() 
      ctx.strokeStyle = '#222222'
      ctx.moveTo(0, y*this._size)
      ctx.lineTo(1000, y*this._size)
      ctx.stroke() 
    }
  }

  place(gameObject, x, y) { 
    this._placements.set(gameObject, {x,y})
    this._objects.push(gameObject) 
  }

  update() { 

  }

  //@OVERRIDE 
  toRaw(x,y) { 
    return [x*this._size, y*this._size]
  }

  fromRaw(x, y) { 
    return [x/this._size, y/this._size]
  }


}

export default Grid 