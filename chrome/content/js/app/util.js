// Setup google analytics
//var _gaq = _gaq || [];
//_gaq.push(['_setAccount', 'UA-33402958-1']);
//_gaq.push(['_trackPageview']);

//Raven.config('https://b37dffa6de1b4e908c01f26629f20e65@app.getsentry.com/4859');
//window.onerror = Raven.process;

function OSType() {
  var OSName="Unknown OS";
  if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
  if (navigator.appVersion.indexOf("Mac")!=-1) OSName="MacOS";
  if (navigator.appVersion.indexOf("X11")!=-1) OSName="UNIX";
  if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux";
  return OSName;
}

function inBeta() {
  //if (chrome.runtime.getManifest().name.indexOf("Beta") !== -1) {
  //  return true;
  //} else {
  //  return false;
  //}
  return false;
}

function loadGA() {
  var ga = document.createElement('script'); 
  ga.type = 'text/javascript'; 
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
}
