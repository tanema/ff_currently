Components.utils.import("resource://gre/modules/AddonManager.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");

if (typeof newtabbootstrap == 'undefined') {
	var newtabbootstrap = {
		url : "chrome://currently/content/index.html",
		page : 1,
		homepage : "about:home",
		initialPagesUpdated : false,
		ffPreferences : Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),
		newtablusPreferences : Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("accessibility.newtabbootstrap."),

		defaultNewTabHandler : window.BrowserOpenTab,
		defaultTMP_BrowserOpenTab : window.TMP_BrowserOpenTab,

		backup : function() {
			try {
				this.newtablusPreferences.getCharPref('ver');
			} catch (e) {
				if (e.name == 'NS_ERROR_UNEXPECTED') {
					this.backupDate();
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
		openTab : function() {
			try {
				if (!gBrowser) {
					window.openDialog(newtabbootstrap.url, "_blank", "chrome,all,dialog=no", "about:blank");
					return;
				}
				gBrowser.loadOneTab(newtabbootstrap.url, { inBackground : false });
				focusAndSelectUrlBar();
			} catch (e) {
			}
		},
		openDefaultTab : function() {
			window.BrowserOpenTab = this.defaultNewTabHandler;
		},
		init : function() {
			try {
				if (this.ffPreferences.getCharPref("browser.newtab.url") == this.url) {
					this.ffPreferences.setCharPref("browser.newtab.url", "about:newtab");
				}
			} catch (e) {
			}
			this.backup();
			if (!this.initialPagesUpdated) {
				if ('gInitialPages' in window && window.gInitialPages instanceof Array) {
					window.gInitialPages.push(this.url);
				}
				this.initialPagesUpdated = true;
			}
			window.BrowserOpenTab = this.openDefaultTab;
			window.BrowserOpenTab = this.openTab;
		}
	};
}

if (typeof newtabbootstrapListener == 'undefined') {
	if (typeof newtabbootstrap) {
		var newtabbootstrapListener = {
			onUninstalling : function(addon) {
				if (addon.id.toLowerCase() == newtabbootstrap.id) {
					newtabbootstrap.recovery();
				}
			},
			onDisabling : function(addon) {
				if (addon.id.toLowerCase() == newtabbootstrap.id) {
					newtabbootstrap.recovery();
				}
			}
		};
	}
}
window.addEventListener('load', function() {
	if (typeof newtabbootstrap != "undefined") {
		newtabbootstrap.init();
	}
	if (typeof newtabbootstrapListener != 'undefined') {
		AddonManager.addAddonListener(newtabbootstrapListener);
	}
}, false);

window.addEventListener('unload', function() {
	if (typeof newtabbootstrapListener != 'undefined') {
		AddonManager.removeAddonListener(newtabbootstrapListener);
	}
}, false);
