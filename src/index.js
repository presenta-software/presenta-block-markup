import css from './style.css'
import scope from 'scope-css'

import ShortUniqueId from 'short-unique-id'

import Alpine from '../node_modules/alpinejs/dist/module.esm.js'
Alpine.start()

const replacer = (key, value) => {
  if (key.indexOf('_') === 0 || key.indexOf('$') === 0) {
    return undefined
  }
  return value
}

const uuid = new ShortUniqueId()

const poly = ref => {
  const templates = ref.querySelectorAll('svg template')
  let el, template, attribs, attrib, count, child, content
  for (let i = 0; i < templates.length; i++) {
    el = templates[i]
    template = el.ownerDocument.createElement('template')
    el.parentNode.insertBefore(template, el)
    attribs = el.attributes
    count = attribs.length
    while (count-- > 0) {
      attrib = attribs[count]
      template.setAttribute(attrib.name, attrib.value)
      el.removeAttribute(attrib.name)
    }
    el.parentNode.removeChild(el)
    content = template.content
    while ((child = el.firstChild)) {
      content.appendChild(child)
    }
  }
}

const block = function (el, config) {
  const prefix = 'SCOPED' + uuid.randomUUID(6)

  const child = document.createElement('div')
  child.classList.add(css.markup, prefix)

  const bindObject = {}
  const stopKeys = ['type', 'html', 'css', 'fields', 'modules']
  for (const k in config) {
    if (stopKeys.indexOf(k) === -1) {
      bindObject[k] = config[k]
    }
  }

  const confQuery = config._sceneConfig._query
  if (confQuery) {
    for (const k in confQuery) {
      bindObject[k] = confQuery[k]
    }
  }

  console.log(bindObject)
  const dataX = JSON.stringify(bindObject, replacer)
  child.setAttribute('x-data', dataX)

  let sty = ''
  if (config.css) sty = `<style>${scope(' ' + config.css, '.' + prefix)}</style>`
  child.innerHTML = config.html + sty

  poly(child)

  // inject google fonts using Presenta utils
  // kind of hack
  console.log('window.Presenta', window.Presenta)
  if (typeof window !== 'undefined' && window.Presenta && config.fonts) {
    config.fonts.forEach(f => {
      window.Presenta.utils.addFontDep(f)
    })
  }

  el.appendChild(child)
}

block.install = Presenta => {
  Presenta.addBlock('markup', block)
}

export default block

if (typeof window !== 'undefined' && window.Presenta) {
  window.Presenta.use(block)
}
