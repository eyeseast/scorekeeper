var app = (function () {
	'use strict';

	function noop() {}

	function assign(tar, src) {
		for (var k in src) tar[k] = src[k];
		return tar;
	}

	function assignTrue(tar, src) {
		for (var k in src) tar[k] = 1;
		return tar;
	}

	function callAfter(fn, i) {
		if (i === 0) fn();
		return () => {
			if (!--i) fn();
		};
	}

	function addLoc(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file, line, column, char }
		};
	}

	function run(fn) {
		fn();
	}

	function append(target, node) {
		target.appendChild(node);
	}

	function insert(target, node, anchor) {
		target.insertBefore(node, anchor);
	}

	function detachNode(node) {
		node.parentNode.removeChild(node);
	}

	function reinsertBetween(before, after, target) {
		while (before.nextSibling && before.nextSibling !== after) {
			target.appendChild(before.parentNode.removeChild(before.nextSibling));
		}
	}

	function destroyEach(iterations, detach) {
		for (var i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detach);
		}
	}

	function createFragment() {
		return document.createDocumentFragment();
	}

	function createElement(name) {
		return document.createElement(name);
	}

	function createText(data) {
		return document.createTextNode(data);
	}

	function createComment() {
		return document.createComment('');
	}

	function addListener(node, event, handler, options) {
		node.addEventListener(event, handler, options);
	}

	function removeListener(node, event, handler, options) {
		node.removeEventListener(event, handler, options);
	}

	function setAttribute(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else node.setAttribute(attribute, value);
	}

	function setData(text, data) {
		text.data = '' + data;
	}

	function blankObject() {
		return Object.create(null);
	}

	function destroy(detach) {
		this.destroy = noop;
		this.fire('destroy');
		this.set = noop;

		this._fragment.d(detach !== false);
		this._fragment = null;
		this._state = {};
	}

	function destroyDev(detach) {
		destroy.call(this, detach);
		this.destroy = function() {
			console.warn('Component was already destroyed');
		};
	}

	function _differs(a, b) {
		return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
	}

	function _differsImmutable(a, b) {
		return a != a ? b == b : a !== b;
	}

	function fire(eventName, data) {
		var handlers =
			eventName in this._handlers && this._handlers[eventName].slice();
		if (!handlers) return;

		for (var i = 0; i < handlers.length; i += 1) {
			var handler = handlers[i];

			if (!handler.__calling) {
				try {
					handler.__calling = true;
					handler.call(this, data);
				} finally {
					handler.__calling = false;
				}
			}
		}
	}

	function flush(component) {
		component._lock = true;
		callAll(component._beforecreate);
		callAll(component._oncreate);
		callAll(component._aftercreate);
		component._lock = false;
	}

	function get() {
		return this._state;
	}

	function init(component, options) {
		component._handlers = blankObject();
		component._slots = blankObject();
		component._bind = options._bind;
		component._staged = {};

		component.options = options;
		component.root = options.root || component;
		component.store = options.store || component.root.store;

		if (!options.root) {
			component._beforecreate = [];
			component._oncreate = [];
			component._aftercreate = [];
		}
	}

	function on(eventName, handler) {
		var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
		handlers.push(handler);

		return {
			cancel: function() {
				var index = handlers.indexOf(handler);
				if (~index) handlers.splice(index, 1);
			}
		};
	}

	function set(newState) {
		this._set(assign({}, newState));
		if (this.root._lock) return;
		flush(this.root);
	}

	function _set(newState) {
		var oldState = this._state,
			changed = {},
			dirty = false;

		newState = assign(this._staged, newState);
		this._staged = {};

		for (var key in newState) {
			if (this._differs(newState[key], oldState[key])) changed[key] = dirty = true;
		}
		if (!dirty) return;

		this._state = assign(assign({}, oldState), newState);
		this._recompute(changed, this._state);
		if (this._bind) this._bind(changed, this._state);

		if (this._fragment) {
			this.fire("state", { changed: changed, current: this._state, previous: oldState });
			this._fragment.p(changed, this._state);
			this.fire("update", { changed: changed, current: this._state, previous: oldState });
		}
	}

	function _stage(newState) {
		assign(this._staged, newState);
	}

	function setDev(newState) {
		if (typeof newState !== 'object') {
			throw new Error(
				this._debugName + '.set was called without an object of data key-values to update.'
			);
		}

		this._checkReadOnly(newState);
		set.call(this, newState);
	}

	function callAll(fns) {
		while (fns && fns.length) fns.shift()();
	}

	function _mount(target, anchor) {
		this._fragment[this._fragment.i ? 'i' : 'm'](target, anchor || null);
	}

	function removeFromStore() {
		this.store._remove(this);
	}

	var protoDev = {
		destroy: destroyDev,
		get,
		fire,
		on,
		set: setDev,
		_recompute: noop,
		_set,
		_stage,
		_mount,
		_differs
	};

	/* src/ChoosePlayers.html generated by Svelte v2.16.0 */

	var methods = {

	    setPlayers(e) {
	        e.preventDefault();

	        const { form, newplayer } = this.refs;
	        let players;

	        if (form.elements.players.length) {
	            players = Array.from(form.elements.players)
	                .map(i => i.value)
	                .filter(Boolean);
	        } else {
	            players = [form.elements.players.value];
	        }

	        this.store.set({ players });
	        newplayer.value = "";
	    },

	    removePlayer(index) {
	        const players = this.store.get()['players']
	            .filter((p, i) => i !== index);
	        
	        this.store.set({ players });
	    },

	    start(e) {
	        // make sure players are set first
	        this.setPlayers.call(this, e);
	        this.store.set({ started: true });
	    }
	};

	const file = "src/ChoosePlayers.html";

	function click_handler(event) {
		const { component, ctx } = this._svelte;

		component.removePlayer(ctx.i);
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.player = list[i];
		child_ctx.i = i;
		return child_ctx;
	}

	function create_main_fragment(component, ctx) {
		var form, div0, input0, text0, button, text2, text3, div1, input1, current;

		var each_value = ctx.$players;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
		}

		function click_handler_1(event) {
			component.start(event);
		}

		function submit_handler(event) {
			component.setPlayers(event);
		}

		return {
			c: function create() {
				form = createElement("form");
				div0 = createElement("div");
				input0 = createElement("input");
				text0 = createText("\n        ");
				button = createElement("button");
				button.textContent = "Add";
				text2 = createText("\n    ");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				text3 = createText("\n\n    ");
				div1 = createElement("div");
				input1 = createElement("input");
				setAttribute(input0, "type", "text");
				input0.name = "players";
				input0.placeholder = "Add a player";
				addLoc(input0, file, 3, 8, 77);
				button.className = "button button-primary";
				addLoc(button, file, 4, 8, 161);
				addLoc(div0, file, 2, 4, 63);
				addListener(input1, "click", click_handler_1);
				setAttribute(input1, "type", "submit");
				input1.value = "start";
				addLoc(input1, file, 13, 9, 472);
				addLoc(div1, file, 13, 4, 467);
				addListener(form, "submit", submit_handler);
				form.className = "row";
				addLoc(form, file, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, form, anchor);
				append(form, div0);
				append(div0, input0);
				component.refs.newplayer = input0;
				append(div0, text0);
				append(div0, button);
				append(form, text2);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(form, null);
				}

				append(form, text3);
				append(form, div1);
				append(div1, input1);
				component.refs.form = form;
				current = true;
			},

			p: function update(changed, ctx) {
				if (changed.$players) {
					each_value = ctx.$players;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(form, text3);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy$$1(detach) {
				if (detach) {
					detachNode(form);
				}

				if (component.refs.newplayer === input0) component.refs.newplayer = null;

				destroyEach(each_blocks, detach);

				removeListener(input1, "click", click_handler_1);
				removeListener(form, "submit", submit_handler);
				if (component.refs.form === form) component.refs.form = null;
			}
		};
	}

	// (7:4) {#each $players as player, i}
	function create_each_block(component, ctx) {
		var div, input, input_value_value, text, button;

		return {
			c: function create() {
				div = createElement("div");
				input = createElement("input");
				text = createText("\n        ");
				button = createElement("button");
				button.textContent = "x";
				setAttribute(input, "type", "text");
				input.value = input_value_value = ctx.player;
				input.name = "players";
				addLoc(input, file, 8, 8, 275);

				button._svelte = { component, ctx };

				addListener(button, "click", click_handler);
				button.type = "button";
				button.className = "button";
				button.title = "Remove this player";
				addLoc(button, file, 9, 8, 337);
				addLoc(div, file, 7, 4, 261);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, input);
				append(div, text);
				append(div, button);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.$players) && input_value_value !== (input_value_value = ctx.player)) {
					input.value = input_value_value;
				}

				button._svelte.ctx = ctx;
			},

			d: function destroy$$1(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	function ChoosePlayers(options) {
		this._debugName = '<ChoosePlayers>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<ChoosePlayers> references store properties, but no store was provided");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(this.store._init(["players"]), options.data);
		this.store._add(this, ["players"]);
		if (!('$players' in this._state)) console.warn("<ChoosePlayers> was created without expected data property '$players'");
		this._intro = !!options.intro;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}

		this._intro = true;
	}

	assign(ChoosePlayers.prototype, protoDev);
	assign(ChoosePlayers.prototype, methods);

	ChoosePlayers.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	var camel2hyphen = function (str) {
	  return str
	          .replace(/[A-Z]/g, function (match) {
	            return '-' + match.toLowerCase();
	          })
	          .toLowerCase();
	};

	var camel2hyphen_1 = camel2hyphen;

	var isDimension = function (feature) {
	  var re = /[height|width]$/;
	  return re.test(feature);
	};

	var obj2mq = function (obj) {
	  var mq = '';
	  var features = Object.keys(obj);
	  features.forEach(function (feature, index) {
	    var value = obj[feature];
	    feature = camel2hyphen_1(feature);
	    // Add px to dimension features
	    if (isDimension(feature) && typeof value === 'number') {
	      value = value + 'px';
	    }
	    if (value === true) {
	      mq += feature;
	    } else if (value === false) {
	      mq += 'not ' + feature;
	    } else {
	      mq += '(' + feature + ': ' + value + ')';
	    }
	    if (index < features.length-1) {
	      mq += ' and ';
	    }
	  });
	  return mq;
	};

	var json2mq = function (query) {
	  var mq = '';
	  if (typeof query === 'string') {
	    return query;
	  }
	  // Handling array of media queries
	  if (query instanceof Array) {
	    query.forEach(function (q, index) {
	      mq += obj2mq(q);
	      if (index < query.length-1) {
	        mq += ', ';
	      }
	    });
	    return mq;
	  }
	  // Handling single media query
	  return obj2mq(query);
	};

	var json2mq_1 = json2mq;

	/* src/Media.html generated by Svelte v2.16.0 */

	function data() {
	    return {
	        matches: true,
	        query: null
	    }
	}
	var methods$1 = {
	    updateMatches(e) {
	        if (this.mediaQueryList) {
	            this.set({ matches: this.mediaQueryList.matches });
	        }
	    }
	};

	function oncreate() {
	    
	    const {query} = this.get();

	    this.updateMatches = this.updateMatches.bind(this);
	    
	    this.mediaQueryList = window.matchMedia(query);
	    this.mediaQueryList.addListener(this.updateMatches);

	    this.updateMatches();
	}
	function ondestroy() {
	    if (this.mediaQueryList) {
	        this.mediaQueryList.removeListener(this.updateMatches);
	    }
	}
	function create_main_fragment$1(component, ctx) {
		var if_block_anchor, current;

		var if_block = (ctx.matches) && create_if_block(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.matches) {
					if (!if_block) {
						if_block = create_if_block(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy$$1(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (2:0) {#if matches}
	function create_if_block(component, ctx) {
		var slot_content_default = component._slotted.default, slot_content_default_before, slot_content_default_after;

		return {
			c: noop,

			m: function mount(target, anchor) {
				if (slot_content_default) {
					insert(target, slot_content_default_before || (slot_content_default_before = createComment()), anchor);
					insert(target, slot_content_default, anchor);
					insert(target, slot_content_default_after || (slot_content_default_after = createComment()), anchor);
				}
			},

			d: function destroy$$1(detach) {
				if (slot_content_default) {
					reinsertBetween(slot_content_default_before, slot_content_default_after, slot_content_default);
					detachNode(slot_content_default_before);
					detachNode(slot_content_default_after);
				}
			}
		};
	}

	function Media(options) {
		this._debugName = '<Media>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data(), options.data);
		if (!('matches' in this._state)) console.warn("<Media> was created without expected data property 'matches'");
		this._intro = !!options.intro;

		this._handlers.destroy = [ondestroy];

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$1(this, this._state);

		this.root._oncreate.push(() => {
			oncreate.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(Media.prototype, protoDev);
	assign(Media.prototype, methods$1);

	Media.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	// helpers outside of components

	function totals(rounds) {
	    return rounds.reduce((m, round) => {
	        for (let player in round) {
	            m[player] = (m[player] || 0) + round[player];
	        }

	        return m;
	    }, {});
	}

	function useLocalStorage(store, key) {
	    const json = localStorage.getItem(key);
	    if (json) {
	        store.set(JSON.parse(json));
	    }

	    store.on('state', ({ current, previous, changed }) => {
	        localStorage.setItem(key, JSON.stringify(current));
	    });
	}

	/* src/Play.html generated by Svelte v2.16.0 */



	function totals_1({ $rounds }) {
		return totals($rounds);
	}

	var methods$2 = {
	    nextRound() {

	        const { rounds, players } = this.store.get();

	        const round = players.reduce((m, p) => {
	            m[p] = 0;
	            return m;
	        }, {});

	        rounds.push(round);

	        this.store.set({ rounds });
	    },

	    removeRound(index) {
	        let { rounds } = this.store.get();
	        
	        rounds = rounds.filter((r, i) => i !== index);

	        this.store.set({ rounds });
	    },

	    updateScore(e, player, index) {

	        const { rounds } = this.store.get();
	        const value = +e.target.value;

	        const updated = rounds.map((round, i) => {

	            if (i === index) {
	                round[player] = value;
	            }

	            return round;
	        });

	        this.store.set({ rounds: updated });
	    }
	};

	function oncreate$1() {
	    const { rounds } = this.store.get();

	    if (rounds.length < 1) {
	        this.nextRound();
	    }
	}
	const file$2 = "src/Play.html";

	function get_each4_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.player = list[i];
		return child_ctx;
	}

	function click_handler_1(event) {
		const { component, ctx } = this._svelte;

		component.removeRound(ctx.i);
	}

	function input_handler_1(event) {
		const { component, ctx } = this._svelte;

		component.updateScore(event, ctx.player, ctx.i);
	}

	function get_each_context_1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.player = list[i];
		return child_ctx;
	}

	function get_each3_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.round = list[i];
		child_ctx.i = i;
		return child_ctx;
	}

	function get_each2_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.player = list[i];
		child_ctx.i = i;
		return child_ctx;
	}

	function get_each1_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.player = list[i];
		return child_ctx;
	}

	function input_handler(event) {
		const { component, ctx } = this._svelte;

		component.updateScore(event, ctx.player, ctx.i);
	}

	function get_each_context$1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.player = list[i];
		return child_ctx;
	}

	function click_handler$1(event) {
		const { component, ctx } = this._svelte;

		component.removeRound(ctx.i);
	}

	function get_each0_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.round = list[i];
		child_ctx.i = i;
		return child_ctx;
	}

	function create_main_fragment$2(component, ctx) {
		var div3, div0, text0, div1, h2, text2, ul, text3, table, thead, tr0, th0, text5, text6, th1, text8, tbody, text9, tr1, td0, text11, text12, td1, text13, div2, button0, text15, button1, current;

		var each0_value = ctx.$rounds;

		var each0_blocks = [];

		for (var i = 0; i < each0_value.length; i += 1) {
			each0_blocks[i] = create_each_block_5(component, get_each0_context(ctx, each0_value, i));
		}

		var each1_value = ctx.$players;

		var each1_blocks = [];

		for (var i = 0; i < each1_value.length; i += 1) {
			each1_blocks[i] = create_each_block_4(component, get_each1_context(ctx, each1_value, i));
		}

		var media0_initial_data = { query: json2mq_1({ maxWidth: 600 }) };
		var media0 = new Media({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: media0_initial_data
		});

		var each2_value = ctx.$players;

		var each2_blocks = [];

		for (var i = 0; i < each2_value.length; i += 1) {
			each2_blocks[i] = create_each_block_3(component, get_each2_context(ctx, each2_value, i));
		}

		var each3_value = ctx.$rounds;

		var each3_blocks = [];

		for (var i = 0; i < each3_value.length; i += 1) {
			each3_blocks[i] = create_each_block_1(component, get_each3_context(ctx, each3_value, i));
		}

		var each4_value = ctx.$players;

		var each4_blocks = [];

		for (var i = 0; i < each4_value.length; i += 1) {
			each4_blocks[i] = create_each_block$1(component, get_each4_context(ctx, each4_value, i));
		}

		var media1_initial_data = { query: json2mq_1({ minWidth: 601 }) };
		var media1 = new Media({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: media1_initial_data
		});

		function click_handler_2(event) {
			component.nextRound();
		}

		function click_handler_3(event) {
			component.store.set({ started: false });
		}

		return {
			c: function create() {
				div3 = createElement("div");
				div0 = createElement("div");

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].c();
				}

				text0 = createText("\n\n        ");
				div1 = createElement("div");
				h2 = createElement("h2");
				h2.textContent = "Totals:";
				text2 = createText("\n            ");
				ul = createElement("ul");

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].c();
				}

				media0._fragment.c();
				text3 = createText("\n\n    ");
				table = createElement("table");
				thead = createElement("thead");
				tr0 = createElement("tr");
				th0 = createElement("th");
				th0.textContent = "Round #";
				text5 = createText("\n                ");

				for (var i = 0; i < each2_blocks.length; i += 1) {
					each2_blocks[i].c();
				}

				text6 = createText("\n                ");
				th1 = createElement("th");
				th1.textContent = "Discard";
				text8 = createText("\n        ");
				tbody = createElement("tbody");

				for (var i = 0; i < each3_blocks.length; i += 1) {
					each3_blocks[i].c();
				}

				text9 = createText("\n\n            ");
				tr1 = createElement("tr");
				td0 = createElement("td");
				td0.textContent = "Totals:";
				text11 = createText("\n                ");

				for (var i = 0; i < each4_blocks.length; i += 1) {
					each4_blocks[i].c();
				}

				text12 = createText("\n                ");
				td1 = createElement("td");
				media1._fragment.c();
				text13 = createText("\n\n    ");
				div2 = createElement("div");
				button0 = createElement("button");
				button0.textContent = "Next round";
				text15 = createText("\n        ");
				button1 = createElement("button");
				button1.textContent = "Change players";
				div0.className = "twelve columns";
				addLoc(div0, file$2, 2, 8, 75);
				h2.className = "svelte-c1ugnr";
				addLoc(h2, file$2, 25, 8, 832);
				addLoc(ul, file$2, 26, 12, 861);
				div1.className = "totals twelve columns";
				addLoc(div1, file$2, 24, 8, 788);
				addLoc(th0, file$2, 40, 16, 1204);
				addLoc(th1, file$2, 44, 16, 1343);
				addLoc(tr0, file$2, 39, 12, 1183);
				addLoc(thead, file$2, 38, 8, 1163);
				addLoc(td0, file$2, 66, 16, 1978);
				addLoc(td1, file$2, 70, 16, 2127);
				tr1.className = "totals";
				addLoc(tr1, file$2, 65, 12, 1942);
				addLoc(tbody, file$2, 47, 8, 1403);
				table.className = "twelve columns";
				addLoc(table, file$2, 37, 4, 1124);
				addListener(button0, "click", click_handler_2);
				button0.className = "button button-primary";
				addLoc(button0, file$2, 77, 8, 2217);
				addListener(button1, "click", click_handler_3);
				button1.className = "button";
				addLoc(button1, file$2, 78, 8, 2306);
				addLoc(div2, file$2, 76, 4, 2203);
				div3.className = "row";
				addLoc(div3, file$2, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div3, anchor);
				append(media0._slotted.default, div0);

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].m(div0, null);
				}

				append(media0._slotted.default, text0);
				append(media0._slotted.default, div1);
				append(div1, h2);
				append(div1, text2);
				append(div1, ul);

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].m(ul, null);
				}

				media0._mount(div3, null);
				append(div3, text3);
				append(media1._slotted.default, table);
				append(table, thead);
				append(thead, tr0);
				append(tr0, th0);
				append(tr0, text5);

				for (var i = 0; i < each2_blocks.length; i += 1) {
					each2_blocks[i].m(tr0, null);
				}

				append(tr0, text6);
				append(tr0, th1);
				append(table, text8);
				append(table, tbody);

				for (var i = 0; i < each3_blocks.length; i += 1) {
					each3_blocks[i].m(tbody, null);
				}

				append(tbody, text9);
				append(tbody, tr1);
				append(tr1, td0);
				append(tr1, text11);

				for (var i = 0; i < each4_blocks.length; i += 1) {
					each4_blocks[i].m(tr1, null);
				}

				append(tr1, text12);
				append(tr1, td1);
				media1._mount(div3, null);
				append(div3, text13);
				append(div3, div2);
				append(div2, button0);
				append(div2, text15);
				append(div2, button1);
				current = true;
			},

			p: function update(changed, ctx) {
				if (changed.$players || changed.$rounds) {
					each0_value = ctx.$rounds;

					for (var i = 0; i < each0_value.length; i += 1) {
						const child_ctx = get_each0_context(ctx, each0_value, i);

						if (each0_blocks[i]) {
							each0_blocks[i].p(changed, child_ctx);
						} else {
							each0_blocks[i] = create_each_block_5(component, child_ctx);
							each0_blocks[i].c();
							each0_blocks[i].m(div0, null);
						}
					}

					for (; i < each0_blocks.length; i += 1) {
						each0_blocks[i].d(1);
					}
					each0_blocks.length = each0_value.length;
				}

				if (changed.totals || changed.$players) {
					each1_value = ctx.$players;

					for (var i = 0; i < each1_value.length; i += 1) {
						const child_ctx = get_each1_context(ctx, each1_value, i);

						if (each1_blocks[i]) {
							each1_blocks[i].p(changed, child_ctx);
						} else {
							each1_blocks[i] = create_each_block_4(component, child_ctx);
							each1_blocks[i].c();
							each1_blocks[i].m(ul, null);
						}
					}

					for (; i < each1_blocks.length; i += 1) {
						each1_blocks[i].d(1);
					}
					each1_blocks.length = each1_value.length;
				}

				if (changed.$players) {
					each2_value = ctx.$players;

					for (var i = 0; i < each2_value.length; i += 1) {
						const child_ctx = get_each2_context(ctx, each2_value, i);

						if (each2_blocks[i]) {
							each2_blocks[i].p(changed, child_ctx);
						} else {
							each2_blocks[i] = create_each_block_3(component, child_ctx);
							each2_blocks[i].c();
							each2_blocks[i].m(tr0, text6);
						}
					}

					for (; i < each2_blocks.length; i += 1) {
						each2_blocks[i].d(1);
					}
					each2_blocks.length = each2_value.length;
				}

				if (changed.$players || changed.$rounds) {
					each3_value = ctx.$rounds;

					for (var i = 0; i < each3_value.length; i += 1) {
						const child_ctx = get_each3_context(ctx, each3_value, i);

						if (each3_blocks[i]) {
							each3_blocks[i].p(changed, child_ctx);
						} else {
							each3_blocks[i] = create_each_block_1(component, child_ctx);
							each3_blocks[i].c();
							each3_blocks[i].m(tbody, text9);
						}
					}

					for (; i < each3_blocks.length; i += 1) {
						each3_blocks[i].d(1);
					}
					each3_blocks.length = each3_value.length;
				}

				if (changed.totals || changed.$players) {
					each4_value = ctx.$players;

					for (var i = 0; i < each4_value.length; i += 1) {
						const child_ctx = get_each4_context(ctx, each4_value, i);

						if (each4_blocks[i]) {
							each4_blocks[i].p(changed, child_ctx);
						} else {
							each4_blocks[i] = create_each_block$1(component, child_ctx);
							each4_blocks[i].c();
							each4_blocks[i].m(tr1, text12);
						}
					}

					for (; i < each4_blocks.length; i += 1) {
						each4_blocks[i].d(1);
					}
					each4_blocks.length = each4_value.length;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				outrocallback = callAfter(outrocallback, 2);

				if (media0) media0._fragment.o(outrocallback);
				if (media1) media1._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy$$1(detach) {
				if (detach) {
					detachNode(div3);
				}

				destroyEach(each0_blocks, detach);

				destroyEach(each1_blocks, detach);

				media0.destroy();

				destroyEach(each2_blocks, detach);

				destroyEach(each3_blocks, detach);

				destroyEach(each4_blocks, detach);

				media1.destroy();
				removeListener(button0, "click", click_handler_2);
				removeListener(button1, "click", click_handler_3);
			}
		};
	}

	// (12:16) {#each $players as player}
	function create_each_block_6(component, ctx) {
		var dt, label, span, text0_value = ctx.player, text0, text1, input, input_value_value, dt_class_value;

		return {
			c: function create() {
				dt = createElement("dt");
				label = createElement("label");
				span = createElement("span");
				text0 = createText(text0_value);
				text1 = createText("\n                        ");
				input = createElement("input");
				addLoc(span, file$2, 14, 24, 485);

				input._svelte = { component, ctx };

				addListener(input, "input", input_handler);
				setAttribute(input, "type", "number");
				input.value = input_value_value = ctx.round[ctx.player];
				addLoc(input, file$2, 15, 24, 533);
				label.className = "svelte-c1ugnr";
				addLoc(label, file$2, 13, 20, 453);
				dt.className = dt_class_value = "player " + ctx.player + " svelte-c1ugnr";
				addLoc(dt, file$2, 12, 16, 404);
			},

			m: function mount(target, anchor) {
				insert(target, dt, anchor);
				append(dt, label);
				append(label, span);
				append(span, text0);
				append(label, text1);
				append(label, input);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.$players) && text0_value !== (text0_value = ctx.player)) {
					setData(text0, text0_value);
				}

				input._svelte.ctx = ctx;
				if ((changed.$rounds || changed.$players) && input_value_value !== (input_value_value = ctx.round[ctx.player])) {
					input.value = input_value_value;
				}

				if ((changed.$players) && dt_class_value !== (dt_class_value = "player " + ctx.player + " svelte-c1ugnr")) {
					dt.className = dt_class_value;
				}
			},

			d: function destroy$$1(detach) {
				if (detach) {
					detachNode(dt);
				}

				removeListener(input, "input", input_handler);
			}
		};
	}

	// (4:12) {#each $rounds as round, i}
	function create_each_block_5(component, ctx) {
		var header, h2, text0, text1_value = ctx.i+1, text1, text2, button, text4, dl;

		var each_value = ctx.$players;

		var each_blocks = [];

		for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
			each_blocks[i_1] = create_each_block_6(component, get_each_context$1(ctx, each_value, i_1));
		}

		return {
			c: function create() {
				header = createElement("header");
				h2 = createElement("h2");
				text0 = createText("Round ");
				text1 = createText(text1_value);
				text2 = createText("\n                ");
				button = createElement("button");
				button.textContent = "X";
				text4 = createText("\n\n            ");
				dl = createElement("dl");

				for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
					each_blocks[i_1].c();
				}
				h2.className = "svelte-c1ugnr";
				addLoc(h2, file$2, 6, 16, 182);

				button._svelte = { component, ctx };

				addListener(button, "click", click_handler$1);
				button.className = "x-round button svelte-c1ugnr";
				addLoc(button, file$2, 7, 16, 221);
				header.className = "svelte-c1ugnr";
				addLoc(header, file$2, 5, 12, 157);
				dl.className = "players";
				addLoc(dl, file$2, 10, 12, 324);
			},

			m: function mount(target, anchor) {
				insert(target, header, anchor);
				append(header, h2);
				append(h2, text0);
				append(h2, text1);
				append(header, text2);
				append(header, button);
				insert(target, text4, anchor);
				insert(target, dl, anchor);

				for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
					each_blocks[i_1].m(dl, null);
				}
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				button._svelte.ctx = ctx;

				if (changed.$players || changed.$rounds) {
					each_value = ctx.$players;

					for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
						const child_ctx = get_each_context$1(ctx, each_value, i_1);

						if (each_blocks[i_1]) {
							each_blocks[i_1].p(changed, child_ctx);
						} else {
							each_blocks[i_1] = create_each_block_6(component, child_ctx);
							each_blocks[i_1].c();
							each_blocks[i_1].m(dl, null);
						}
					}

					for (; i_1 < each_blocks.length; i_1 += 1) {
						each_blocks[i_1].d(1);
					}
					each_blocks.length = each_value.length;
				}
			},

			d: function destroy$$1(detach) {
				if (detach) {
					detachNode(header);
				}

				removeListener(button, "click", click_handler$1);
				if (detach) {
					detachNode(text4);
					detachNode(dl);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (28:16) {#each $players as player}
	function create_each_block_4(component, ctx) {
		var li, strong, text0_value = ctx.player, text0, text1, text2_value = ctx.totals[ctx.player] || 0, text2;

		return {
			c: function create() {
				li = createElement("li");
				strong = createElement("strong");
				text0 = createText(text0_value);
				text1 = createText(":\n                ");
				text2 = createText(text2_value);
				addLoc(strong, file$2, 28, 20, 929);
				addLoc(li, file$2, 28, 16, 925);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, strong);
				append(strong, text0);
				append(li, text1);
				append(li, text2);
			},

			p: function update(changed, ctx) {
				if ((changed.$players) && text0_value !== (text0_value = ctx.player)) {
					setData(text0, text0_value);
				}

				if ((changed.totals || changed.$players) && text2_value !== (text2_value = ctx.totals[ctx.player] || 0)) {
					setData(text2, text2_value);
				}
			},

			d: function destroy$$1(detach) {
				if (detach) {
					detachNode(li);
				}
			}
		};
	}

	// (42:16) {#each $players as player, i}
	function create_each_block_3(component, ctx) {
		var th, text_value = ctx.player, text;

		return {
			c: function create() {
				th = createElement("th");
				text = createText(text_value);
				addLoc(th, file$2, 42, 16, 1283);
			},

			m: function mount(target, anchor) {
				insert(target, th, anchor);
				append(th, text);
			},

			p: function update(changed, ctx) {
				if ((changed.$players) && text_value !== (text_value = ctx.player)) {
					setData(text, text_value);
				}
			},

			d: function destroy$$1(detach) {
				if (detach) {
					detachNode(th);
				}
			}
		};
	}

	// (54:16) {#each $players as player}
	function create_each_block_2(component, ctx) {
		var td, input, input_value_value;

		return {
			c: function create() {
				td = createElement("td");
				input = createElement("input");
				input._svelte = { component, ctx };

				addListener(input, "input", input_handler_1);
				setAttribute(input, "type", "number");
				input.value = input_value_value = ctx.round[ctx.player];
				addLoc(input, file$2, 55, 20, 1624);
				addLoc(td, file$2, 54, 16, 1599);
			},

			m: function mount(target, anchor) {
				insert(target, td, anchor);
				append(td, input);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				input._svelte.ctx = ctx;
				if ((changed.$rounds || changed.$players) && input_value_value !== (input_value_value = ctx.round[ctx.player])) {
					input.value = input_value_value;
				}
			},

			d: function destroy$$1(detach) {
				if (detach) {
					detachNode(td);
				}

				removeListener(input, "input", input_handler_1);
			}
		};
	}

	// (49:12) {#each $rounds as round, i}
	function create_each_block_1(component, ctx) {
		var tr, td0, text0_value = ctx.i+1, text0, text1, text2, td1, button;

		var each_value_1 = ctx.$players;

		var each_blocks = [];

		for (var i_1 = 0; i_1 < each_value_1.length; i_1 += 1) {
			each_blocks[i_1] = create_each_block_2(component, get_each_context_1(ctx, each_value_1, i_1));
		}

		return {
			c: function create() {
				tr = createElement("tr");
				td0 = createElement("td");
				text0 = createText(text0_value);
				text1 = createText("\n                ");

				for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
					each_blocks[i_1].c();
				}

				text2 = createText("\n\n                ");
				td1 = createElement("td");
				button = createElement("button");
				button.textContent = "x";
				addLoc(td0, file$2, 50, 16, 1484);

				button._svelte = { component, ctx };

				addListener(button, "click", click_handler_1);
				button.className = "x-round button svelte-c1ugnr";
				addLoc(button, file$2, 60, 20, 1801);
				addLoc(td1, file$2, 59, 16, 1776);
				addLoc(tr, file$2, 49, 12, 1463);
			},

			m: function mount(target, anchor) {
				insert(target, tr, anchor);
				append(tr, td0);
				append(td0, text0);
				append(tr, text1);

				for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
					each_blocks[i_1].m(tr, null);
				}

				append(tr, text2);
				append(tr, td1);
				append(td1, button);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (changed.$rounds || changed.$players) {
					each_value_1 = ctx.$players;

					for (var i_1 = 0; i_1 < each_value_1.length; i_1 += 1) {
						const child_ctx = get_each_context_1(ctx, each_value_1, i_1);

						if (each_blocks[i_1]) {
							each_blocks[i_1].p(changed, child_ctx);
						} else {
							each_blocks[i_1] = create_each_block_2(component, child_ctx);
							each_blocks[i_1].c();
							each_blocks[i_1].m(tr, text2);
						}
					}

					for (; i_1 < each_blocks.length; i_1 += 1) {
						each_blocks[i_1].d(1);
					}
					each_blocks.length = each_value_1.length;
				}

				button._svelte.ctx = ctx;
			},

			d: function destroy$$1(detach) {
				if (detach) {
					detachNode(tr);
				}

				destroyEach(each_blocks, detach);

				removeListener(button, "click", click_handler_1);
			}
		};
	}

	// (68:16) {#each $players as player}
	function create_each_block$1(component, ctx) {
		var td, text_value = ctx.totals[ctx.player] || 0, text;

		return {
			c: function create() {
				td = createElement("td");
				text = createText(text_value);
				addLoc(td, file$2, 68, 16, 2054);
			},

			m: function mount(target, anchor) {
				insert(target, td, anchor);
				append(td, text);
			},

			p: function update(changed, ctx) {
				if ((changed.totals || changed.$players) && text_value !== (text_value = ctx.totals[ctx.player] || 0)) {
					setData(text, text_value);
				}
			},

			d: function destroy$$1(detach) {
				if (detach) {
					detachNode(td);
				}
			}
		};
	}

	function Play(options) {
		this._debugName = '<Play>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<Play> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["rounds","players"]), options.data);
		this.store._add(this, ["rounds","players"]);

		this._recompute({ $rounds: 1 }, this._state);
		if (!('$rounds' in this._state)) console.warn("<Play> was created without expected data property '$rounds'");
		if (!('$players' in this._state)) console.warn("<Play> was created without expected data property '$players'");
		this._intro = !!options.intro;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$2(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$1.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(Play.prototype, protoDev);
	assign(Play.prototype, methods$2);

	Play.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('totals' in newState && !this._updatingReadonlyProperty) throw new Error("<Play>: Cannot set read-only property 'totals'");
	};

	Play.prototype._recompute = function _recompute(changed, state) {
		if (changed.$rounds) {
			if (this._differs(state.totals, (state.totals = totals_1(state)))) changed.totals = true;
		}
	};

	/* src/App.html generated by Svelte v2.16.0 */





	const file$3 = "src/App.html";

	function create_main_fragment$3(component, ctx) {
		var div, h1, text_1, current_block_type_index, if_block, current;

		var if_block_creators = [
			create_if_block$1,
			create_else_block
		];

		var if_blocks = [];

		function select_block_type(ctx) {
			if (ctx.$started) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				h1 = createElement("h1");
				h1.textContent = "Scorekeeper";
				text_1 = createText("\n\n    ");
				if_block.c();
				addLoc(h1, file$3, 1, 4, 28);
				div.className = "container";
				addLoc(div, file$3, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, h1);
				append(div, text_1);
				if_blocks[current_block_type_index].m(div, null);
				current = true;
			},

			p: function update(changed, ctx) {
				var previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);
				if (current_block_type_index !== previous_block_index) {
					if_block.o(function() {
						if_blocks[previous_block_index].d(1);
						if_blocks[previous_block_index] = null;
					});

					if_block = if_blocks[current_block_type_index];
					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);
						if_block.c();
					}
					if_block.m(div, null);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (if_block) if_block.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy$$1(detach) {
				if (detach) {
					detachNode(div);
				}

				if_blocks[current_block_type_index].d();
			}
		};
	}

	// (6:4) {:else}
	function create_else_block(component, ctx) {
		var current;

		var chooseplayers = new ChoosePlayers({
			root: component.root,
			store: component.store
		});

		component.refs.choose = chooseplayers;

		return {
			c: function create() {
				chooseplayers._fragment.c();
			},

			m: function mount(target, anchor) {
				chooseplayers._mount(target, anchor);
				current = true;
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (chooseplayers) chooseplayers._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy$$1(detach) {
				chooseplayers.destroy(detach);
				if (component.refs.choose === chooseplayers) component.refs.choose = null;
			}
		};
	}

	// (4:4) {#if $started}
	function create_if_block$1(component, ctx) {
		var current;

		var play = new Play({
			root: component.root,
			store: component.store
		});

		component.refs.play = play;

		return {
			c: function create() {
				play._fragment.c();
			},

			m: function mount(target, anchor) {
				play._mount(target, anchor);
				current = true;
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (play) play._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy$$1(detach) {
				play.destroy(detach);
				if (component.refs.play === play) component.refs.play = null;
			}
		};
	}

	function App(options) {
		this._debugName = '<App>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<App> references store properties, but no store was provided");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(this.store._init(["started"]), options.data);
		this.store._add(this, ["started"]);
		if (!('$started' in this._state)) console.warn("<App> was created without expected data property '$started'");
		this._intro = !!options.intro;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$3(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(App.prototype, protoDev);

	App.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	function Store(state, options) {
		this._handlers = {};
		this._dependents = [];

		this._computed = blankObject();
		this._sortedComputedProperties = [];

		this._state = assign({}, state);
		this._differs = options && options.immutable ? _differsImmutable : _differs;
	}

	assign(Store.prototype, {
		_add(component, props) {
			this._dependents.push({
				component: component,
				props: props
			});
		},

		_init(props) {
			const state = {};
			for (let i = 0; i < props.length; i += 1) {
				const prop = props[i];
				state['$' + prop] = this._state[prop];
			}
			return state;
		},

		_remove(component) {
			let i = this._dependents.length;
			while (i--) {
				if (this._dependents[i].component === component) {
					this._dependents.splice(i, 1);
					return;
				}
			}
		},

		_set(newState, changed) {
			const previous = this._state;
			this._state = assign(assign({}, previous), newState);

			for (let i = 0; i < this._sortedComputedProperties.length; i += 1) {
				this._sortedComputedProperties[i].update(this._state, changed);
			}

			this.fire('state', {
				changed,
				previous,
				current: this._state
			});

			this._dependents
				.filter(dependent => {
					const componentState = {};
					let dirty = false;

					for (let j = 0; j < dependent.props.length; j += 1) {
						const prop = dependent.props[j];
						if (prop in changed) {
							componentState['$' + prop] = this._state[prop];
							dirty = true;
						}
					}

					if (dirty) {
						dependent.component._stage(componentState);
						return true;
					}
				})
				.forEach(dependent => {
					dependent.component.set({});
				});

			this.fire('update', {
				changed,
				previous,
				current: this._state
			});
		},

		_sortComputedProperties() {
			const computed = this._computed;
			const sorted = this._sortedComputedProperties = [];
			const visited = blankObject();
			let currentKey;

			function visit(key) {
				const c = computed[key];

				if (c) {
					c.deps.forEach(dep => {
						if (dep === currentKey) {
							throw new Error(`Cyclical dependency detected between ${dep} <-> ${key}`);
						}

						visit(dep);
					});

					if (!visited[key]) {
						visited[key] = true;
						sorted.push(c);
					}
				}
			}

			for (const key in this._computed) {
				visit(currentKey = key);
			}
		},

		compute(key, deps, fn) {
			let value;

			const c = {
				deps,
				update: (state, changed, dirty) => {
					const values = deps.map(dep => {
						if (dep in changed) dirty = true;
						return state[dep];
					});

					if (dirty) {
						const newValue = fn.apply(null, values);
						if (this._differs(newValue, value)) {
							value = newValue;
							changed[key] = true;
							state[key] = value;
						}
					}
				}
			};

			this._computed[key] = c;
			this._sortComputedProperties();

			const state = assign({}, this._state);
			const changed = {};
			c.update(state, changed, true);
			this._set(state, changed);
		},

		fire,

		get,

		on,

		set(newState) {
			const oldState = this._state;
			const changed = this._changed = {};
			let dirty = false;

			for (const key in newState) {
				if (this._computed[key]) throw new Error(`'${key}' is a read-only computed property`);
				if (this._differs(newState[key], oldState[key])) changed[key] = dirty = true;
			}
			if (!dirty) return;

			this._set(newState, changed);
		}
	});

	const store = new Store({
		players: [],
	    rounds: [],
	    started: false
	});

	window.store = store;

	// save data to localStorage every time our state changes
	useLocalStorage(store, 'scorekeeper');

	const app = new App({
		target: document.body,
		store
	});

	return app;

}());
//# sourceMappingURL=bundle.js.map
