/***
|Name:|foreStagePlubgin|
|Description:|Adds TiddlyWiki elements to the flip side of the backStage bar|
|Version:|1.0|
|Date:|7-June-2013|
|Source:||
|Author:|BuggyJay|
|Email:|BuggyJef@gmail.com|
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

var butChooseronClick;

butChooser=function(place,title,tip,maccros)
{ 

	var popupmy;
		butChooseronClick = function(ev)
		{
			var e = ev || window.event;
			var lingo = config.views.editor.tagChooser;

			popupmy = Popup.create(this);
			var tags = maccros.split(",");// ["<<newTiddler>>","<<newTiddler>>"];
			if(tags.length == 0)
				document.getElementById("<li/>").text(lingo.popupNone).appendTo(popup);
			var t;
			for(t=0; t<tags.length; t++) {
				wikify(tags[t],createTiddlyElement(popupmy,"li",null,null," ",{style:"font-weight:normal; font-size:2em;"}),null,null);
			}
			Popup.show();
			e.cancelBubble = true;
			if(e.stopPropagation) e.stopPropagation();
			return false;
		};
		var btn = createTiddlyButton(place,title,tip,butChooseronClick);
};
backstage.tiddler=tiddler;
backstage.init = function() {
	backstage.oldclick =backstage.onClickTab;
	backstage.onClickTab =function (e) {backstage.toolbar.panelfresh=true;backstage.switchTab(this.getAttribute("task"));}
		var cmb = config.messages.backstage;
		this.area = document.getElementById("backstageArea");
		this.toolbar = document.getElementById("backstageToolbar");
		//need a way to disable backstage by have these removed
		if(true) {
			this.button = document.getElementById("backstageButton");
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
		this.cloak.onmousedown = function(e) { backstage.switchTab(null);};
		this.toolbar.onmouseup = function(e) { backstage.switchTab(null);}

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


		this.toolbar.innerHTML ="";
		this.forestage();
		this.area.style.display = "block";
		this.showButton.style.display = "none";
		this.hideButton.style.display = "block";
		config.options.chkBackstage = true;
		saveOptionCookie("chkBackstage");
		addClass(this.content,"backstageVisible"); 
	};

backstage.hide =function() {
		this.toolbar.innerHTML ="";
		for(t=0; t<this.numBackTabs; t++) {
			var taskName = config.backstageTasks[t];
			var task = config.tasks[taskName];
			var handler = task.action ? this.onClickCommand : this.onClickTab;
			var text = task.text + (task.action ? "" : glyph("downTriangle"));
			var btn = createTiddlyButton(this.toolbar,text,task.tooltip,handler,"backstageTab");
			addClass(btn,task.action ? "backstageAction" : "backstageTask");
					btn.onmouseup = function(e) { 			e.cancelBubble = true;
					if(e.stopPropagation) e.stopPropagation();
					return false;}
			btn.setAttribute("task", taskName);
			}
			this.showButton.style.display = "block";
			this.hideButton.style.display = "none";
			config.options.chkBackstage = false;
			saveOptionCookie("chkBackstage");	
			removeClass(this.content,"backstageVisible");	
	};
backstage.forestage = function ()
{
	var t;
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
			var tobj=JSON.parse(c.replace(/\{([\s\S]*)\}[\s\S]*/,"$1"));
			if (config.tasks[tobj.text] == null) {
				config.tasks[tobj.text] =tobj;
				config.backstageTasks.push(tobj.text);
			}
			var taskName = tobj.text;
			var task = config.tasks[taskName];
			var handler = task.action ? this.onClickCommand : this.onClickTab;
			var text = task.text + (task.action ? "" : glyph("downTriangle"));
			var btn = createTiddlyButton(this.toolbar,text,task.tooltip,handler);
			addClass(btn,task.action ? "backstageAction" : "backstageTask");
					btn.onmouseup = function(e) { 			e.cancelBubble = true;
					if(e.stopPropagation) e.stopPropagation();
					return false;}
			btn.setAttribute("task", taskName);
			break;
		case '((':
					var tobj=JSON.parse(c.replace(/\(\(([\s\S]*)\)\)[\s\S]*/,'{$1}'));

						butChooser(this.toolbar,tobj.text,tobj.tooltip,tobj.content);
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
