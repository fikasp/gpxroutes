// @p GPX Studio
//========================
//#region @r UTILITIES
//========================
// @g Logger
//------------------------
const Log = {
	// @b Config
	//------------------------
	config: {
		active: true,
		maxDepth: Infinity,
		location: { active: false, style: 'font-size: 0.9em; font-style: italic; color: dimgray;' },
		divider: { active: false, style: 'font-size: 1.1em; font-weight: bold;', char: '-', length: 12 },
		group: { active: true, style: 'font-size: 1.2em; font-weight: bold;', collapsed: false },
		depth: { active: true, char: ' ' },
	},
	styles: {
		blue: { active: true, style: 'color: steelblue;' },
		gray: { active: true, style: 'color: gray;' },
		orange: { active: true, style: 'color: orange;' },
		red: { active: true, style: 'color: red;' },
		white: { active: true, style: 'color: white;' },
		yellow: { active: true, style: 'color: yellow;' },
	},

	// @b Private
	//------------------------

	// Depth
	_depth: 0,

	// Should log
	_shouldLog() {
		return this.config.active && this._depth <= this.config.maxDepth
	},

	// Get indent
	_getIndent() {
		return this.config.depth.active ? this.config.depth.char.repeat(this._depth) : ''
	},

	// Get caller info
	_getCallerInfo: (idx) => {
		const line = new Error().stack?.split('\n')[idx]?.trim() || ''
		const match = line.match(/at\s+(.+?)\s+\((.+)\)/) || line.match(/^(.+?)@(.+)/)
		if (!match) return { caller: '', location: '' }

		const fullName = match[1]
		const parts = fullName.split('.')
		const caller = parts.pop()
		const fullPath = match[2] || match[1]
		const loc = fullPath.match(/([^\/\\]+):(\d+):\d+/)
		const location = loc ? `${loc[1]}:${loc[2]}` : ''
		return { caller, location }
	},

	// Format args
	_formatArgs: (args) =>
		args
			.map((a) =>
				a instanceof HTMLElement ? `[${a.tagName}]` : typeof a === 'object' ? JSON.stringify(a, null, 2) : a,
			)
			.join(', '),

	// Enter with style
	_enterWithStyle(color, ...data) {
		if (!this.config.active || !this.styles[color]?.active) return

		const indent = this._getIndent()
		const { caller, location } = this._getCallerInfo(4)

		if (this._depth <= this.config.maxDepth) {
			const formatted = data.length > 0 ? this._formatArgs(data) : ''
			const message = `${indent}→ ${caller}(${formatted})`
			console.log(`%c${message}`, this.styles[color].style)

			if (this.config.location.active) {
				console.log(`${indent}%c→ ${location}`, this.config.location.style)
			}
		}
		this._depth++
	},

	// Start with style
	_startWithStyle(color, text = null) {
		if (!this._shouldLog() || !this.config.group.active || !this.styles[color]?.active) return

		const indent = this._getIndent()
		const displayText = text !== null ? text : this._getCallerInfo(5).caller
		const method = this.config.group.collapsed ? console.groupCollapsed : console.group

		const combinedStyle = `${this.config.group.style} ${this.styles[color].style}`
		method(`${indent}%c${displayText}`, combinedStyle)
	},

	// Styled
	_styled(mode, ...args) {
		if (!this._shouldLog() || !this.styles[mode]?.active) return
		const { location } = this._getCallerInfo(4)
		const content = this._formatArgs(args)
		const style = this.styles[mode].style
		const indent = this._getIndent()

		let message = `${indent}%c${content}`
		let styles = [style]

		if (this.config.location.active) {
			message += `\n${indent}%c→ ${location}`
			styles.push(this.config.location.style)
		}
		console.log(message, ...styles)
	},

	// @b Public
	//------------------------

	// Enter
	enter(...data) {
		if (!this.config.active) return

		const indent = this._getIndent()
		const { caller, location } = this._getCallerInfo(3)

		if (this._depth <= this.config.maxDepth) {
			const formatted = data.length > 0 ? this._formatArgs(data) : ''
			console.log(`${indent}→ ${caller}(${formatted})`)

			if (this.config.location.active) {
				console.log(`${indent}%c→ ${location}`, this.config.location.style)
			}
		}
		this._depth++
	},

	// Exit
	exit() {
		if (!this.config.active) return
		this._depth = Math.max(0, this._depth - 1)
	},

	// Start
	start(text = null) {
		if (!this._shouldLog() || !this.config.group.active) return

		const indent = this._getIndent()
		const displayText = text !== null ? text : this._getCallerInfo(3).caller
		const method = this.config.group.collapsed ? console.groupCollapsed : console.group

		method(`${indent}%c${displayText}`, `${this.config.group.style} color: yellow;`)
	},

	// End
	end() {
		if (!this.config.active || !this.config.group.active) return
		console.groupEnd()
	},

	// Default
	default(...args) {
		if (!this._shouldLog()) return
		const indent = this._getIndent()
		console.log(indent, ...args)
		if (this.config.location.active) {
			const { location } = this._getCallerInfo(3)
			console.log(`${indent}%c↑ ${location}`, this.config.location.style)
		}
	},

	// Error
	error(...args) {
		if (!this._shouldLog()) return
		const indent = this._getIndent()
		console.error(indent, ...args)
	},

	// Warn
	warn(...args) {
		if (!this._shouldLog()) return
		const indent = this._getIndent()
		console.warn(indent, ...args)
	},

	// Divider
	divider(text = '') {
		if (!this._shouldLog() || !this.config.divider.active) return

		const char = this.config.divider.char
		const style = this.config.divider.style
		const indent = this._getIndent()

		if (text) {
			console.log(`${indent}%c${text}\n${indent}${char.repeat(text.length)}`, style)
		} else {
			console.log(`${indent}%c${char.repeat(this.config.divider.length)}`, style)
		}
	},

	// Init
	init() {
		Object.keys(this.styles).forEach((color) => {
			this[color] = (...args) => this._styled(color, ...args)
			this.start[color] = (text = null) => this._startWithStyle(color, text)
			this.enter[color] = (...data) => this._enterWithStyle(color, ...data)
		})
	},
}

// @g Storage
//------------------------
const Storage = {
	// Get
	get: (key, defaultValue = null) => {
		try {
			const item = localStorage.getItem(key)
			return item ? JSON.parse(item) : defaultValue
		} catch (e) {
			Log.red('Storage read error:', e)
			return defaultValue
		}
	},
	// Set
	set: (key, value) => {
		try {
			localStorage.setItem(key, JSON.stringify(value))
			return true
		} catch (e) {
			Log.red('Storage write error:', e)
			return false
		}
	},
	// @b Get setting
	//------------------------
	getSetting: (key, defaultValue = null) => {
		const settings = Storage.get(CONFIG.storage.settings, {})
		return settings[key] ?? defaultValue
	},

	// @b Set setting
	//------------------------
	setSetting: (key, value) => {
		const settings = Storage.get(CONFIG.storage.settings, {})
		settings[key] = value
		Storage.set(CONFIG.storage.settings, settings)
	},
}

// @g DOM API
//------------------------
const DOM = {
	// @b Selectors
	//------------------------
	get: (selector, context = document) => context.querySelector(selector),
	getAll: (selector, context = document) => context.querySelectorAll(selector),
	getById: (id) => document.getElementById(id),

	// @b Properties
	//------------------------
	getValue: (element) => element?.value || '',
	setValue: (element, value) => element && (element.value = value),
	setDisabled: (element, disabled) => element && (element.disabled = disabled),
	isDisabled: (element) => element?.disabled || false,

	// @b Content
	//------------------------
	clear: (element) => element && (element.innerHTML = ''),
	setHTML: (element, html) => element && (element.innerHTML = html),
	setText: (element, text) => element && (element.innerText = text),
	getText: (element) => element?.innerText || '',
	getHTML: (element) => element?.innerHTML || '',

	// @b Classes
	//------------------------
	addClass: (element, className) => element?.classList.add(className),
	removeClass: (element, className) => element?.classList.remove(className),
	toggleClass: (element, className) => element?.classList.toggle(className),
	hasClass: (element, className) => element?.classList.contains(className) || false,

	// @b Styles
	//------------------------
	setStyle: (element, property, value) => {
		if (!element) return
		if (typeof property === 'object') {
			Object.entries(property).forEach(([key, val]) => {
				if (key.startsWith('--')) {
					element.style.setProperty(key, val)
				} else {
					element.style[key] = val
				}
			})
		} else if (property.startsWith('--')) {
			element.style.setProperty(property, value)
		} else {
			element.style[property] = value
		}
	},
	getStyle: (element, property) => (element ? getComputedStyle(element)[property] : null),
	setCSS: (property, value) => document.documentElement.style.setProperty(property, value),

	// @b Attributes
	//------------------------
	getAttr: (element, name) => element?.getAttribute(name),
	setAttr: (element, name, value) => element?.setAttribute(name, value),
	removeAttr: (element, name) => element?.removeAttribute(name),
	hasAttr: (element, name) => element?.hasAttribute(name) || false,

	// @b Visibility
	//------------------------
	hide: (element) => element && (element.style.display = 'none'),
	show: (element, display = 'block') => element && (element.style.display = display),
	isVisible: (element) => (element ? element.style.display !== 'none' : false),

	// @b Events
	//------------------------
	on: (element, event, handler, options) => element?.addEventListener(event, handler, options),
	off: (element, event, handler, options) => element?.removeEventListener(event, handler, options),
	trigger: (element, eventName) => {
		if (element) {
			const event = new Event(eventName, { bubbles: true })
			element.dispatchEvent(event)
		}
	},
	onSelectWheel: (selectElement, callback) => {
		if (!selectElement) return
		DOM.on(selectElement, 'wheel', (event) => {
			event.preventDefault()
			const currentIndex = selectElement.selectedIndex
			const maxIndex = selectElement.options.length - 1
			const newIndex = event.deltaY > 0 ? Math.min(currentIndex + 1, maxIndex) : Math.max(currentIndex - 1, 0)
			if (newIndex !== currentIndex) {
				selectElement.selectedIndex = newIndex
				callback()
			}
		})
	},

	// @b Manipulation
	//------------------------
	remove: (element) => element?.remove(),
	append: (parent, child) => parent?.appendChild(child),
	/**
	 * Creates a new HTML element and configures it based on the provided options.
	 * @param {object} options - An object containing the element configuration options.
	 * @param {string} [options.type='div'] - The type of the element to be created. Defaults to "div".
	 * @param {HTMLElement} [options.parent] - The parent to which the created element should be appended.
	 * @param {Array<HTMLElement|string|number>|HTMLElement|string|number} [options.children] - An array of elements or strings representing the children to be appended to the element.
	 * @param {Array<string>} [options.classes=[]] - Array of CSS class names to add.
	 * @param {Object<string, Function>} [options.listeners] - An object containing event listeners. Each key-value pair represents an event name and the corresponding event handler function.
	 * @param {Object<string, string>} [options.dataset] - An object containing key-value pairs to be set as data-* attributes.
	 * @param {Object<string, *>} [options.attributes] - Additional HTML attributes for configuring the element.
	 * @returns {HTMLElement} The created HTML element.
	 * @example
	 * DOM.create({
	 *   type: 'button',
	 *   parent: document.body,
	 *   children: 'Click me',
	 *   classes: ['button'],
	 *   listeners: { click: handleClick },
	 *   dataset: { id: 'button' },
	 *   disabled: false
	 * })
	 */
	create: ({ type = 'div', parent, children, classes = [], listeners, dataset, ...attributes }) => {
		const element = document.createElement(type)
		if (parent) parent.appendChild(element)
		if (classes.length > 0) {
			element.classList.add(...classes)
		}
		if (dataset) {
			Object.entries(dataset).forEach(([key, value]) => {
				element.dataset[key] = value
			})
		}
		if (attributes) {
			Object.entries(attributes).forEach(([key, value]) => {
				element.setAttribute(key, value)
			})
		}
		if (listeners) {
			Object.entries(listeners).forEach(([key, value]) => {
				element.addEventListener(key, value)
			})
		}
		if (children) {
			if (!Array.isArray(children)) children = [children]
			children.forEach((child) => {
				if (typeof child === 'string' || typeof child === 'number') {
					element.appendChild(document.createTextNode(child))
				} else if (child instanceof HTMLElement) {
					element.appendChild(child)
				}
			})
		}
		return element
	},

	// @b Document
	//------------------------
	setFavicon: (canvas) => {
		const existingLink = DOM.get("link[rel='icon']")
		if (existingLink) DOM.remove(existingLink)
		DOM.create({
			type: 'link',
			rel: 'icon',
			href: canvas.toDataURL('image/png'),
			parent: document.head,
		})
	},
	setTitle: (title) => (document.title = title),
	getTemplate: (id) => {
		const template = DOM.getById(id)
		if (!template) {
			console.error(`Template ${id} not found`)
			return null
		}
		return template.content.cloneNode(true)
	},
	scrollTo: (element, options) => element?.scrollTo(options),
	lockScroll: () => (document.body.style.overflow = 'hidden'),
	unlockScroll: () => (document.body.style.overflow = ''),
}

// @g Tools
//------------------------
const Tools = {
	// @b Capitalize
	//------------------------
	capitalize: (str) => {
		if (typeof str !== 'string' || str.length === 0) return str
		return str.charAt(0).toUpperCase() + str.slice(1)
	},

	// @b Debounce
	//------------------------
	debounce: (func, delay) => {
		let timeoutId
		return function (...args) {
			clearTimeout(timeoutId)
			timeoutId = setTimeout(() => func.apply(this, args), delay)
		}
	},

	// @b Lighten color
	//------------------------
	lightenColor: (hex, percent) =>
		'#' +
		hex.slice(1).replace(/../g, (c) =>
			Math.round(parseInt(c, 16) + (255 - parseInt(c, 16)) * percent)
				.toString(16)
				.padStart(2, '0'),
		),

	// @b Throttle
	//------------------------
	throttle: (func, limit) => {
		let lastFunc
		let lastRan
		return function (...args) {
			if (!lastRan) {
				func.apply(this, args)
				lastRan = Date.now()
			} else {
				clearTimeout(lastFunc)
				lastFunc = setTimeout(
					() => {
						if (Date.now() - lastRan >= limit) {
							func.apply(this, args)
							lastRan = Date.now()
						}
					},
					limit - (Date.now() - lastRan),
				)
			}
		}
	},
}
// #endregion
//========================
//#region @r COMPONENTS
//========================
// @g Modal
//------------------------
const Modal = {
	// @b Selectors
	//------------------------
	$: {
		element: DOM.get('.modal'),
		container: DOM.get('.modal__container'),
		content: DOM.get('.modal__content'),
		close: DOM.get('.modal__close'),
	},

	// @b Initialize
	//------------------------
	init: () => {
		Log.enter('Modal')
		// Modal background click
		DOM.on(Modal.$.element, 'click', (e) => {
			if (e.target === Modal.$.element) Modal.close()
		})
		// Modal close button
		DOM.on(Modal.$.close, 'click', Modal.close)
		// Modal ESC key
		DOM.on(document, 'keydown', (e) => {
			if (e.key === 'Escape' && Modal.isOpen()) Modal.close()
		})
		Log.exit()
	},

	// @b Open modal
	//------------------------
	open: (content) => {
		Log.enter('Modal opened')
		if (!Modal.$.element) {
			Log.red('Modal not initialized')
			Log.exit()
			return
		}

		DOM.clear(Modal.$.content)

		if (typeof content === 'string') {
			DOM.setHTML(Modal.$.content, content)
		} else if (content instanceof DocumentFragment || content instanceof HTMLElement) {
			DOM.append(Modal.$.content, content)
		}

		DOM.addClass(Modal.$.element, 'modal--active')
		DOM.lockScroll()
		Log.exit()
	},

	// @b Close modal
	//------------------------
	close: () => {
		Log.enter('Modal closed')
		if (!Modal.$.element) return
		DOM.removeClass(Modal.$.element, 'modal--active')
		DOM.unlockScroll()
		Log.exit()
	},

	// @b Check if modal is open
	//------------------------
	isOpen: () => {
		return Modal.$.element && DOM.hasClass(Modal.$.element, 'modal--active')
	},

	// @b Create simple alert modal
	//------------------------
	alert: (title, message) => {
		const content = DOM.getTemplate('modal-alert')
		if (!content) return

		content.querySelector('.modal__title').textContent = title
		content.querySelector('.modal__text').textContent = message

		Modal.open(content)

		const button = DOM.get('.modal__button', Modal.$.content)
		if (button) {
			DOM.on(button, 'click', Modal.close)
		}
	},

	// @b Create confirm modal
	//------------------------
	confirm: (title, message, onConfirm) => {
		const content = DOM.getTemplate('modal-confirm')
		if (!content) return

		DOM.get('.modal__title', content).textContent = title
		DOM.get('.modal__text', content).textContent = message

		Modal.open(content)

		const cancelBtn = DOM.get('.modal__button--cancel', Modal.$.content)
		const confirmBtn = DOM.get('.modal__button--confirm', Modal.$.content)

		if (cancelBtn) {
			DOM.on(cancelBtn, 'click', Modal.close)
		}

		if (confirmBtn) {
			DOM.on(confirmBtn, 'click', () => {
				Modal.close()
				onConfirm()
			})
		}
	},
}

// @g MapView
//------------------------
const MapView = {
	// @b Private
	//------------------------
	_instance: null,
	_tileLayer: null,

	// @b Initialize
	//------------------------
	init: () => {
		Log.enter('MapView')

		const center = STATE.mapView?.center ?? CONFIG.map.center
		const zoom = STATE.mapView?.zoom ?? CONFIG.map.zoom

		MapView._instance = L.map($.main.map, {
			keyboard: false,
			preferCanvas: true,
			zoomSnap: CONFIG.map.zoomSnap,
			zoomDelta: CONFIG.map.zoomDelta,
			wheelPxPerZoomLevel: CONFIG.map.wheelPxPerZoomLevel,
			closePopupOnClick: false,
		}).setView(center, zoom)

		MapView.setBasemap(STATE.basemap)

		MapView._instance.on('click', Handlers.mapClick)
		MapView._instance.on('popupopen', () => (STATE.popupOpen = true))
		MapView._instance.on('popupclose', () => (STATE.popupOpen = false))
		MapView._instance.on('moveend zoomend', Tools.debounce(Effects.saveMapView, 300))
		MapView._instance.on('zoom zoomend', Effects.updateZoomIndicator)
		Effects.updateZoomIndicator()
		Log.exit()
	},

	// @b Set basemap
	//------------------------
	setBasemap: (key) => {
		const basemap = CONFIG.map.basemaps[key]
		if (!basemap) return

		if (MapView._tileLayer) MapView._instance.removeLayer(MapView._tileLayer)

		const layers = [
			L.tileLayer(basemap.url, {
				attribution: basemap.attribution,
				maxZoom: CONFIG.map.maxZoom,
				maxNativeZoom: basemap.maxNativeZoom,
				zIndex: 1,
			}),
		]

		// Optional shading layer (hillshade) drawn on top of the base tiles
		if (basemap.shading) {
			layers.push(
				L.tileLayer(basemap.shading.url, {
					attribution: basemap.shading.attribution,
					maxZoom: CONFIG.map.maxZoom,
					maxNativeZoom: basemap.shading.maxNativeZoom,
					opacity: basemap.shading.opacity,
					className: 'leaflet-hillshade',
					zIndex: 2,
				}),
			)
		}

		MapView._tileLayer = L.layerGroup(layers).addTo(MapView._instance)
	},

	// @b Add track
	//------------------------
	addTrack: (track) => {
		const layer = L.polyline(track.segments, {
			color: track.color,
			weight: track.weight,
			opacity: CONFIG.track.opacity,
			lineJoin: 'round',
			lineCap: 'round',
		}).addTo(MapView._instance)

		layer.bindTooltip(track.name, { sticky: true })
		return layer
	},

	// @b Remove track
	//------------------------
	removeTrack: (layer) => {
		if (layer) MapView._instance.removeLayer(layer)
	},

	// @b Style track
	//------------------------
	styleTrack: (layer, color, weight) => {
		layer.setStyle({ color, weight })
	},

	// @b Fit bounds
	//------------------------
	fitBounds: (boundsList) => {
		if (boundsList.length === 0) return

		const bounds = L.latLngBounds([])
		boundsList.forEach((b) => bounds.extend(b))

		const padding = Pure.getMapPadding()

		MapView._instance.fitBounds(bounds, {
			paddingTopLeft: padding.topLeft,
			paddingBottomRight: padding.bottomRight,
			maxZoom: CONFIG.map.fitMaxZoom,
		})
	},

	// @b Create view popup
	//------------------------
	createViewPopup: (id, name, desc) => {
		const fragment = DOM.getTemplate('map-popup')
		const wrapper = DOM.create({ type: 'div' })
		wrapper.appendChild(fragment)

		DOM.setText(DOM.get('.map-popup__title', wrapper), name)
		DOM.setText(DOM.get('.map-popup__desc', wrapper), desc || '')

		DOM.on(DOM.get('.map-popup__btn-edit', wrapper), 'click', (e) => {
			L.DomEvent.stop(e)
			Handlers.editWaypointClick(id)
		})
		DOM.on(DOM.get('.map-popup__btn-delete', wrapper), 'click', (e) => {
			L.DomEvent.stop(e)
			Handlers.deleteWaypointClick(id)
		})

		return wrapper
	},

	// @b Create form popup
	//------------------------
	createFormPopup: (name, desc, onSave, onCancel) => {
		const fragment = DOM.getTemplate('map-popup-form')
		const wrapper = DOM.create({ type: 'div' })
		wrapper.appendChild(fragment)

		const input = DOM.get('.map-popup__input', wrapper)
		const textarea = DOM.get('.map-popup__textarea', wrapper)

		DOM.setValue(input, name)
		DOM.setValue(textarea, desc)

		DOM.on(DOM.get('.map-popup__btn-cancel', wrapper), 'click', (e) => {
			L.DomEvent.stop(e)
			onCancel()
		})

		const save = (e) => {
			if (e) L.DomEvent.stop(e)
			const newName = DOM.getValue(input).trim()
			if (!newName) {
				DOM.setStyle(input, 'outline', '1px solid var(--red)')
				return
			}
			onSave(newName, DOM.getValue(textarea).trim())
		}

		DOM.on(DOM.get('.map-popup__btn-save', wrapper), 'click', save)
		DOM.on(input, 'keydown', (e) => {
			if (e.key === 'Enter') save(e)
		})

		setTimeout(() => input?.focus(), 50)
		return wrapper
	},

	// @b Add marker
	//------------------------
	addMarker: (id, lat, lon, name, desc) => {
		const marker = L.marker([lat, lon]).addTo(MapView._instance)
		marker.bindPopup(MapView.createViewPopup(id, name, desc), { closeButton: false, ...Pure.getPopupPadding() })
		return marker
	},

	// @b Remove marker
	//------------------------
	removeMarker: (marker) => {
		if (marker) MapView._instance.removeLayer(marker)
	},

	// @b Focus marker
	//------------------------
	focusMarker: (marker) => {
		const padding = Pure.getMapPadding()

		MapView._instance.panInside(marker.getLatLng(), {
			paddingTopLeft: padding.topLeft,
			paddingBottomRight: padding.bottomRight,
		})

		marker.openPopup()
	},

	// @b Enable/disable adding
	//------------------------
	disableAdding: () => {
		MapView._instance.off('click', Handlers.mapClick)
	},

	enableAdding: () => {
		MapView._instance.on('click', Handlers.mapClick)
	},

	// @b Open add popup
	//------------------------
	openAddPopup: (lat, lon, onSave) => {
		Log.enter()
		MapView.disableAdding()

		const marker = L.marker([lat, lon]).addTo(MapView._instance)
		marker._saved = false

		const cleanup = () => {
			STATE.activeCancel = null
			MapView.enableAdding()
			if (MapView._instance.hasLayer(marker)) {
				MapView._instance.removeLayer(marker)
			}
		}

		const save = (name, desc) => {
			marker._saved = true
			STATE.activeCancel = null
			MapView.enableAdding()
			onSave(marker, name, desc)
		}

		const content = MapView.createFormPopup('', '', save, cleanup)

		marker.bindPopup(content, { closeButton: false, closeOnClick: false, ...Pure.getPopupPadding() }).openPopup()
		STATE.activeCancel = cleanup

		marker.on('popupclose', () => {
			if (!marker._saved) {
				setTimeout(() => {
					cleanup()
				}, 0)
			}
		})
		Log.exit()
	},

	// @b Open edit popup
	//------------------------
	openEditPopup: (marker, id, name, desc, onSave) => {
		Log.enter()
		MapView.disableAdding()
		const originalLatLng = marker.getLatLng()
		let currentLatLng = marker.getLatLng()

		marker.closePopup()
		marker.unbindPopup()

		marker.dragging.enable()

		const finishEditing = () => {
			marker.off('dragstart', handleDragStart)
			marker.off('dragend', handleDragEnd)
			marker.dragging.disable()
			MapView.enableAdding()
			STATE.activeCancel = null
		}

		const revertToView = () => {
			finishEditing()
			marker.setLatLng(originalLatLng)
			marker.unbindPopup()
			marker
				.bindPopup(MapView.createViewPopup(id, name, desc), {
					closeButton: false,
					closeOnClick: true,
					...Pure.getPopupPadding(),
				})
				.openPopup()
		}

		const save = (newName, newDesc) => {
			finishEditing()
			onSave(newName, newDesc, currentLatLng.lat, currentLatLng.lng) // Logic.editWaypoint sets the view popup
		}

		const content = MapView.createFormPopup(name, desc, save, revertToView)

		marker.bindPopup(content, { closeButton: false, closeOnClick: false, ...Pure.getPopupPadding() }).openPopup()
		STATE.activeCancel = revertToView

		const handleDragStart = () => {
			marker.closePopup()
		}

		const handleDragEnd = () => {
			currentLatLng = marker.getLatLng()
			marker.openPopup()
		}

		marker.on('dragstart', handleDragStart)
		marker.on('dragend', handleDragEnd)

		Log.exit()
	},
}

// @g Panel
//------------------------
const Panel = {
	// @b Create item
	//------------------------
	createItem: (name, color, weight, onStyleClick) => {
		const item = DOM.getTemplate('track-item').firstElementChild
		const styleButton = DOM.get('.panel__item-style', item)

		DOM.setText(DOM.get('.panel__item-name', item), name)
		Panel.paintStyleButton(styleButton, color, weight)
		DOM.on(styleButton, 'click', (e) => onStyleClick(e.currentTarget))

		return item
	},

	// @b Paint style button
	//------------------------
	paintStyleButton: (button, color, weight) => {
		button.style.backgroundColor = color
		button.classList.toggle('panel__item-style--light', Pure.isLightColor(color))
		DOM.setText(button, `${weight}px`)
	},

	// @b Render tracks list
	//------------------------
	renderTracks: () => {
		DOM.clear($.panel.routesList)

		STATE.tracks.forEach((track) => {
			const item = Panel.createItem(track.name, track.color, track.weight, (anchor) =>
				Handlers.styleClick(track.id, anchor),
			)
			item.dataset.id = track.id

			const main = DOM.get('.panel__item-main', item)
			main.title = track.name
			DOM.setText(DOM.get('.panel__item-meta', item), `${Pure.formatKm(track.distance)} km`)
			DOM.on(main, 'click', () => Handlers.selectTrackClick(track.id))
			DOM.on(DOM.get('.panel__item-delete', item), 'click', () => Handlers.deleteTrackClick(track.id))

			$.panel.routesList.appendChild(item)
		})

		DOM.setText($.panel.routesCount, STATE.tracks.length)
	},

	// @b Render points list
	//------------------------
	renderPoints: () => {
		DOM.clear($.panel.pointsList)

		STATE.waypoints.forEach((wp) => {
			const item = DOM.create({
				type: 'li',
				classes: ['panel__point'],
				parent: $.panel.pointsList,
				draggable: 'true',
				dataset: { id: wp.id },
			})

			const mainContainer = DOM.create({ type: 'div', classes: ['panel__point-main'], parent: item })

			DOM.on(mainContainer, 'click', () => Handlers.selectWaypointClick(wp.id))

			DOM.create({
				type: 'span',
				classes: ['panel__point-handle'],
				children: '⠿',
				parent: mainContainer,
			})

			DOM.create({
				type: 'span',
				classes: ['panel__point-name'],
				children: wp.name,
				parent: mainContainer,
				title: wp.desc || wp.name,
			})

			const actionsContainer = DOM.create({ type: 'div', classes: ['panel__point-actions'], parent: item })

			DOM.create({
				type: 'button',
				classes: ['panel__point-edit'],
				children: '✎',
				parent: actionsContainer,
				title: 'Edytuj punkt',
				listeners: { click: () => Handlers.editWaypointClick(wp.id) },
			})

			DOM.create({
				type: 'button',
				classes: ['panel__point-delete'],
				children: '×',
				parent: actionsContainer,
				title: 'Usuń punkt',
				listeners: { click: () => Handlers.deleteWaypointClick(wp.id) },
			})
		})

		DOM.setText($.panel.pointsCount, STATE.waypoints.length)
	},

	// @b Sync style buttons
	//------------------------
	syncControls: () => {
		Panel.paintStyleButton(Panel._globalStyleButton, STATE.globalColor, STATE.globalWeight)
		STATE.tracks.forEach((track) => {
			const item = DOM.get(`.panel__item[data-id="${track.id}"]`, $.panel.routesList)
			if (!item) return
			Panel.paintStyleButton(DOM.get('.panel__item-style', item), track.color, track.weight)
		})
	},

	// @b Init global item
	//------------------------
	initGlobalControls: () => {
		const item = Panel.createItem('Wszystkie trasy', STATE.globalColor, STATE.globalWeight, Handlers.globalStyleClick)
		item.classList.add('panel__item--global')
		DOM.get('.panel__item-meta', item).remove()
		DOM.get('.panel__item-delete', item).remove()

		Panel._globalStyleButton = DOM.get('.panel__item-style', item)
		$.panel.global.appendChild(item)
	},

	// @b Private
	//------------------------
	_globalStyleButton: null,
}

// @g StylePicker
//------------------------
// One popup for line style: color palette (CONFIG.defaults.trackColors) + width slider
const StylePicker = {
	_element: null,
	_range: null,
	_label: null,
	_anchor: null,
	_onColor: null,
	_onWeight: null,

	// @b Initialize
	//------------------------
	init: () => {
		Log.enter('StylePicker')
		StylePicker._element = DOM.getTemplate('style-picker').firstElementChild
		document.body.appendChild(StylePicker._element)

		const palette = DOM.get('.style-picker__palette', StylePicker._element)
		CONFIG.defaults.trackColors.forEach((color) => {
			const swatch = DOM.create({
				type: 'button',
				classes: ['style-picker__swatch'],
				parent: palette,
				title: color,
				dataset: { color },
			})
			swatch.style.backgroundColor = color
		})

		StylePicker._range = DOM.get('.style-picker__range', StylePicker._element)
		StylePicker._range.min = CONFIG.track.minWeight
		StylePicker._range.max = CONFIG.track.maxWeight
		StylePicker._range.step = 1
		StylePicker._label = DOM.get('.style-picker__label', StylePicker._element)

		DOM.on(palette, 'click', StylePicker._swatchClick)
		DOM.on(StylePicker._range, 'input', StylePicker._rangeInput)
		// Close on outside click, Escape, window resize and any scroll (e.g. the track list)
		DOM.on(document, 'mousedown', StylePicker._outsideMouseDown)
		DOM.on(document, 'keydown', (e) => e.key === 'Escape' && StylePicker.close())
		DOM.on(document, 'scroll', StylePicker.close, true)
		DOM.on(window, 'resize', StylePicker.close)
		Log.exit()
	},

	isOpen: () => StylePicker._element.classList.contains('style-picker--active'),

	// @b Open next
	//------------------------
	open: (anchor, { color, weight }, { onColor, onWeight }) => {
		// Second click on the same anchor closes the picker
		if (StylePicker.isOpen() && StylePicker._anchor === anchor) {
			StylePicker.close()
			return
		}

		StylePicker._anchor = anchor
		StylePicker._onColor = onColor
		StylePicker._onWeight = onWeight

		StylePicker._markColor(color)
		StylePicker._range.value = weight
		DOM.setText(StylePicker._label, `${weight}px`)

		DOM.addClass(StylePicker._element, 'style-picker--active')

		// Position under the anchor, kept inside the viewport
		const margin = 8
		const rect = anchor.getBoundingClientRect()
		const width = StylePicker._element.offsetWidth
		const height = StylePicker._element.offsetHeight

		const left = Math.min(rect.left, window.innerWidth - width - margin)
		let top = rect.bottom + 6
		if (top + height > window.innerHeight - margin) top = rect.top - height - 6

		StylePicker._element.style.left = `${Math.max(margin, left)}px`
		StylePicker._element.style.top = `${Math.max(margin, top)}px`
	},

	// @b Close
	//------------------------
	close: () => {
		if (!StylePicker._element || !StylePicker.isOpen()) return
		DOM.removeClass(StylePicker._element, 'style-picker--active')
		StylePicker._anchor = null
		StylePicker._onColor = null
		StylePicker._onWeight = null
	},

	// @b Mark color
	//------------------------
	_markColor: (color) => {
		DOM.getAll('.style-picker__swatch', StylePicker._element).forEach((swatch) => {
			swatch.classList.toggle(
				'style-picker__swatch--selected',
				swatch.dataset.color.toLowerCase() === color.toLowerCase(),
			)
		})
	},

	// @b Swatch click
	//------------------------
	_swatchClick: (e) => {
		const swatch = e.target.closest('.style-picker__swatch')
		if (!swatch) return

		StylePicker._markColor(swatch.dataset.color)
		if (StylePicker._onColor) StylePicker._onColor(swatch.dataset.color)
	},

	// @b Range input
	//------------------------
	_rangeInput: (e) => {
		const weight = Number(e.target.value)
		DOM.setText(StylePicker._label, `${weight}px`)
		if (StylePicker._onWeight) StylePicker._onWeight(weight)
	},

	// @b Outside mouse down
	//------------------------
	_outsideMouseDown: (e) => {
		if (!StylePicker.isOpen()) return
		if (StylePicker._element.contains(e.target) || StylePicker._anchor?.contains(e.target)) return
		StylePicker.close()
	},
}

// #endregion
//========================
//#region @r CONFIG
//========================
const CONFIG = {
	map: {
		zoom: 6,
		center: [52.0, 19.0],
		maxZoom: 19,
		fitMaxZoom: 16,
		basemapWheelDelay: 200,
		zoomSnap: 0.5,
		zoomDelta: 0.5,
		wheelPxPerZoomLevel: 120,
		basemaps: {
			osm: {
				url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
				attribution: '&copy; OpenStreetMap contributors',
				maxNativeZoom: 19,
			},
			osmShade: {
				url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
				attribution: '&copy; OpenStreetMap contributors',
				maxNativeZoom: 19,
				shading: {
					url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}',
					attribution: 'Hillshade &copy; Esri',
					maxNativeZoom: 15,
					opacity: 0.6,
				},
			},
			outdoor: {
				url: 'https://outdoor.tiles.freemap.sk/{z}/{x}/{y}',
				attribution: '&copy; Freemap Slovakia, &copy; OpenStreetMap contributors',
				maxNativeZoom: 18,
			},
			topo: {
				url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
				attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
				maxNativeZoom: 17,
			},
		},
		headerHeight: 48,
		footerHeight: 36,
	},
	gpx: {
		creator: 'GPX Studio',
		fileName: 'Punkty',
		coordPrecision: 7,
	},
	track: {
		opacity: 0.9,
		defaultWeight: 5,
		minWeight: 1,
		maxWeight: 9,
		lightColorThreshold: 0.6,
	},
	panel: {
		minWidth: 320,
		maxWidth: 900,
		minMapWidth: 0,
	},
	storage: {
		settings: 'GPX_settings',
		waypoints: 'GPX_waypoints',
	},
	defaults: {
		trackColor: '#444444',
		trackColors: [
			// gray
			'#000000',
			'#222222',
			'#444444',
			'#888888',
			'#ffffff',
			// blue
			'#002244',
			'#224466',
			'#336699',
			'#4488cc',
			'#66bbff',
			// brown
			'#442200',
			'#664422',
			'#996633',
			'#cc8844',
			'#ffbb66',
		],
		basemap: 'osm',
		activeTab: 'routes',
		panelCollapsed: false,
		panelWidth: 300,
	},
}

//#endregion
//========================
//#region @r STATE
//========================
const STATE = {
	tracks: [],
	nextTrackId: 1,
	waypoints: [],
	nextPointId: 1,
	activeTab: CONFIG.defaults.activeTab,
	addMode: false,
	activeCancel: null,
	basemapWheelAt: 0,
	draggedId: null,
	popupOpen: false,
	panelCollapsed: CONFIG.defaults.panelCollapsed,
	panelWidth: CONFIG.defaults.panelWidth,
	mapView: null,
	globalColor: CONFIG.defaults.trackColor,
	globalWeight: CONFIG.track.defaultWeight,
	basemap: CONFIG.defaults.basemap,
	fullscreen: false,
	isDragging: false,
}
//#endregion
//========================
//#region @r SELECTORS
//========================
const $ = {
	body: DOM.get('body'),
	header: {
		element: DOM.get('header'),
	},
	main: {
		element: DOM.get('main'),
		map: DOM.getById('map'),
		zoom: DOM.getById('zoom-indicator'),
	},
	panel: {
		element: DOM.getById('panel'),
		tabs: DOM.getById('panel-tabs'),
		sectionRoutes: DOM.getById('section-routes'),
		sectionPoints: DOM.getById('section-points'),
		routesList: DOM.getById('panel-routes-list'),
		routesCount: DOM.getById('routes-count'),
		pointsList: DOM.getById('panel-points-list'),
		pointsCount: DOM.getById('points-count'),
		addModeButton: DOM.getById('panel-add-mode'),
		sortButton: DOM.getById('panel-sort'),
		saveButton: DOM.getById('panel-save'),
		toggleButton: DOM.getById('panel-toggle'),
		importButton: DOM.get('#panel-import-btn'),
		importInput: DOM.get('#panel-import-input'),
		clearButton: DOM.getById('panel-clear'),
		basemap: DOM.getById('panel-basemap'),
		global: DOM.getById('panel-global'),
		resizer: DOM.getById('panel-resizer'),
	},
	footer: {
		element: DOM.get('footer'),
	},
}
//#endregion
//========================
//#region @r PURE
//========================
const Pure = {
	// @b Parse GPX
	//------------------------
	// Returns { segments, waypoints } or null if the file is not valid XML.
	// segments: [[[lat, lon], ...], ...] (tracks, or routes as a fallback), waypoints: [{ lat, lon, name, desc }]
	parseGpx: (text) => {
		const doc = new DOMParser().parseFromString(text, 'application/xml')
		if (doc.getElementsByTagName('parsererror').length > 0) return null

		const readPoints = (nodes) =>
			Array.from(nodes)
				.map((n) => [parseFloat(n.getAttribute('lat')), parseFloat(n.getAttribute('lon'))])
				.filter(([lat, lon]) => Number.isFinite(lat) && Number.isFinite(lon))

		// Tracks first
		let segments = Array.from(doc.getElementsByTagName('trkseg'))
			.map((seg) => readPoints(seg.getElementsByTagName('trkpt')))
			.filter((seg) => seg.length > 1)

		// Fallback: routes
		if (segments.length === 0) {
			segments = Array.from(doc.getElementsByTagName('rte'))
				.map((rte) => readPoints(rte.getElementsByTagName('rtept')))
				.filter((seg) => seg.length > 1)
		}

		// Waypoints
		const waypoints = Array.from(doc.getElementsByTagName('wpt'))
			.map((wpt) => ({
				lat: parseFloat(wpt.getAttribute('lat')),
				lon: parseFloat(wpt.getAttribute('lon')),
				name: wpt.getElementsByTagName('name')[0]?.textContent.trim() ?? '',
				desc: wpt.getElementsByTagName('desc')[0]?.textContent.trim() ?? '',
			}))
			.filter((wp) => Number.isFinite(wp.lat) && Number.isFinite(wp.lon))

		return { segments, waypoints }
	},

	// @b Distance (km)
	//------------------------
	distanceKm: (segments) => {
		const R = 6371
		const rad = (deg) => (deg * Math.PI) / 180
		let total = 0

		segments.forEach((seg) => {
			for (let i = 1; i < seg.length; i++) {
				const [lat1, lon1] = seg[i - 1]
				const [lat2, lon2] = seg[i]
				const dLat = rad(lat2 - lat1)
				const dLon = rad(lon2 - lon1)
				const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2
				total += 2 * R * Math.asin(Math.sqrt(a))
			}
		})

		return total
	},

	// @b Format km
	//------------------------
	formatKm: (km) => km.toFixed(1).replace('.', ','),

	// @b Strip .gpx extension
	//------------------------
	stripExtension: (name) => name.replace(/\.gpx$/i, ''),

	// @b Escape XML
	//------------------------
	escapeXml: (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),

	// @b Build GPX xml
	//------------------------
	buildGpx: (waypoints) => {
		Log.enter('buildGpx')

		let gpx = '<?xml version="1.0" encoding="UTF-8"?>\n'
		gpx += `<gpx version="1.1" creator="${CONFIG.gpx.creator}" xmlns="http://www.topografix.com/GPX/1/1">\n`

		waypoints.forEach((wp) => {
			gpx += `\t<wpt lat="${wp.lat.toFixed(CONFIG.gpx.coordPrecision)}" lon="${wp.lon.toFixed(CONFIG.gpx.coordPrecision)}">\n`
			gpx += `\t\t<name>${Pure.escapeXml(wp.name)}</name>\n`

			if (wp.desc) {
				gpx += `\t\t<desc>${Pure.escapeXml(wp.desc)}</desc>\n`
			}

			gpx += `\t</wpt>\n`
		})

		gpx += '</gpx>'

		Log.exit()
		return gpx
	},

	// @b Is light color
	//------------------------
	isLightColor: (hex) => {
		const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
		return (0.299 * r + 0.587 * g + 0.114 * b) / 255 >= CONFIG.track.lightColorThreshold
	},

	// @b Map padding
	//------------------------
	getMapPadding: () => {
		const panelWidth = STATE.panelCollapsed ? 0 : STATE.panelWidth
		const header = STATE.fullscreen ? 0 : CONFIG.map.headerHeight
		const footer = STATE.fullscreen ? 0 : CONFIG.map.footerHeight
		return { topLeft: [20, header + 20], bottomRight: [panelWidth + 20, footer + 20] }
	},

	// @b Popup autoPan padding
	//------------------------
	getPopupPadding: () => {
		const padding = Pure.getMapPadding()
		return { autoPanPaddingTopLeft: padding.topLeft, autoPanPaddingBottomRight: padding.bottomRight }
	},

	// @b Get max panel width
	//------------------------
	getMaxPanelWidth: () => Math.min(CONFIG.panel.maxWidth, window.innerWidth - CONFIG.panel.minMapWidth),
}
//#endregion
//========================
//#region @r EFFECTS
//========================
const Effects = {
	// @b Update favicon
	//------------------------
	updateFavicon: () => {
		Log.enter()
		const canvas = DOM.create({
			type: 'canvas',
			height: 32,
			width: 32,
		})

		const ctx = canvas.getContext('2d')
		ctx.fillStyle = 'black'
		ctx.fillRect(0, 0, 32, 32)

		DOM.setFavicon(canvas)
		Log.exit()
	},

	// @b Save all settings to storage
	//------------------------
	saveSettings: () => {
		Storage.set(CONFIG.storage.settings, {
			panelCollapsed: STATE.panelCollapsed,
			panelWidth: STATE.panelWidth,
			mapView: STATE.mapView,
			globalColor: STATE.globalColor,
			globalWeight: STATE.globalWeight,
			basemap: STATE.basemap,
			activeTab: STATE.activeTab,
		})
	},

	// @b Save waypoints to storage
	//------------------------
	saveWaypoints: () => {
		const data = STATE.waypoints.map((wp) => ({ id: wp.id, lat: wp.lat, lon: wp.lon, name: wp.name, desc: wp.desc }))
		Storage.set(CONFIG.storage.waypoints, data)
	},

	// @b Download waypoints as GPX file
	//------------------------
	downloadGpx: (waypoints) => {
		Log.enter('downloadGpx')
		const xml = Pure.buildGpx(waypoints)
		const blob = new Blob([xml], { type: 'application/gpx+xml' })
		const url = URL.createObjectURL(blob)
		const filename = `${CONFIG.gpx.fileName}.gpx`

		const link = DOM.create({
			type: 'a',
			href: url,
			download: filename,
		})
		link.click()
		URL.revokeObjectURL(url)
		Log.exit()
	},

	// @b Apply active tab
	//------------------------
	applyTab: () => {
		const isRoutes = STATE.activeTab === 'routes'
		$.panel.sectionRoutes.hidden = !isRoutes
		$.panel.sectionPoints.hidden = isRoutes
		$.panel.saveButton.hidden = isRoutes

		DOM.getAll('.panel__tab', $.panel.tabs).forEach((tab) => {
			tab.classList.toggle('panel__tab--active', tab.dataset.tab === STATE.activeTab)
		})
	},

	// @b Apply add mode
	//------------------------
	applyAddMode: () => {
		const active = STATE.addMode && STATE.activeTab === 'points'
		$.main.map.classList.toggle('main__map--adding', active)
		$.panel.addModeButton.classList.toggle('panel__tool--active', STATE.addMode)
	},

	// @b Save current map view to storage
	//------------------------
	saveMapView: () => {
		if (!MapView._instance) return
		const center = MapView._instance.getCenter()
		STATE.mapView = { center: [center.lat, center.lng], zoom: MapView._instance.getZoom() }
		Effects.saveSettings()
	},

	// @b Update panel visibility
	//------------------------
	updatePanelVisibility: () => {
		if (STATE.panelCollapsed) {
			DOM.removeClass($.panel.element, 'main__panel--expanded')
		} else {
			DOM.addClass($.panel.element, 'main__panel--expanded')
		}
		Effects.saveSettings()
	},

	// @b Update basemap select
	//------------------------
	updateBasemapSelect: () => {
		$.panel.basemap.value = STATE.basemap
	},

	// @b Update zoom indicator
	//------------------------
	updateZoomIndicator: () => {
		if (!MapView._instance) return
		const zoom = Number(MapView._instance.getZoom().toFixed(1))
		DOM.setText($.main.zoom, `Zoom: ${String(zoom).replace('.', ',')}`)
	},

	// @b Update fullscreen mode
	//------------------------
	updateFullscreen: () => {
		const isFullscreen =
			!!document.fullscreenElement ||
			window.matchMedia('(display-mode: fullscreen)').matches ||
			(Math.abs(window.innerWidth - screen.width) <= 1 && Math.abs(window.innerHeight - screen.height) <= 1)

		if (isFullscreen === STATE.fullscreen) return
		STATE.fullscreen = isFullscreen

		if (isFullscreen) {
			DOM.addClass($.body, 'fullscreen')
		} else {
			DOM.removeClass($.body, 'fullscreen')
		}

		if (MapView._instance) {
			MapView._instance.invalidateSize({ animate: false })
		}
	},

	// @b Apply panel width
	//------------------------
	applyPanelWidth: () => {
		DOM.setStyle($.panel.element, '--panel-min-width', `${CONFIG.panel.minWidth}px`)
		DOM.setStyle($.panel.element, '--panel-max-width', `${CONFIG.panel.maxWidth}px`)
		DOM.setStyle($.panel.element, '--panel-width', `${STATE.panelWidth}px`)
	},
}
//#endregion
//========================
//#region @r LOGIC
//========================
const Logic = {
	// @b Load settings
	//------------------------
	loadSettings: () => {
		Log.enter('loadSettings')
		const settings = Storage.get(CONFIG.storage.settings, {})
		STATE.panelCollapsed = settings.panelCollapsed ?? CONFIG.defaults.panelCollapsed
		STATE.panelWidth = settings.panelWidth ?? CONFIG.defaults.panelWidth
		STATE.mapView = settings.mapView ?? null
		if (['routes', 'points'].includes(settings.activeTab)) STATE.activeTab = settings.activeTab
		if (/^#[0-9a-f]{6}$/i.test(settings.globalColor)) STATE.globalColor = settings.globalColor
		if (Object.hasOwn(CONFIG.map.basemaps, settings.basemap)) STATE.basemap = settings.basemap
		const weight = Number(settings.globalWeight)
		if (Number.isFinite(weight)) {
			STATE.globalWeight = Math.max(CONFIG.track.minWeight, Math.min(Math.round(weight), CONFIG.track.maxWeight))
		}
		Log.exit()
	},

	// @b Clamp panel width
	//------------------------
	clampPanelWidth: () => {
		STATE.panelWidth = Math.max(CONFIG.panel.minWidth, Math.min(STATE.panelWidth, Pure.getMaxPanelWidth()))
	},

	// @b Add track
	//------------------------
	addTrack: (name, segments) => {
		const id = STATE.nextTrackId++
		const track = {
			id,
			name,
			segments,
			color: STATE.globalColor,
			weight: STATE.globalWeight,
			distance: Pure.distanceKm(segments),
			layer: null,
		}
		track.layer = MapView.addTrack(track)
		STATE.tracks.push(track)
		return track
	},

	// @b Remove track
	//------------------------
	removeTrack: (id) => {
		const index = STATE.tracks.findIndex((t) => t.id === id)
		if (index === -1) return
		MapView.removeTrack(STATE.tracks[index].layer)
		STATE.tracks.splice(index, 1)
		Panel.renderTracks()
	},

	// @b Set color
	//------------------------
	setColor: (id, color) => {
		const track = STATE.tracks.find((t) => t.id === id)
		if (!track) return
		track.color = color
		MapView.styleTrack(track.layer, track.color, track.weight)
		Panel.syncControls()
	},

	// @b Set weight
	//------------------------
	setWeight: (id, weight) => {
		const track = STATE.tracks.find((t) => t.id === id)
		if (!track) return
		track.weight = weight
		MapView.styleTrack(track.layer, track.color, track.weight)
		Panel.syncControls()
	},

	// @b Set basemap
	//------------------------
	setBasemap: (key) => {
		if (!Object.hasOwn(CONFIG.map.basemaps, key)) return
		STATE.basemap = key
		MapView.setBasemap(key)
		Effects.updateBasemapSelect()
		Effects.saveSettings()
	},

	// @b Set color for all tracks
	//------------------------
	setAllColor: (color) => {
		STATE.globalColor = color
		Effects.saveSettings()
		STATE.tracks.forEach((track) => {
			track.color = color
			MapView.styleTrack(track.layer, track.color, track.weight)
		})
		Panel.syncControls()
	},

	// @b Set weight for all tracks
	//------------------------
	setAllWeight: (weight) => {
		STATE.globalWeight = weight
		Effects.saveSettings()
		STATE.tracks.forEach((track) => {
			track.weight = weight
			MapView.styleTrack(track.layer, track.color, track.weight)
		})
		Panel.syncControls()
	},

	// @b Clear all tracks
	//------------------------
	clearTracks: () => {
		STATE.tracks.forEach((track) => MapView.removeTrack(track.layer))
		STATE.tracks = []
		Panel.renderTracks()
	},

	// @b Set active tab
	//------------------------
	setTab: (tab) => {
		if (!['routes', 'points'].includes(tab) || tab === STATE.activeTab) return
		STATE.activeTab = tab
		StylePicker.close()
		Effects.applyTab()
		Effects.applyAddMode()
		Effects.saveSettings()
	},

	// @b Set add mode
	//------------------------
	setAddMode: (enabled) => {
		STATE.addMode = enabled
		Effects.applyAddMode()
	},

	// @b Add waypoint
	//------------------------
	addWaypoint: (lat, lon, name, desc = '', existingMarker = null, silent = false) => {
		Log.enter(name, desc)
		const id = STATE.nextPointId++
		const finalName = name || `Punkt ${id}`
		const marker = existingMarker || MapView.addMarker(id, lat, lon, finalName, desc)

		if (existingMarker) {
			marker.setPopupContent(MapView.createViewPopup(id, finalName, desc))
		}

		const waypoint = { id, lat, lon, name: finalName, desc, marker }
		STATE.waypoints.push(waypoint)

		if (!silent) {
			Panel.renderPoints()
			Effects.saveWaypoints()
		}
		Log.exit()
		return waypoint
	},

	// @b Edit waypoint
	//------------------------
	editWaypoint: (id, newName, newDesc, lat, lon) => {
		Log.enter(id, newName, newDesc)
		const waypoint = STATE.waypoints.find((wp) => wp.id === id)
		if (!waypoint) return

		waypoint.name = newName
		waypoint.desc = newDesc
		if (typeof lat === 'number' && typeof lon === 'number') {
			waypoint.lat = lat
			waypoint.lon = lon
		}

		if (waypoint.marker) {
			waypoint.marker.setPopupContent(MapView.createViewPopup(id, newName, newDesc))
		}

		Panel.renderPoints()
		Effects.saveWaypoints()
		Log.exit()
	},

	// @b Remove waypoint
	//------------------------
	removeWaypoint: (id) => {
		const waypoint = STATE.waypoints.find((wp) => wp.id === id)
		if (!waypoint) return

		MapView.removeMarker(waypoint.marker)
		STATE.waypoints = STATE.waypoints.filter((wp) => wp.id !== id)
		Effects.saveWaypoints()
		Panel.renderPoints()
	},

	// @b Clear all waypoints
	//------------------------
	clearWaypoints: () => {
		STATE.waypoints.forEach((wp) => MapView.removeMarker(wp.marker))
		STATE.waypoints = []
		Effects.saveWaypoints()
		Panel.renderPoints()
	},

	// @b Load waypoints from storage
	//------------------------
	loadWaypoints: () => {
		Log.enter('loadWaypoints')
		const saved = Storage.get(CONFIG.storage.waypoints, null) ?? []

		saved.forEach((wp) => {
			const marker = MapView.addMarker(wp.id, wp.lat, wp.lon, wp.name, wp.desc)
			STATE.waypoints.push({ ...wp, marker })
		})

		if (saved.length > 0) {
			STATE.nextPointId = Math.max(...saved.map((wp) => wp.id)) + 1
			Effects.saveWaypoints()
		}
		Log.exit()
	},

	// @b Reorder waypoints (drag & drop)
	//------------------------
	reorderWaypoints: (draggedId, targetId) => {
		const fromIndex = STATE.waypoints.findIndex((wp) => wp.id === draggedId)
		const toIndex = STATE.waypoints.findIndex((wp) => wp.id === targetId)
		if (fromIndex === -1 || toIndex === -1) return

		const [moved] = STATE.waypoints.splice(fromIndex, 1)
		STATE.waypoints.splice(toIndex, 0, moved)

		Panel.renderPoints()
		Effects.saveWaypoints()
	},

	// @b Sort waypoints alphabetically
	//------------------------
	sortWaypointsByName: () => {
		Log.enter('sortWaypointsByName')
		STATE.waypoints.sort((a, b) => a.name.localeCompare(b.name, 'pl'))
		Panel.renderPoints()
		Effects.saveWaypoints()
		Log.exit()
	},

	// @b Import GPX files
	//------------------------
	importFiles: async (files) => {
		Log.enter('importFiles', files.length)

		const results = await Promise.all(
			files.map(async (file) => {
				try {
					return { file, data: Pure.parseGpx(await file.text()) }
				} catch (e) {
					Log.red('File read error:', file.name, e)
					return { file, data: null }
				}
			}),
		)

		const addedTracks = []
		const addedPoints = []
		const failed = []

		results.forEach(({ file, data }) => {
			if (!data || (data.segments.length === 0 && data.waypoints.length === 0)) {
				failed.push(file.name)
				return
			}
			if (data.segments.length > 0) {
				addedTracks.push(Logic.addTrack(Pure.stripExtension(file.name), data.segments))
			}
			data.waypoints.forEach((wp) => {
				addedPoints.push(Logic.addWaypoint(wp.lat, wp.lon, wp.name, wp.desc, null, true))
			})
		})

		Panel.renderTracks()
		if (addedPoints.length > 0) {
			Panel.renderPoints()
			Effects.saveWaypoints()
		}

		if (addedTracks.length > 0 || addedPoints.length > 0) {
			if (STATE.panelCollapsed) {
				STATE.panelCollapsed = false
				Effects.updatePanelVisibility()
			}

			// Show the tab that received something (stay on the current one if both did)
			if (addedPoints.length === 0) Logic.setTab('routes')
			else if (addedTracks.length === 0) Logic.setTab('points')

			MapView.fitBounds([
				...addedTracks.map((t) => t.layer.getBounds()),
				...addedPoints.map((wp) => L.latLngBounds([[wp.lat, wp.lon]])),
			])
		}

		if (failed.length > 0) {
			Modal.alert('Nie udało się wczytać', `Brak tras i punktów w pliku lub plik uszkodzony:\n${failed.join('\n')}`)
		}

		Log.exit()
	},
}
//#endregion
//========================
//#region @r HANDLERS
//========================
const Handlers = {
	// @g GPX Import
	//------------------------
	// @b Import GPX click
	//------------------------
	importGpxClick: () => {
		$.panel.importInput.click()
	},

	// @b Import files changed
	//------------------------
	importFilesChanged: (e) => {
		const files = Array.from(e.target.files)
		$.panel.importInput.value = ''
		if (files.length === 0) return

		Logic.importFiles(files)
	},

	// @b Clear all click
	//------------------------
	clearAllClick: () => {
		if (STATE.activeTab === 'routes') {
			if (STATE.tracks.length === 0) return
			Modal.confirm('Wyczyścić wszystko?', 'Czy na pewno chcesz usunąć wszystkie trasy?', Logic.clearTracks)
		} else {
			if (STATE.waypoints.length === 0) return
			Modal.confirm('Wyczyścić wszystko?', 'Czy na pewno chcesz usunąć wszystkie punkty?', Logic.clearWaypoints)
		}
	},

	// @g Tabs
	//------------------------
	// @b Tab click
	//------------------------
	tabClick: (e) => {
		const tab = e.target.closest('.panel__tab')
		if (tab) Logic.setTab(tab.dataset.tab)
	},

	// @g Map & Waypoints
	//------------------------
	// @b Map click
	//------------------------
	mapClick: (e) => {
		if (STATE.popupOpen) {
			MapView._instance.closePopup()
			return
		}
		if (!STATE.addMode || STATE.activeTab !== 'points') return

		Log.enter('mapClick', e.latlng)
		const { lat, lng } = e.latlng
		MapView.openAddPopup(lat, lng, (marker, name, desc) => Logic.addWaypoint(lat, lng, name, desc, marker))
		Log.exit()
	},

	// @b Add mode click
	//------------------------
	addModeClick: () => {
		Logic.setAddMode(!STATE.addMode)
	},

	// @b Edit waypoint click
	//------------------------
	editWaypointClick: (id) => {
		const waypoint = STATE.waypoints.find((wp) => wp.id === id)
		if (!waypoint) return

		MapView.openEditPopup(waypoint.marker, id, waypoint.name, waypoint.desc, (newName, newDesc, lat, lon) => {
			Logic.editWaypoint(id, newName, newDesc, lat, lon)
		})
	},

	// @b Delete waypoint click
	//------------------------
	deleteWaypointClick: (id) => {
		Logic.removeWaypoint(id)
	},

	// @b Select waypoint click
	//------------------------
	selectWaypointClick: (id) => {
		const waypoint = STATE.waypoints.find((wp) => wp.id === id)
		if (!waypoint || !waypoint.marker) return
		MapView.focusMarker(waypoint.marker)
	},

	// @b Sort click
	//------------------------
	sortClick: () => {
		if (STATE.waypoints.length < 2) return
		Logic.sortWaypointsByName()
	},

	// @b Save GPX click
	//------------------------
	saveGpxClick: () => {
		if (STATE.waypoints.length === 0) {
			Modal.alert('Brak punktów', 'Włącz tryb dodawania i kliknij na mapie, aby dodać przynajmniej jeden punkt.')
			return
		}
		Effects.downloadGpx(STATE.waypoints)
	},

	// @g Points list drag & drop
	//------------------------
	// @b Drag start
	//------------------------
	pointDragStart: (e) => {
		const item = e.target.closest('.panel__point')
		if (!item) return
		STATE.draggedId = Number(item.dataset.id)
		DOM.addClass(item, 'panel__point--dragging')
		e.dataTransfer.effectAllowed = 'move'
		e.dataTransfer.setData('text/plain', String(STATE.draggedId))
	},

	// @b Drag over
	//------------------------
	pointDragOver: (e) => {
		e.preventDefault()
		const item = e.target.closest('.panel__point')
		if (!item || Number(item.dataset.id) === STATE.draggedId) return

		DOM.getAll('.panel__point--over', $.panel.pointsList).forEach((el) => DOM.removeClass(el, 'panel__point--over'))
		DOM.addClass(item, 'panel__point--over')
	},

	// @b Drop (reorder)
	//------------------------
	pointDrop: (e) => {
		e.preventDefault()
		const item = e.target.closest('.panel__point')
		DOM.getAll('.panel__point--over', $.panel.pointsList).forEach((el) => DOM.removeClass(el, 'panel__point--over'))
		if (!item) return

		const targetId = Number(item.dataset.id)
		if (targetId !== STATE.draggedId) {
			Logic.reorderWaypoints(STATE.draggedId, targetId)
		}
	},

	// @b Drag end
	//------------------------
	pointDragEnd: () => {
		DOM.getAll('.panel__point--dragging', $.panel.pointsList).forEach((el) =>
			DOM.removeClass(el, 'panel__point--dragging'),
		)
		DOM.getAll('.panel__point--over', $.panel.pointsList).forEach((el) => DOM.removeClass(el, 'panel__point--over'))
		STATE.draggedId = null
	},

	// @g Global Keyboard
	//------------------------
	// @b Escape key
	//------------------------
	escapeKeydown: (e) => {
		if (e.key !== 'Escape' || Modal.isOpen()) return

		if (STATE.activeCancel) {
			const cancel = STATE.activeCancel
			STATE.activeCancel = null
			cancel()
		} else if (STATE.popupOpen) {
			MapView._instance.closePopup()
		} else if (STATE.addMode) {
			Logic.setAddMode(false)
		}
	},

	// @g Line style (color + width)
	//------------------------
	// @b Global style click
	//------------------------
	globalStyleClick: (anchor) => {
		StylePicker.open(
			anchor,
			{ color: STATE.globalColor, weight: STATE.globalWeight },
			{ onColor: Logic.setAllColor, onWeight: Logic.setAllWeight },
		)
	},

	// @b Basemap change
	//------------------------
	basemapChange: (e) => {
		Logic.setBasemap(e.target.value)
	},

	// @b Basemap wheel
	//------------------------
	basemapWheel: (e) => {
		e.preventDefault()
		if (!e.deltaY) return

		// One step per wheel "notch" (trackpads fire many events in a row)
		const now = Date.now()
		if (now - STATE.basemapWheelAt < CONFIG.map.basemapWheelDelay) return

		const keys = Array.from($.panel.basemap.options, (option) => option.value)
		const next = keys.indexOf(STATE.basemap) + (e.deltaY > 0 ? 1 : -1)
		if (next < 0 || next >= keys.length) return

		STATE.basemapWheelAt = now
		Logic.setBasemap(keys[next])
	},

	// @b Import drag over
	//------------------------
	importDragOver: (e) => {
		e.preventDefault()
		e.dataTransfer.dropEffect = 'copy'
		DOM.addClass($.panel.importButton, 'panel__button--dragover')
	},

	// @b Import drag leave
	//------------------------
	importDragLeave: () => {
		DOM.removeClass($.panel.importButton, 'panel__button--dragover')
	},

	// @b Import drop
	//------------------------
	importDrop: (e) => {
		e.preventDefault()
		DOM.removeClass($.panel.importButton, 'panel__button--dragover')

		const dropped = Array.from(e.dataTransfer.files)
		const files = dropped.filter((file) => /\.gpx$/i.test(file.name))

		if (files.length === 0) {
			if (dropped.length > 0) Modal.alert('Nieobsługiwany plik', 'Upuść pliki z rozszerzeniem .gpx.')
			return
		}

		Logic.importFiles(files)
	},

	// @b Prevent the browser
	//------------------------
	preventFileDrop: (e) => {
		if (e.dataTransfer?.types?.includes('Files')) e.preventDefault()
	},

	// @g Track list
	//------------------------
	// @b Select track click
	//------------------------
	selectTrackClick: (id) => {
		const track = STATE.tracks.find((t) => t.id === id)
		if (track) MapView.fitBounds([track.layer.getBounds()])
	},

	// @b Delete track click
	//------------------------
	deleteTrackClick: (id) => {
		Logic.removeTrack(id)
	},

	// @b Track style click
	//------------------------
	styleClick: (id, anchor) => {
		const track = STATE.tracks.find((t) => t.id === id)
		if (!track) return

		StylePicker.open(
			anchor,
			{ color: track.color, weight: track.weight },
			{ onColor: (color) => Logic.setColor(id, color), onWeight: (weight) => Logic.setWeight(id, weight) },
		)
	},

	// @g Panel Toggle & Resize
	//------------------------
	// @b Toggle panel click
	//------------------------
	togglePanelClick: () => {
		STATE.panelCollapsed = !STATE.panelCollapsed
		Effects.updatePanelVisibility()
	},

	// @b Panel resize start
	//------------------------
	resizerMouseDown: (e) => {
		Log.enter('resizerMouseDown')
		e.preventDefault()
		STATE.isDragging = true

		DOM.addClass($.panel.resizer, 'panel__resizer--dragging')
		Log.exit()
	},

	// @b Panel resize moving
	//------------------------
	resizerMouseMove: (e) => {
		if (!STATE.isDragging) return

		let newWidth = window.innerWidth - e.clientX
		const maxWidth = Pure.getMaxPanelWidth()

		if (newWidth < CONFIG.panel.minWidth) newWidth = CONFIG.panel.minWidth
		if (newWidth > maxWidth) newWidth = maxWidth

		STATE.panelWidth = newWidth
		DOM.setStyle($.panel.element, '--panel-width', `${newWidth}px`)

		if (MapView._instance) {
			MapView._instance.invalidateSize({ animate: false })
		}
	},

	// @b Panel resize end
	//------------------------
	resizerMouseUp: () => {
		if (!STATE.isDragging) return
		Log.enter('resizerMouseUp')

		STATE.isDragging = false
		DOM.removeClass($.panel.resizer, 'panel__resizer--dragging')
		Effects.saveSettings()

		Log.exit()
	},

	// @b Window resize
	//------------------------
	windowResize: () => {
		const previousWidth = STATE.panelWidth
		Logic.clampPanelWidth()

		if (STATE.panelWidth !== previousWidth) {
			Effects.applyPanelWidth()
			Effects.saveSettings()
		}

		if (MapView._instance) {
			MapView._instance.invalidateSize({ animate: false })
		}
	},

	// @g Global Keyboard
	//------------------------
	// @b F2 key
	//------------------------
	f2Keydown: (e) => {
		if (e.key !== 'F2') return
		e.preventDefault()
		Handlers.togglePanelClick()
	},
}
//#endregion
//========================
//#region @r LISTENERS
//========================
const Listeners = {
	init: () => {
		Log.enter('Listeners')
		DOM.on($.panel.toggleButton, 'click', Handlers.togglePanelClick)
		DOM.on($.panel.tabs, 'click', Handlers.tabClick)
		DOM.on($.panel.addModeButton, 'click', Handlers.addModeClick)
		DOM.on($.panel.sortButton, 'click', Handlers.sortClick)
		DOM.on($.panel.saveButton, 'click', Handlers.saveGpxClick)
		DOM.on($.panel.pointsList, 'dragstart', Handlers.pointDragStart)
		DOM.on($.panel.pointsList, 'dragover', Handlers.pointDragOver)
		DOM.on($.panel.pointsList, 'drop', Handlers.pointDrop)
		DOM.on($.panel.pointsList, 'dragend', Handlers.pointDragEnd)
		DOM.on($.panel.importButton, 'click', Handlers.importGpxClick)
		DOM.on($.panel.importInput, 'change', Handlers.importFilesChanged)
		DOM.on($.panel.importButton, 'dragover', Handlers.importDragOver)
		DOM.on($.panel.importButton, 'dragleave', Handlers.importDragLeave)
		DOM.on($.panel.importButton, 'drop', Handlers.importDrop)
		DOM.on(document, 'dragover', Handlers.preventFileDrop)
		DOM.on(document, 'drop', Handlers.preventFileDrop)
		DOM.on($.panel.clearButton, 'click', Handlers.clearAllClick)
		DOM.on($.panel.basemap, 'change', Handlers.basemapChange)
		DOM.on($.panel.basemap, 'wheel', Handlers.basemapWheel, { passive: false })
		DOM.on($.panel.resizer, 'mousedown', Handlers.resizerMouseDown)
		// Resize
		DOM.on(window, 'resize', Tools.debounce(Handlers.windowResize, 150))
		// Fullscreen
		DOM.on(window, 'resize', Effects.updateFullscreen)
		DOM.on(document, 'fullscreenchange', Effects.updateFullscreen)
		// Mouse
		DOM.on(document, 'mousemove', Handlers.resizerMouseMove)
		DOM.on(document, 'mouseup', Handlers.resizerMouseUp)
		// Keys
		DOM.on(document, 'keydown', Handlers.escapeKeydown)
		DOM.on(document, 'keydown', Handlers.f2Keydown)
		Log.exit()
	},
}
//#endregion
//========================
//#region @r APP
//========================
const App = {
	init: () => {
		Log.init()
		Log.start('App init')
		Log.enter('App')
		Logic.loadSettings()
		Modal.init()
		StylePicker.init()
		MapView.init()
		Logic.loadWaypoints()
		Logic.clampPanelWidth()
		Listeners.init()
		Panel.renderTracks()
		Panel.renderPoints()
		Panel.initGlobalControls()
		Effects.applyTab()
		Effects.applyAddMode()
		Effects.updateBasemapSelect()
		Effects.applyPanelWidth()
		Effects.updatePanelVisibility()
		Effects.updateFavicon()
		Effects.updateFullscreen()
		Log.exit()
		Log.end()
	},
}

App.init()
// #endregion
