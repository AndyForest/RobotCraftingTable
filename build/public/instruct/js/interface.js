(function () {
  'use strict'
  var server

  var blocklyArea = document.getElementById('blocklyArea')
  var blocklyDiv = document.getElementById('blocklyDiv')
  // var workspace = window.Blockly.inject(blocklyDiv, { media: '../externals/blockly/media/', toolbox: document.getElementById('toolbox') })

  var idSelectorDiv = document.getElementById('pre')

  var init = () => new Promise((resolve, reject) => {
    server = window.io()
    sortCookie();
    resolve()
  })

  var onChangeId = (e) => {
    window.localStorage['selector'] = JSON.stringify({ identifier: e.srcElement.value })

    sortCookie();
  }

  var sortCookie = () => {
    var data = window.localStorage['selector'] ? JSON.parse(window.localStorage['selector']) : '' // load

    if (data === '') {
      console.log('nothing is set yet')
      idSelectorDiv.style.display = 'block'
      // contentDiv.style.display = 'none'
      document.getElementById('idSelector').addEventListener('change', onChangeId)
    } else {
      console.log('this ipad has already received an id', data)
      myID = data["identifier"];

      idSelectorDiv.style.display = 'none'
      // contentDiv.style.display = 'block'

      onresize()
      window.Blockly.svgResize(workspace)

    }
  }

  var addListeners = () => {
    window.addEventListener('resize', onresize, false)
    document.getElementById('sendInstruction').addEventListener('click', sendInstruction)
  }

  var sendInstruction = (evt) => {
    evt.preventDefault()
    server.emit('instructCommand',
      [
        {
          pickup: 4,
          drop: 2
        }, {
          message: 'message here', // relayed to other server
          delay: 4
        }, {
          pickup: (2),
          drop: (1)
        }
      ]
    )
    // document.getElementById('demoMessage').innerHTML = data.message
  }

  var showCode = () => {
    // Generate JavaScript code and display it.
    window.Blockly.JavaScript.INFINITE_LOOP_TRAP = null
    var code = window.Blockly.JavaScript.workspaceToCode(workspace)
    window.alert(code)
  }

  var runCode = () => {
    // Generate JavaScript code and run it.

    console.log('runcode interface.js');

    window.LoopTrap = 1000
    window.Blockly.JavaScript.INFINITE_LOOP_TRAP =
        'if (--window.LoopTrap == 0) throw "Infinite loop.";\n'
    var code = window.Blockly.JavaScript.workspaceToCode(workspace)
    window.Blockly.JavaScript.INFINITE_LOOP_TRAP = null
    try {
      eval(code)
    } catch (e) {
      window.alert(e)
    }
  }

  var onresize = (e) => {
    // Compute the absolute coordinates and dimensions of blocklyArea.
    var element = blocklyArea
    var x = 0
    var y = 0
    do {
      x += element.offsetLeft
      y += element.offsetTop
      element = element.offsetParent
    } while (element)
    // Position blocklyDiv over blocklyArea.
    blocklyDiv.style.left = x + 'px'
    blocklyDiv.style.top = y + 'px'
    blocklyDiv.style.width = blocklyArea.offsetWidth + 'px'
    blocklyDiv.style.height = blocklyArea.offsetHeight + 'px'
  }

  init()
    .then(addListeners)
    .then(() => server.emit('register', 'display'))
    .catch(err => console.log(err))

  window.app = this
}())
