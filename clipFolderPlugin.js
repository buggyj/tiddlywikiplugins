/***
|Name|ClipListPlugin|
|Version|1.0|
|Author|BJ|
|Date:|26-11-2013|
|License|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|Type|plugin|
|CoreVersion|2.4.3|
|Requires|http://www.TiddlyTools.com/#TaggedTemplateTweak|
|Overrides||
|Description|shows clips from a folded list|
Idea started from NestedSlidersPlugin - http://www.TiddlyTools.com/#NestedSlidersPlugin
!Description
Create and manage lists of clips - for use with tiddlyclip
!!!!!Code
***/
//{{{
//version.extensions.ClipListPlugin= {major: 1, minor: 1, revision: 1, date: new Date(2013,11,26)};
var xxx1;//BJ hack that allows clips to be render inside slider - remembers location of slider
config.macros.ClipList = {};
config.macros.ClipList.drophandler = function (contents, droptypes) {
	var i, parts = contents.split("://");
	if (parts.length == 1) { alert("I don't know what you dropped"+contents); return ['error',contents]; }
	var part =[];
	part[0] = parts.shift();
	part[1] = parts.join("://");
	for (i = 0; i < droptypes.length; i++) {
		if (part[0] == droptypes[i]) return part;
	}
	alert("I don't know what to do with a "+part[0]+" type");
	return ['unsupported', part[1]];
}
config.macros.ClipList.handler = function (place,macroName,params,wikifier,paramString,tiddler){ 
    // this will run when macro is called from a tiddler
    var tidShowLabelDl= 'delete clip';
    var togShowDl = function (e) {
        if (!e) var e = window.event;
        alert("delete a clip by draging and dropping it here");
        e.cancelBubble = true;
        if (e.stopPropagation)
           e.stopPropagation();
        return(false);
    }//end func togShow
    if (true){//!!tiddler.fields.countx) {//only in our list tiddlers
		var tag =createTiddlyButton(place,tidShowLabelDl,"drag a clip here",togShowDl,"button","togShowBtn");

		tag.ondragover=function (ev)
		{
			ev.preventDefault();
		}

		tag.ondrop=	function(e)
		{
			if (!e) var e = window.event;			
			e.cancelBubble = true;
			if (e.stopPropagation)
			   e.stopPropagation();
			var dropcontent = config.macros.ClipList.drophandler(e.dataTransfer.getData("Text"),["clip"]);
			if (dropcontent[0]=='error' || dropcontent[0]=='unsupported') return;
			if(dropcontent[1].substr(0,2)!="ᏜᏜ"){alert("format error");return;}
			var txt=tiddler.text;
			var parts= txt.split(dropcontent[1]);
			if(2!=parts.length){alert("internal error");return;}

			tiddler.text= parts.join("");
			store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created,tiddler.creator);
			autoSaveChanges(null,[tiddler]);
			story.refreshTiddler(tiddler.title,null,true);

			return(false);
		}

	}
    var tidShowLabelAdd= 'add clip';

    var togShowAdd = function (e) {
		var newclip='ᏜᏜᏜᏜ*[0-new]\n!/%%/\n';
        if (!e) var e = window.event;
        e.cancelBubble = true;
        if (e.stopPropagation)
           e.stopPropagation();
         var tid = store.getTiddler(tiddler.title);
		var num = tid.fields.countx;
		if (!num) num=1;
		else num++;
	
		tid.fields.countx=""+num;
		tid.text= newclip.replace(/\[\d*\-/,'['+num+'-')+tid.text;

		 store.saveTiddler(tid.title,tid.title,tid.text,tid.modifier,tid.modified,tid.tags,tid.fields,true,tid.created,tid.creator);
		autoSaveChanges(null,[tid]);
		story.refreshTiddler(tid.title,null,true);
        return(false);
    }//end func togShow
    if (true){//!!tiddler.fields.countx) {//only in our list tiddlers
		var tag =createTiddlyButton(place,tidShowLabelAdd,"new clip",togShowAdd,"button","togShowBtn");

	}
}
//}}}
//{{{
config.commands.myedit={
	text: "EditClip",
	tooltip: "Edit this clip",
	readOnlyText: "view",
	readOnlyTooltip: "View the source of this clip",
	handler : function(event,src,title) {
		onClickClipList(event);
		return false;
	}
}
config.commands.cancelMylTiddler={
	text: "cancel",
	tooltip: "Undo your changes to this tiddler",
	warning: "Are you sure you want to abandon any changes to '%0'?",
	readOnlyText: "done",
	readOnlyTooltip: "View this tiddler normally",
	handler : function(event,src,title) {		
		if( !readOnly) {
			if(!confirm("abandon any changes?"))
				return false;
		}
		//window.onClickClipList.edit =false;	
		story.setDirty(title,false);
		story.refreshTiddler(title,null,true);
		return;
	}
};

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
				var placeold=w.output;
				var place;
				// location for rendering button and panel				

				//var show="none"; 
				var title='no title';
				var tiddom=story.findContainingTiddler(placeold);
				var titleis = tiddom.getAttribute("tiddler");
				var tiddler = store.getTiddler(titleis);

				var num = placeold.getAttribute("num");
				if (!num) {
					num=1;
					{
						place = config.macros.slider.createSlider(placeold,null,"From "+num);
						xxx1=place;
					}
				}
				else {
					num++;
					if (Math.floor((num)/10 ) * 10==num) {
						place = config.macros.slider.createSlider(placeold,null,"From "+num);
						xxx1=place;
					}
					else place = xxx1;
				}
				placeold.setAttribute("num",num);		
					
				var part3=label.split("-")
				part3.shift();
				label='['+num+'-'+part3.join("-");//strip leading number
				if (label) title=label.trim().slice(1,-1);


				// create the button
				var clipbar=createTiddlyElement(place,"div",null,"annotation",null);
				//var clipbar=createTiddlyElement(place,"div",null,null," ",{style:"font-size:12pt;line-height:12px"});
				var container=createTiddlyElement(clipbar,"span",null,null,null);
				var btn = createTiddlyElement(container,"a",null,null,title);//buttonClass,title);

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
			
				var editbutton=createTiddlyElement(clipbar,"span",null,null,null);
				editbutton.align="right"
                editbutton.setAttribute("macro","toolbar myedit");

				var editpanel=createTiddlyElement(place,"div",null,panelClass,null);
				editpanel.setAttribute("soliton","true");

				editpanel.setAttribute("editpanel","true");
				editpanel.style.display = "none"
				editpanel.button = editbutton;
			    editbutton.sliderPanel=editpanel;
				// render slider 
				w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
				w.subWikify(panel,this.match);
				
                var src = w.source.substring(start,w.nextMatch);

                if  (src.slice(src.length-2)=='ᏜᏜ') {
					src=src.slice(0,-2);
				}         
				if  (src.substr(0,4)=='ᏜᏜᏜᏜ') 
					editpanel.setAttribute("clipsrc",src);
				else
					editpanel.setAttribute("clipsrc",'ᏜᏜ'+src);
				btn.editpanel=editpanel;
				btn.ondragover=function (ev)
				{
					ev.preventDefault();
				}

				btn.ondrop=	function(e)
				{
					if (!e) var e = window.event;
					var dropcontent = config.macros.ClipList.drophandler(e.dataTransfer.getData("Text"),["clip"]);
					if (dropcontent[0]=='error' || dropcontent[0]=='unsupported') return;
					if(dropcontent[1].substr(0,2)!="ᏜᏜ"){alert("format error");return;}
					var txt=tiddler.text;
					var parts= txt.split(dropcontent[1]);//remove moving clip from present location
					if(2!=parts.length) {
						if (txt.substr(0, dropcontent[1].length)!=dropcontent[1]) return;//not first clip in this list
						else txt= txt.substr(dropcontent[1].length); //remove first item
					} else {
						txt= parts.join("");					
					}
                    e.cancelBubble = true;
					if (e.stopPropagation)   e.stopPropagation();

					//now splice in the moving clip
					var oldtxt =btn.editpanel.getAttribute("clipsrc");
					var parts= txt.split(oldtxt);//remove target clip from present location
					if(2!=parts.length)	tiddler.text= dropcontent[1]+txt;//begining of list
					else 				tiddler.text= parts.join(dropcontent[1]+oldtxt);
					store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created,tiddler.creator);
					autoSaveChanges(null,[tiddler]);
					story.refreshTiddler(tiddler.title,null,true);

					return(false);
				}

			}
		}
	}
)

function drag(ev)
{
ev.dataTransfer.setData("Text","clip://"+ev.target.editpanel.getAttribute("clipsrc"));
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
	var tiddom=story.findContainingTiddler(theTarget);
	var title = tiddom.getAttribute("tiddler");
	var tiddler = store.getTiddler(title);
	// if SHIFT-CLICK, dock panel first (see [[MoveablePanelPlugin]])
	if (e.shiftKey && config.macros.moveablePanel) config.macros.moveablePanel.dock(theSlider,e);
	if (story.isDirty(title)){

		if( !readOnly) {
			if(!confirm("abandon any changes?"))
				return false;
		}
		//window.onClickClipList.edit =false;
	    tiddom.setAttribute("num",0);

		//story.refreshTiddler(tiddom.getAttribute("tiddler"),null,true);
		story.setDirty(title,false);
		return;
	}
    
	// show/hide the slider
	//if(config.options.chkAnimate )//&& (!hasClass(theSlider,'floatingPanel') || config.options.chkFloatingSlidersAnimate))
		//anim.startAnimating(new Slider(theSlider,!isOpen,e.shiftKey || e.altKey,"none"));
	//else
		theSlider.style.display = isOpen ? "none" : "block";
		

	if (theSlider.style.display!="none") {
		if (theSlider.getAttribute("editpanel")=="true") {
			//window.onClickClipList.edit =true;
			orgTarget.style.display="none";//hide edit button
			theSlider.innerHTML= store.getTiddlerText("ClipListPlugin##EditTemplate2");//alert(theSlider.innerHTML);
			applyHtmlMacros(theSlider,tiddler);
		} else {     // if showing panel, set focus to first 'focus-able' element in panel
		
			var ctrls=theSlider.getElementsByTagName("*");
			for (var c=0; c<ctrls.length; c++) {
				var t=ctrls[c].tagName.toLowerCase();
				if ((t=="input" && ctrls[c].type!="hidden") || t=="textarea" || t=="select")
					{ try{ ctrls[c].focus(); } catch(err){;} break; }
			}
		}
	}

	var tiddlerElem = story.findContainingTiddler(orgTarget);
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
		Story.prototype.old.gatherSaveFields(e, fields);
	}
}
config.macros.myedit.gather = function(e,fields)
{
	function replacelinebreakshtml(text) {
		var segments = text.split(/(\<\/?pre\>)/);
		var result = '';
		for (var i = 0; i <segments.length; i++){
			if (i %4 ==2) result += segments[i];
			else result +=segments[i].replace(/(\r\n|\n|\r)/gm,"");
		}
		return result;
	}
	if(e && e.getAttribute) {
		var f = e.getAttribute("edit");
		var ck =e.getAttribute("name");
		if (!!e.getAttribute("editpanel")) {
			if(f) {if (f=='text') {
				var temp;
				if(!!ck) temp="<html>"+replacelinebreakshtml(CKEDITOR.instances[ck].getData())+"</html>" ;
				else temp=e.value.replace(/\r/mg,"");
				if (temp.substr(temp.length-1)!='\n') temp = temp+'\n';//BJ FIXME
				fields['text'] +=temp;
			} else
				fields[f] +=e.value.replace(/\r/mg,"");
		} else {
				var temp=e.getAttribute("clipsrc");

				if (temp.substr(temp.length-1)!='\n') temp = temp+'\n';
				fields['text'] +=temp;
			}
		} else if(f)
			if (f=='text') { 
				var temp;
				if(!!ck) temp="<html>"+replacelinebreakshtml(CKEDITOR.instances[ck].getData())+"</html>" ;
				else temp=e.value.replace(/\r/mg,"");		
				if (temp.substr(temp.length-1)!='\n') temp = temp+'\n';
				fields['text'] +=temp;
			} 
			else if(f=='nonedit') fields['text'] +=e.getAttribute("clipsrc");
			else  {alert("text----");fields[f] = e.value.replace(/\r/mg,"");}
			
		if(e.hasChildNodes()) {
			var t,c = e.childNodes;
			for(t=0; t<c.length; t++)
				this.gather(c[t],fields);
		}
	}
};
config.macros.drophere={};
config.macros.drophere.handler= function(place, macroName,params,wikifier,paramString,tiddler) {
					var tiddom=story.findContainingTiddler(place);
				var titleis = tiddom.getAttribute("tiddler");
				
				tiddom.ondragover=function (ev)
				{
					ev.preventDefault();
				}

				tiddom.ondrop=	function(ev)
				{
					ev.preventDefault();
					var dropcontent = config.macros.ClipList.drophandler(ev.dataTransfer.getData("Text"),["clip"]);
					if (dropcontent[0]=='error' || dropcontent[0]=='unsupported') return;
					if(dropcontent[1].substr(0,4)!="ᏜᏜᏜᏜ"){alert("format error");return;}
					var tid = store.getTiddler(titleis);;//alert(titleis);
					var parts= tid.text.split(dropcontent[1]);
					if(1!=parts.length)return;
					//var txt=tiddler.text;
					//if(data.substr(2,2)!="ᏜᏜ") data = "ᏜᏜ"+data;
					//if(data.substr(data.length-2)=="ᏜᏜ")  data = data.substr(0,data.length-2);
					var num = tid.fields.countx;
					if (!num) num=1;
					else num++;
					var data=dropcontent[1].replace(/\[\d*\-/,'['+num+'-');//alert(data);
					//var part3=label.split("-")
					//part3.shift();
					//label='['+num+part3.join("");//strip leading number
					tid.text=data+tid.text;//alert(data);
					tid.fields.countx=""+num;
					
					//tiddler.text= parts[0].substr(0,index1)+parts[1].substr(index2);
					store.saveTiddler(tid.title,tid.title,tid.text,tid.modifier,tid.modified,tid.tags,tid.fields,true,tid.created,tid.creator);
					autoSaveChanges(null,[tid]);
					story.refreshTiddler(tid.title,null,true);
				}
}

config.macros.myedit.handler= function(place, macroName,params,wikifier,paramString,tiddler)
{
	var field = 'text';
	var rows =  0;
	var editString =  place.parentNode.getAttribute( "clipsrc");//alert(place.parentNode.getAttribute("class"));
	place.parentNode.setAttribute("clipsrc","");//remove nonedit string to stop it being gathered
			var tiddlerElem = story.findContainingTiddler(place);
			var tiddler = tiddlerElem ? store.getTiddler(tiddlerElem.getAttribute("tiddler")) : null;
	//alert(tiddler.title);
	if((tiddler instanceof Tiddler) && field) {
		story.setDirty(tiddler.title,true);
		var parts= editString.split('!/%%/');
		var wrap=createTiddlyElement(null,"div");
		var parts2 = parts[0].split('[');
		var preamble=parts2.shift() +'[';//part2[0] now contains (the first part of) the heading
		var part3=parts2[0].split("-")
		preamble+=part3.shift()+'-'; //alert(preamble);
		parts2[0]=part3.join("-");//strip leading number
		parts2=parts2.join('[');
		parts2=parts2.split(']');
		postscript=']'+parts2.pop();
		var heading=parts2.join(']');
		

		wrap.setAttribute("clipsrc",preamble);//alert(preamble);
		wrap.setAttribute("edit",'nonedit');
		place.appendChild(wrap);
		var e,v;
		 {
			e = createTiddlyElement(null,"input",null,null,null,{
				type: "text", edit: field, size: "40", autocomplete: "off"
			});
			e.value =heading;
			place.appendChild(e);
			e.setAttribute("edit",field);
			 wrap=createTiddlyElement(null,"div");
			wrap.setAttribute("clipsrc",postscript+'!/%%/'+'\n');//alert(postscript);
		    wrap.setAttribute("edit",'nonedit');
		    place.appendChild(wrap);
		}
		if (false){
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
		else {
			var wrapper1 = createTiddlyElement(null,"fieldset",null,"viewer");
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
			var ck ="editor"+ Math.random();
			e.setAttribute("name",ck);
			e.setAttribute("id",ck);
			
			place.appendChild(wrapper1);
			if (!!config.options.chkNotWysiwyg) 
				CKEDITOR.replace(ck,{skin : 'moono'});
			else
				CKEDITOR.replace(ck,{ extraPlugins : 'divarea', skin : 'moonodiv'});
		}
		if(tiddler.isReadOnly()) {
			e.setAttribute("readOnly","readOnly");
			jQuery(e).addClass("readOnly");
		}
		return e;
	}else ("error");
};
config.macros.newClipList={};
config.macros.newClipList.label="new clip list";
config.macros.newClipList.prompt="new clip list";
config.macros.newClipList.accessKey=null;
config.macros.newClipList.title="new clip list";
config.macros.newClipList.template="ClipListPlugin##EditTemplate";
config.macros.newClipList.handler = function(place,macroName,params,wikifier,paramString)
{
	if(!readOnly) {
		params = paramString.parseParams("anon",null,true,false,false);
		var title = params[1] && params[1].name == "anon" ? params[1].value : this.title;
		title = getParam(params,"title",title);
		var btn=config.macros.newTiddler.createNewTiddlerButton(place,title,params,this.label,this.prompt,this.accessKey,"text",true);
		btn.setAttribute("newTemplate",this.template);
		btn.setAttribute("newText","");
	}
};
config.shadowTiddlers.SideBarOptions = "<<newClipList fields:'template:ClipListPlugin##'>>"
                                       +config.shadowTiddlers.SideBarOptions;
//}}}
/*
|~ViewToolbar|closeTiddler +editTiddler > fields syncing permalink references jump|
|~EditToolbar|+saveTiddler -cancelTiddler deleteTiddler|
drophere
!ViewTemplate
<!--{{{-->
<div class='toolbar'><span  macro='ClipList'></span><span macro='toolbar [[ClipListPlugin::ViewToolbar]]'></span></div>
<div class='title' macro='view title'></div>
<div class='subtitle'><span macro='view modifier link'></span>, <span macro='view modified date'></span> (<span macro='message views.wikified.createdPrompt'></span> <span macro='view created date'></span>)</div>
<div class='tagging' macro='tagging'></div>
<div class='tagged' macro='tags'></div>
<div class='drophere' macro='drophere'></div>
<div class='viewer' macro='view text wikified'></div>
<div class='tagClear'></div>
<!--}}}-->

!EditTemplate2
*<!--{{{-->
<div  macro='toolbar +saveTiddler -cancelMylTiddler'></div>
<div macro='annotations'></div>
<div class='editor' macro='myedit clipsrc'></div>
<!--}}}-->
!EditTemplate
<!--{{{-->
<div class='toolbar' macro='toolbar [[ToolbarCommands::EditToolbar]]'></div>
<div class='title' macro='view title'></div>
<div class='editor' macro='edit title'></div>
<div class='editor' style='display:none' macro='edit text'></div>
<div macro='annotations'></div>
<div class='editor' macro='edit tags'></div><div class='editorFooter'><span macro='message views.editor.tagPrompt'></span><span macro='tagChooser excludeLists'></span></div>
<!--}}}-->
!end
*/
