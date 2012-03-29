// Browser support: IE9, Chrome/Firefox/Safari/Opera
// IE8: Doesn't support getElementsByClassName()
// IE8: Doesn't support document.head
// IE8: Doesn't support Array.filter()
// IE8: Doesn't support Array.map()
// IE9: Doesn't support using reserved keywords as property names; instead of blank.delete(), use blank['delete']();
// Firefox 7: Doesn't support insertAdjacentHTML
// Opera: Object.keys() will include "length" property
var blank = {
	_KEY_PREFIX: '_blank-',  // Prefix to use for local storage
    _CSS_CLASS: 'blank-css', // Class name used to mark added <link>
    _JS_CLASS: 'blank-js',   // Class name used to mark added <script>
    _STYLE_CLASS: 'blank-style', // Class name used to mark added <style>
    _LIBS: {
        camanjs: {
            css: [],
            js: ['http://cdnjs.cloudflare.com/ajax/libs/camanjs/3.1.0/caman.full.min.js']
        },
        d3: {
            css: [],
            js: ['http://cdnjs.cloudflare.com/ajax/libs/d3/2.7.4/d3.min.js']
        },
        datejs: {
            css: [],
            js: ['http://cdnjs.cloudflare.com/ajax/libs/datejs/1.0/date.min.js']
        },
		jquery: {
			css: [],
			js: ['http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js']
		},
        'jquery-ui': {
            css: ['http://ajax.googleapis.com/ajax/libs/jqueryui/1/themes/base/jquery-ui.css'],
            js: ['http://ajax.googleapis.com/ajax/libs/jqueryui/1/jquery-ui.min.js']
        },
        ocanvas: {
            css: [],
            js: ['http://cdnjs.cloudflare.com/ajax/libs/ocanvas/2.0.0/ocanvas.min.js']
        },
        raphael: {
            css: [],
            js: ['http://cdnjs.cloudflare.com/ajax/libs/raphael/2.0.1/raphael-min.js']
        },
        underscore: {
            css: [],
            js: ['http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.3.1/underscore-min.js']
        }
	},
	_hash: '',
    _ignoreHashChange: false,
    data: '',
	
	_getName: function(name) {
		return name || location.hash.slice(1) || '#';
	},
	
	_getFriendlyName: function(name) {
		return (name === '#') ? name : '#' + name;
	},
	
    /**
	 * Initializes the page with the specified save state.
	 * Don't use this method directly, as this does not unload any
	 * previous CSS or JavaScript that was on the page previously.
	 * Use blank.load() instead.
	 * @param {string} name Name of the save state to load.
	 * @throws {SyntaxError} if the save state data can't be parsed.
	 * @throws {Error} if a name isn't specified.
	 */
	_init: function(name) {
		this._hash = location.hash;
		
		var name = this._getName();
		
		// Try getting the JSON object from local storage
		var pageJSON = localStorage.getItem(this._KEY_PREFIX + name);
		
        if (pageJSON) {
            this._import(pageJSON);
            console.log('Loaded ' + this._getFriendlyName(name));
        }
	},
	
    _import: function(json) {
        // Try parsing it if it exists
        var page = JSON.parse(json);
        
        // Get custom user data
        this.data = page.data;
        
        // Add HTML
        document.body.innerHTML = page.body;
		
        // Add <link>, <script>, and <style> tags
        for (var i = 0, css; css = page.links[i]; ++i) this.include(css, 'css');
        for (var i = 0, js; js = page.scripts[i]; ++i) this.include(js, 'js');
        for (var i = 0, style; style = page.styles[i]; ++i) this.style(style);
    },
    
    _export: function() {
        // Create page object and gather included <link> and <script> tags
        var page = {},
            links = document.head.getElementsByClassName(this._CSS_CLASS),
            scripts = document.head.getElementsByClassName(this._JS_CLASS),
            styles = document.head.getElementsByClassName(this._STYLE_CLASS);

        // Save HTML and custom user data;
        page.body = document.body.innerHTML;
        page.data = blank.data;
        
        // Save <link>, <script>, and <style> info
        page.links = Array.prototype.map.call(links, function(link) { return link.href; });
        page.scripts = Array.prototype.map.call(scripts, function(script) { return script.src; });
        page.styles = Array.prototype.map.call(styles, function(style) { return style.textContent; });
        
        return JSON.stringify(page);
    },
    
	/**
	 * Deletes the current save state and reloads the page.
	 */
	clear: function() {
		this.delete(this._getName());
		location.reload();
	},
	
    /**
     * Deletes the save state with the specified name.
	 * @param {string} [name] Name of the save state to clear.
     */
	'delete': function(name) {
        name = this._getName(name);
        
		// Delete save state
        localStorage.removeItem(this._KEY_PREFIX + name);
        console.log('Deleted ' + this._getFriendlyName(name));
	},
    
	/**
	 * Deletes all save states.
	 */
	deleteAll: function() {
		localStorage.clear();
	},
	
	/**
	 * Loads the specified save state.
	 * @param {string} name Name of the save state to load.
	 */
	load: function(name) {
        name = this._getName(name);
        
		// Specify hash (#) and reload the page.
		// This ensures that all previous data is cleared out
		// before loading the save state.
		location.hash = name;
        location.reload(); // Make sure it reloads
	},
	
    /**
     * Saves the current page state (HTML body and included CSS/JS files).
     * @param {string} name Filename used to save the page.
     */
	save: function(name) {
        name = this._getName(name);
        
        // Store JSON-serialized page object in local storage
		localStorage.setItem(this._KEY_PREFIX + name, this._export());
        console.log('Saved ' + ((name === '#') ? '#' : '#' + name));
        
        // Update URL, but don't cause a page refresh
        this._ignoreHashChange = true;
		location.hash = name;
	},
	
	/**
	 */
    state: function(data) {
        if (data) {
            this._import(unescape(data));
        } else {
            return escape(this._export());
        }
    },
    
	/**
	 */
    list: function() {
        var prefix = this._KEY_PREFIX,
            keys = Object.keys(localStorage);
        
        var list = keys.filter(function(key) {
            return key.indexOf(prefix !== 0);
        }).map(function(key) {
            return key.slice(prefix.length);
        });
        
        console.log('Available save states: ' + list.length);
        return list;
    },
    
	/**
	 */
	lib: function(/* lib, lib2, ... */) {
        var argLength = arguments.length;
        
        if (argLength === 0) {
            var libs = Object.keys(this._LIBS);
            console.log('Available libraries: ' + libs.length);
            return libs;
        }
        
        for (var i = 0; i < argLength; ++i) {
            var lib = this._LIBS[arguments[i]];
            if (lib) {
                for (var j = 0, css; css = lib.css[j]; ++j) this.include(css, 'css');
                for (var j = 0, js; js = lib.js[j]; ++j) this.include(js, 'js');
            }
        }
	},
       
	/**
	 */
    include: function(url, type) {
        if (!url) {
            console.error("URL is required.");
            return;
        }
        
        type = (type || url.split('.').pop()).toLowerCase();
        
        if (type === 'css') {
            var link = document.createElement('link');
			link.className = this._CSS_CLASS;
			link.rel = 'stylesheet';
			link.href = url;
			
			// Add <link> to <head>
			document.head.appendChild(link);
			console.log('Loaded ' + url);
        } else if (type === 'js') {
            var script = document.createElement('script');
            script.className = this._JS_CLASS;
			script.src = url;
            
			// Add <script> to <head>
			document.head.appendChild(script);
			console.log('Loaded ' + url);
        } else {
            console.error("Couldn't determine URL type for " + url + ". Try specifying css or js as the type parameter.");
        }
    },
    
	/**
	 */
    html: function(html) {
        if (!html) {
            console.error("HTML is required.");
            return;
        }
        
        document.body.insertAdjacentHTML('beforeend', html);
	},
    
	/**
	 */
    style: function(css) {
        if (!css) {
            console.error("CSS is required.");
            return;
        }
        
        var style = document.createElement('style');
        style.className = this._STYLE_CLASS;
        style.textContent = css;
        document.head.appendChild(style);
    }
};

window.copy = window.copy || function(text) {
	window.prompt('Copy this text', text);
};

window.onhashchange = function() {
	if (!blank._ignoreHashChange && blank._hash !== location.hash) location.reload();
    blank._ignoreHashChange = false;
};

window.onload = function() {
    blank._init();
};