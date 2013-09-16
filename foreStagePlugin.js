/***
|Name:|foreStagePlubgin|
|Description:|Adds TiddlyWiki elements to the flip side of the backStage bar|
|Version:|1.0|
|Date:|7-June-2013|
|Source:||
|Author:|BuggyJay|
|Email:|BuggyJeff@gmail.com|
|License:|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]||
!!Description
when backagestage is hidden, it is replaced with a forestage - configured with a tid titled foreStageConfig, which 
needs to contain the follow type of json which defines the contents of the forestage:-
{{{
[[MyTiddler]], //link to tiddler 'MyTiddler'
<<MyMacro>>, // embed macro in  bar e.g <<search>>
""MyText"",  embed text in bar
//or a drop down can  be included:-
{{
	"text": "Start",
	"tooltip":"Main Menu",
	"content": "<<tiddler MainMenu>>"
}} 

}}}
!Code
***/
//{{{
backstage.tiddler=tiddler;
backstage.init = function() {
		var cmb = config.messages.backstage;
		this.area = document.getElementById("backstageArea");
		this.toolbar = jQuery("#backstageToolbar").empty()[0];
		//need a way to disable backstage by have these removed
		if(true) {
			this.button = jQuery("#backstageButton").empty()[0];
			this.button.style.display = "block";
			var t = "foreStage" + " "+glyph("bentArrowLeft");
			this.showButton = createTiddlyButton(this.button,t,cmb.open.tooltip,
						function(e) {backstage.show(); return false;},null,"backstageShow");
			var t = cmb.open.text + " " + glyph("bentArrowLeft");
			this.hideButton = createTiddlyButton(this.button,t,cmb.close.tooltip,
						function(e) {backstage.hide(); return false;},null,"backstageHide");
		}
		this.cloak = document.getElementById("backstageCloak");
		this.panel = document.getElementById("backstagePanel");
		this.panelFooter = createTiddlyElement(this.panel,"div",null,"backstagePanelFooter");
		this.panelBody = createTiddlyElement(this.panel,"div",null,"backstagePanelBody");
		this.cloak.onmousedown = function(e) {backstage.switchTab(null);};
		this.content = document.getElementById("contentWrapper");
                this.numBackTabs=config.backstageTasks.length;/*
		if(config.options.chkBackstage) 
			this.show();
		else
			this.hide();*/
	var tiddler = this.tiddler;
	setStylesheet(store.getTiddlerText(tiddler.title+'##Stylesheet'),'BackstageSidebarPlugin');
		this.show();
	};
		
backstage.show= function() {

		this.toolbar = jQuery("#backstageToolbar").empty()[0];
		this.forestage();
		this.area.style.display = "block";

		jQuery(this.showButton).hide();
		jQuery(this.hideButton).show();
		config.options.chkBackstage = true;
		saveOption("chkBackstage");
		jQuery(this.content).addClass("backstageVisible");
	};

backstage.hide =function() {
		this.toolbar = jQuery("#backstageToolbar").empty()[0];
		for(t=0; t<this.numBackTabs; t++) {
			var taskName = config.backstageTasks[t];
			var task = config.tasks[taskName];
			var handler = task.action ? this.onClickCommand : this.onClickTab;
			var text = task.text + (task.action ? "" : glyph("downTriangle"));
			var btn = createTiddlyButton(this.toolbar,text,task.tooltip,handler,"backstageTab");
			jQuery(btn).addClass(task.action ? "backstageAction" : "backstageTask");
			btn.setAttribute("task", taskName);
			}
			this.showButton.style.display = "block";
			this.hideButton.style.display = "none";
			config.options.chkBackstage = false;
			saveOption("chkBackstage");
			jQuery(this.content).removeClass("backstageVisible");	

	};
backstage.forestage = function ()
{
	var t;
	//need an alternative config for web site
	// if (website) var configfile ="WebforeStageConfig";
	//else
	var configfile ="foreStageConfig";
	if (null==store.getTiddlerText(configfile)) return;
	var tabs= store.getTiddlerText(configfile).replace(/[^\{]*\{\{\{([\s\S]*)\}\}\}/mg,"$1").split(';');

	for(t=0; t<tabs.length; t++) {
		var btn;
		var c = tabs[t].trim();
		switch(c.substr(0,2)) {
		case '""':
			createTiddlyText(this.toolbar,c.substr(2,c.length).replace(/([^"]*)[\s\S]*/,"$1"));
			break;
		case '[[':
			var btn = createTiddlyButton(this.toolbar,c.replace(/\[\[([\s\S]*)\]\][\s\S]*/,"$1"),"Go to "+c.replace(/\[\[([\s\S]*)\]\][\s\S]*/,"$1"),onClickTiddlerLink);
			btn.setAttribute("refresh","tiddler");
			btn.setAttribute("tiddlyLink",c.replace(/\[\[([\s\S]*)\]\][\s\S]*/,"$1"));
			break;
		case '<<':
						wikify(c,this.toolbar,null,null);
			break;
		case '{{':
			var tobj=jQuery.parseJSON(c.replace(/\{([\s\S]*)\}[\s\S]*/,"$1"));
			if (config.tasks[tobj.text] == null) {
				config.tasks[tobj.text] =tobj;
				config.backstageTasks.push(tobj.text);
			}
			var taskName = tobj.text;
			var task = config.tasks[taskName];
			var handler = task.action ? this.onClickCommand : this.onClickTab;
			var text = task.text + (task.action ? "" : glyph("downTriangle"));
			var btn = createTiddlyButton(this.toolbar,text,task.tooltip,handler);

			jQuery(btn).addClass(task.action ? "backstageAction" : "backstageTask");
			btn.setAttribute("task", taskName);
			break;
		default:
                        alert(c);
			break;
		};
	};

};
// hijack the core function
window.onClickTiddlerLink_orig = window.onClickTiddlerLink;
window.onClickTiddlerLink = function(ev) {
if (backstage.currTabName) backstage.switchTab(null);
	return onClickTiddlerLink_orig(ev);
}
//}}}



/***
!Stylesheet
#backstageToolbar .button {padding:0.7em 0.4em;}
!SheetStyle
***/
