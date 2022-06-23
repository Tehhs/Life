class GameObject { 

  _rawPosition = [] 
  _rawDimensions = []

  _dimensions = [10,10]
  _color = "purple"

  _shouldDelete = false 

  constructor() { 

  }

  movePosition(x=0, y=0) { 
    this.setPosition(
      this._rawPosition[0] + x, 
      this._rawPosition[1] + y 
    )
  }

  getPosition() { 
    return this._rawPosition
  }

  setPosition(x=0, y=0) { 
    this._rawPosition = [x,y]
  }

  setColor(colorStyle) { 
    this._color = colorStyle
  }

  setSize(w,h) { 
    this._dimensions = [w,h]
  }

  draw(ctx) { 
    ctx.beginPath() 
    ctx.rect(this._rawPosition[0], this._rawPosition[1], this._dimensions[0], this._dimensions[1])
    ctx.fillStyle = this._color ?? "purple" 
    ctx.fill() 
  }

  delete(tf) { 
    this._shouldDelete = tf 
  }

}

export default GameObject