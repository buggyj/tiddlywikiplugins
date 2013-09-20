/***
|Name|ClipListPlugin|
|Source||
|Documentation||
|Version|1.0|
|Author|BJ|
|License|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.2|
|Type|plugin|
|Requires||
|Overrides||
|Options|##Configuration|
|Description|shows clips from a folded list|
||Base on NestedSlidersPlugin - http://www.TiddlyTools.com/#NestedSlidersPlugin| 
!!!!!Documentation
>see [ClipListPluginInfo]]


!!!!!Code
***/
//{{{
//version.extensions.ClipListPlugin= {major: 1, minor: 1, revision: 1, date: new Date(2013,09,15)};

config.macros.ClipList = {};
config.macros.ClipList.handler = function (place,macroName,params,wikifier,paramString,tiddler){ 
    // this will run when macro is called from a tiddler
    var tidShowLabel= 'delete fold';

    var togShow = function (e) {
        if (!e) var e = window.event;
        alert("delete a fold by draging and dropping it here");
        e.cancelBubble = true;
        if (e.stopPropagation)
           e.stopPropagation();
        return(false);
    }//end func togShow
    if (true){//!!tiddler.fields.countx) {//only in our list tiddlers
		var tag =createTiddlyButton(place,tidShowLabel,"drag a fold here",togShow,"button","togShowBtn");

		tag.ondragover=function (ev)
		{
			ev.preventDefault();
		}

		tag.ondrop=	function(ev)
		{
			ev.preventDefault();
			var data=ev.dataTransfer.getData("Text");
			//var tid = store.getTiddler(tiddler.title);
			var txt=tiddler.text;
			var parts= txt.split(data);
			if(2!=parts.length){alert("format error");return;}
			var index1= parts[0].lastIndexOf("ᏜᏜᏜᏜ");
			var index2= parts[1].indexOf("ᏜᏜᏜᏜ");
			tiddler.text= parts[0].substr(0,index1)+parts[1].substr(index2);
			store.saveTiddler(tiddler);
			story.refreshTiddler(tiddler.title,null,true);
		}

	}
}
//}}}
//{{{
config.commands.myedit={
	text: "write",
	tooltip: "Edit this tiddler in wysiwyg mode",
	readOnlyText: "view",
	readOnlyTooltip: "View the source of this tiddler",
	handler : function(event,src,title) {
		onClickClipList(event);
		//clearMessage();
		//var tiddlerElem = document.getElementById(story.idPrefix + title);
		//var fields = tiddlerElem.getAttribute("tiddlyFields");
		//story.displayTiddler(null,title,"EasyEditTemplate",false,null,fields);
		return false;
	}
}
config.formatters.push( {
	name: "ClipList",
	match: "\\n?\\Ꮬ{2}",
	terminator: "\\s*\\Ꮻ{3}\\n?",
	lookahead: "\\n?\\Ꮬ{2}(\\Ꮬ{2})?(\\*)?(\\@)?(\\[[^\\]]*\\])?",
	handler: function(w)
		{
			 var start = w.matchStart;
			 var lookaheadRegExp = new RegExp(this.lookahead,"mg");
			lookaheadRegExp.lastIndex = w.matchStart;			//alert(w.tiddler.text.substring(w.matchStart,w.matchStart+20)+w.source.substring(w.matchStart,w.matchStart+20));
			var lookaheadMatch = lookaheadRegExp.exec(w.source);
			if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
							  
				var soliton=lookaheadMatch[2];
				var label=lookaheadMatch[4];
				// location for rendering button and panel
				var place=w.output;
				//var show="none"; 
				var title='no title';
				if (label) title=label.trim().slice(1,-1);

				// create the button
				var btn = createTiddlyElement(createTiddlyElement(place,"h1",null,null,null),"a",null,null,title);//buttonClass,title);
				var editbutton=createTiddlyElement(place,"div",null,null,null);
				btn.onclick=onClickClipList;
				btn.setAttribute("href","javascript:;");
				btn.innerHTML=title; 
				btn.setAttribute("draggable","true");
				btn.setAttribute("ondragstart","drag(event)");
				// create slider panel
				var panelClass="sliderPanel";
				var panel=createTiddlyElement(place,"div",null,panelClass,null);
				panel.button = btn; // so the slider panel know which button it belongs to
				btn.sliderPanel=panel; // so the button knows which slider panel it belongs to
				panel.setAttribute("soliton",soliton=="*"?"true":"false");
				panel.style.display = "none";
				//var limit=w.source.indexOf(w.nextMatch,"ᏜᏜᏜᏜ")
				//

								

                editbutton.setAttribute("class","toolbar");
                editbutton.setAttribute("macro","toolbar myedit");

				var editpanel=createTiddlyElement(place,"div",null,panelClass,null);
				editpanel.setAttribute("soliton","true");

				editpanel.setAttribute("editpanel","true");
				editpanel.style.display = "none"
				editpanel.button = editbutton;
			    editbutton.sliderPanel=editpanel;
				// render slider 
				w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
moan=true;//alert(w.nextMatch);

				w.subWikify(panel,this.match);
moan=false
                var src = w.source.substring(start,w.nextMatch);
                editpanel.innerHTML=src;
				editpanel.setAttribute("clipsrc",src);
//alert(w.nextMatch);
			}
		}
	}
)

function drag(ev)
{
ev.dataTransfer.setData("Text",ev.target.innerHTML);
}
//}}}
//{{{
window.onClickClipList=function(e)
{
	if (!e) var e = window.event;
	var theTarget = resolveTarget(e);
	var orgTarget = theTarget;
	while (theTarget && theTarget.sliderPanel==undefined) theTarget=theTarget.parentNode;
	if (!theTarget)  {alert("pa nellink");return false;}
	var theSlider = theTarget.sliderPanel;
	var isOpen = theSlider.style.display!="none";

	// if SHIFT-CLICK, dock panel first (see [[MoveablePanelPlugin]])
	if (e.shiftKey && config.macros.moveablePanel) config.macros.moveablePanel.dock(theSlider,e);

	// show/hide the slider
	//if(config.options.chkAnimate )//&& (!hasClass(theSlider,'floatingPanel') || config.options.chkFloatingSlidersAnimate))
		//anim.startAnimating(new Slider(theSlider,!isOpen,e.shiftKey || e.altKey,"none"));
	//else
		theSlider.style.display = isOpen ? "none" : "block";
		
    // if showing panel, set focus to first 'focus-able' element in panel
	if (theSlider.style.display!="none") {
		if (theSlider.getAttribute("editpanel")=="true") {
			theSlider.innerHTML= store.getTiddlerText("ClipListPlugin##EditTemplate2");alert(theSlider.innerHTML);
					
			var tiddom=story.findContainingTiddler(theTarget);
			var tiddler = store.getTiddler(tiddom.getAttribute("tiddler"));
			applyHtmlMacros(theSlider,tiddler);
		} else {
		
			var ctrls=theSlider.getElementsByTagName("*");
			for (var c=0; c<ctrls.length; c++) {
				var t=ctrls[c].tagName.toLowerCase();
				if ((t=="input" && ctrls[c].type!="hidden") || t=="textarea" || t=="select")
					{ try{ ctrls[c].focus(); } catch(err){;} break; }
			}
		}
	}

	var tiddlerElem = story.findContainingTiddler(theTarget);
	// find and close all soliton panels...

	var all=tiddlerElem.getElementsByTagName("div");
	
	for (var i=0; i<all.length; i++) {
		 // if it is not a soliton panel, or the click was on the button that opened this panel, don't close it.
		if (all[i].getAttribute("soliton")!="true" || all[i].button==theTarget) continue;
		if (all[i].style.display!="none") all[i].style.display="none"; 

	}
	return false;
}
//}}}

//{{{

// TW2.2+
// hijack Morpher stop handler so sliderPanel/floatingPanel overflow is visible after animation has completed
if (version.major+.1*version.minor+.01*version.revision>=2.2) {
	Morpher.prototype.coreStop2 = Morpher.prototype.stop;
	Morpher.prototype.stop = function() {
		this.coreStop2.apply(this,arguments);
		var e=this.element;
//		if (hasClass(e,"sliderPanel")||hasClass(e,"floatingPanel")) {
		if (hasClass(e,"sliderPanel")) {			// adjust panel overflow and position after animation
			e.style.overflow = "visible";
		}
	};
}
//}}}

config.macros.myedit={};
Story.prototype.old={};
Story.prototype.old.gatherSaveFields=Story.prototype.gatherSaveFields;
Story.prototype.gatherSaveFields = function(e,fields){
	fields['text']="";
	if(e && e.getAttribute) {
		if (e.getAttribute("template")=="ClipListPlugin##ViewTemplate") {
			var newVal = config.macros.myedit.gather(e,fields);
			if (newVal) fields[f] = newVal;
		} else
		this.old.gatherSaveFields(e, fields);
	}
}
config.macros.myedit.gather = function(e,fields)
{
	if(e && e.getAttribute) {
		var f = e.getAttribute("edit");
		
		if (!!e.getAttribute("editpanel")) {
			if(f) fields[f] +=e.value.replace(/\r/mg,"");
			else fields['text'] +=e.getAttribute("clipsrc");
		} else if(f)
			if (f=='text') fields[f] += e.value.replace(/\r/mg,"");
			else if(f=='nonedit') fields['text'] +=e.getAttribute("clipsrc");
			else  fields[f] = e.value.replace(/\r/mg,"");
			
		if(e.hasChildNodes()) {
			var t,c = e.childNodes;
			for(t=0; t<c.length; t++)
				this.gather(c[t],fields);
		}
	}
};
config.macros.myedit.handler= function(place, macroName,params,wikifier,paramString,tiddler)
{
	var field = 'text'
	var rows =  0;
	var defVal =  place.parentNode.getAttribute( params[0]);//alert(place.parentNode.getAttribute("class"));
	place.parentNode.setAttribute("clipsrc","");
			var tiddlerElem = story.findContainingTiddler(place);
			var tiddler = tiddlerElem ? store.getTiddler(tiddlerElem.getAttribute("tiddler")) : null;
	alert(tiddler.title);
	if((tiddler instanceof Tiddler) && field) {
		story.setDirty(tiddler.title,true);
		var parts= defVal.split('!/%');
		var wrap=createTiddlyElement(null,"div");
		wrap.setAttribute("clipsrc",parts[0]+'!/%');alert(parts[0]);
		wrap.setAttribute("edit",'nonedit');//editpanel is set so that gather will find it - its a hack!!BJ
		place.appendChild(wrap);
		var e,v;
		if(field != "text" && !rows) {
			e = createTiddlyElement(null,"input",null,null,null,{
				type: "text", edit: field, size: "40", autocomplete: "off"
			});
			e.value = store.getValue(tiddler,field) || defVal;
			place.appendChild(e);
		} else {
			var wrapper1 = createTiddlyElement(null,"fieldset",null,"fieldsetFix");
			var wrapper2 = createTiddlyElement(wrapper1,"div");
			e = createTiddlyElement(wrapper2,"textarea");
			e.value = v =   parts[1];
			rows = rows || 10;
			var lines = v.match(/\n/mg);
			var maxLines = Math.max(parseInt(config.options.txtMaxEditRows,10),5);
			if(lines != null && lines.length > rows)
				rows = lines.length + 5;
			rows = Math.min(rows,maxLines);
			e.setAttribute("rows",rows);
			e.setAttribute("edit",field);
			place.appendChild(wrapper1);
			//place.parentNode.editPanel.innerHTML=	store.getTiddlerText("ClipEditTemplate");
		}		
		wrap=createTiddlyElement(null,"div");
		wrap.setAttribute("clipsrc",'!/%'+parts[02]);
		wrap.setAttribute("edit",'nonedit');//editpanel is set so that gather will find it - its a hack!!BJ
		place.appendChild(wrap);
		if(tiddler.isReadOnly()) {
			e.setAttribute("readOnly","readOnly");
			jQuery(e).addClass("readOnly");
		}
		return e;
	}else ("error");
};
/*
|~ViewToolbar|closeTiddler +editTiddler > fields syncing permalink references jump|
|~EditToolbar|+saveTiddler -cancelTiddler deleteTiddler|

!ViewTemplate
<!--{{{-->
<div class='toolbar'><span  macro='ClipList'></span><span macro='toolbar [[ClipListPlugin::ViewToolbar]]'></span></div>
<div class='title' macro='view title'></div>
<div class='subtitle'><span macro='view modifier link'></span>, <span macro='view modified date'></span> (<span macro='message views.wikified.createdPrompt'></span> <span macro='view created date'></span>)</div>
<div class='tagging' macro='tagging'></div>
<div class='tagged' macro='tags'></div>
<div class='viewer' macro='view text wikified'></div>
<div class='tagClear'></div>
<!--}}}-->

!EditTemplate2
*<!--{{{-->
<div class='toolbar' macro='toolbar +saveTiddler -cancelTiddler deleteTiddler'></div>
<div class='title' macro='view title'></div>
<div class='editor' macro='edit title'></div

<div macro='annotations'></div>
<div class='editor' macro='myedit clipsrc'></div>
<div class='editor' macro='edit tags'></div><div class='editorFooter'><span macro='message views.editor.tagPrompt'></span><span macro='tagChooser excludeLists'></span></div>
<!--}}}-->
!end
*/
