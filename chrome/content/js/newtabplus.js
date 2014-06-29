Components.utils.import("resource://gre/modules/AddonManager.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");

//最后一页函数
if (typeof newtabplusLastTab == 'undefined') {
	var newtabplusLastTab = function(gBrowser) {
		var self = this;
		this.gBrowser = gBrowser;

		var loadListener = function(event) {
			try {
				var doc = event.originalTarget;
				var win = doc.defaultView;

				if (typeof win != 'undefined' && win.parent != win) {
					return;
				}

				var oneTab = self.gBrowser.tabContainer.childNodes.length == 1;
				var emptyTab = self.gBrowser.contentDocument.location == "about:blank" || self.gBrowser.contentDocument.location == "about:newtab";
				if (oneTab && emptyTab && typeof newtabplus != 'undefined') {
					self.gBrowser.contentDocument.location = newtabplus.url;
				}
			} catch (ex) {
				dump("SORRY! " + ex + " \n");
			}

		};

		function refresh() {
			try {
				self.gBrowser.removeEventListener("load", loadListener, true);
			} catch (ex) {
				dump("SORRY! " + ex + " \n");
			}
			self.gBrowser.addEventListener("load", loadListener, true);
		}

		this.start = function() {
			refresh();
		};
	};

	if (typeof newtabplusLastTabInstance == 'undefined') {
		var newtabplusLastTabInstance = {
			instances : [],
			start : function(window) {
				var instance = new newtabplusLastTab(window.gBrowser);
				instance.start();
				this.instances.push(instance);
			}
		};
	}
}

// 主函数
if (typeof newtabplus == 'undefined') {
	var newtabplus = {
		// 参数声明
		ver : "4.6.2",
		id : "weidunewtab@gmail.com",
		url : "chrome://currently/content/index.html",
		page : 1,
		homepage : "about:home",
		initialPagesUpdated : false,
		ffPreferences : Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),
		newtablusPreferences : Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("accessibility.newtabplus."),

		defaultNewTabHandler : window.BrowserOpenTab,
		defaultTMP_BrowserOpenTab : window.TMP_BrowserOpenTab,

		// 备份用户设置
		backup : function() {
			try {
				this.newtablusPreferences.getCharPref('ver');
			} catch (e) {
				if (e.name == 'NS_ERROR_UNEXPECTED') {
					this.backupDate();
					// this.ffPreferences.setIntPref("browser.startup.page", 1);
					// this.ffPreferences.setCharPref("browser.startup.homepage", this.url);
				}
			}
		},
		backupDate : function() {
			try {
				this.page = this.ffPreferences.getIntPref("browser.startup.page");
				this.homepage = this.ffPreferences.getCharPref("browser.startup.homepage");
			} catch (e) {
			}
			this.newtablusPreferences.setIntPref('page', this.page);
			this.newtablusPreferences.setCharPref('homepage', this.homepage);
			this.newtablusPreferences.setCharPref('ver', this.ver);
		},
		// 恢复用户数据
		recovery : function() {
			try {
				this.page = this.newtablusPreferences.getIntPref('page');
				this.homepage = this.newtablusPreferences.getCharPref('homepage');

				this.ffPreferences.setIntPref('browser.startup.page', this.page);
				this.ffPreferences.setCharPref('browser.startup.homepage', this.homepage);
			} catch (e) {
			}
			this.newtablusPreferences.deleteBranch("");
		},
		// 打开tab
		openTab : function() {
			try {
				if (!gBrowser) {
					window.openDialog(newtabplus.url, "_blank", "chrome,all,dialog=no", "about:blank");
					return;
				}
				gBrowser.loadOneTab(newtabplus.url, { inBackground : false });
				focusAndSelectUrlBar();
			} catch (e) {
			}
		},
		openDefaultTab : function() {
			window.BrowserOpenTab = this.defaultNewTabHandler;
		},
		openHelp : function() {
			if (this.getLocale() == 'zh-cn' || this.getLocale() == 'zh') {
				try {
					gBrowser.loadOneTab('http://www.weidunewtab.com/help.html', { inBackground : false });
					focusAndSelectUrlBar();
				} catch (e) {
				}
			} else {
				try {
					gBrowser.loadOneTab('http://www.newtabplus.com/help.html', {inBackground : false});
					focusAndSelectUrlBar();
				} catch (e) {
				}
			}
		},
		getLocale : function() {
			var nav = window.navigator;
			var _language = "en";
			if (typeof nav.language == "undefined" && typeof nav.browserLanguage == "undefined") {
				var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("general.useragent.");
				_language = prefs.getCharPref('locale').toLowerCase();
			} else {
				// With the HTML language page judgment standard
				var _languages = (typeof nav.language == "undefined" ? nav.browserLanguage : nav.language).split("_");
				_language = _languages[0].toLowerCase();
				if (_languages.length > 1) {
					_language = _languages[0].toLowerCase() + "-" + _languages[1].toLowerCase();
				}
			}
			return _language;
		},
		// 打开设置
		openOptions : function() {
			var height = window.screen.availHeight / 2 - 60;
			var width = window.screen.availWidth / 2 - 210;
			window.openDialog('chrome://currently/content/options.xul', '', 'resizable=no,screenX=' + width + ',screenY=' + height + '\'');
			focusAndSelectUrlBar();
		},
		// 初始化
		init : function() {
			// 恢复bug
			try {
				if (this.ffPreferences.getCharPref("browser.newtab.url") == this.url) {
					this.ffPreferences.setCharPref("browser.newtab.url", "about:newtab");
				}
			} catch (e) {
			}
			// ***
			if (typeof newtabplusLastTabInstance != 'undefined') {
				newtabplusLastTabInstance.start(window);
			}
			this.backup();
			// 隐藏url
			if (!this.initialPagesUpdated) {
				if ('gInitialPages' in window && window.gInitialPages instanceof Array) {
					window.gInitialPages.push(this.url);
				}
				this.initialPagesUpdated = true;
			}
			// this.ffPreferences.setCharPref("browser.newtab.url", this.url);
			//重写BrowserOpenTab
			//先restore == > defaultNewTabHandler，
			//再replace == > defaultTMP_BrowserOpenTab
			window.BrowserOpenTab = this.openDefaultTab;
			window.BrowserOpenTab = this.openTab;
		}
	};
}

// 绑定事件
if (typeof newtabplusListener == 'undefined') {
	if (typeof newtabplus) {
		var newtabplusListener = {
			onUninstalling : function(addon) {
				if (addon.id.toLowerCase() == newtabplus.id) {
					newtabplus.recovery();
				}
			},
			onDisabling : function(addon) {
				if (addon.id.toLowerCase() == newtabplus.id) {
					newtabplus.recovery();
				}
			}
		};
	}
}
window.addEventListener('load', function() {
	if (typeof newtabplus != "undefined") {
		newtabplus.init();
	}
	if (typeof newtabplusListener != 'undefined') {
		AddonManager.addAddonListener(newtabplusListener);
	}
}, false);

window.addEventListener('unload', function() {
	if (typeof newtabplusListener != 'undefined') {
		AddonManager.removeAddonListener(newtabplusListener);
	}
}, false);
