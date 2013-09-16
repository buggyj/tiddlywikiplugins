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
version.extensions.ClipListPlugin= {major: 1, minor: 1, revision: 1, date: new Date(2013,09,15)};

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
    if (!!tiddler.fields.countx) {//only in our list tiddlers
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
		var tiddom=story.findContainingTiddler(place);
		tiddom.cliplist_savedOnClick=document.onclick;


		tiddom.onclick=function(ev) { 
			if (!ev) var ev=window.event; var target=resolveTarget(ev);
					
			if (tiddom.cliplist_savedOnClick)
				var retval=tiddom.cliplist_savedOnClick.apply(this,arguments);
			// if click was inside a popup... leave soliton panels alone
			var p=target; while (p) if (hasClass(p,"popup")) break; else p=p.parentNode;
			if (p) return retval;
			// if click was inside soliton panel (or something contained by a soliton panel), leave it alone
			var p=target; while (p) {
				if ((hasClass(p,"sliderPanel"))&&p.getAttribute("soliton")=="true") break;
				p=p.parentNode;
			}
			if (p) return retval;
			// otherwise, find and close all soliton panels...
			var all=tiddom.getElementsByTagName("DIV");
			for (var i=0; i<all.length; i++) {
				 // if it is not a soliton panel, or the click was on the button that opened this panel, don't close it.
				if (all[i].getAttribute("soliton")!="true" || all[i].button==target) continue;
				// otherwise, if the panel is currently visible, close it by clicking it's button
				if (all[i].style.display!="none") window.onClickClipList({target:all[i].button})
				if (!hasClass(all[i],"sliderPanel")) all[i].style.display="none";
			}
			return retval;
		};
	}
}
//}}}
//{{{

config.formatters.push( {
	name: "ClipList",
	match: "\\n?\\Ꮬ{2}",
	terminator: "\\s*\\Ꮻ{3}\\n?",
	lookahead: "\\n?\\Ꮬ{2}(\\Ꮬ{2})?(\\*)?(\\@)?(\\[[^\\]]*\\])?\\s*",
	handler: function(w)
		{
			lookaheadRegExp = new RegExp(this.lookahead,"mg");
			lookaheadRegExp.lastIndex = w.matchStart;			//alert(w.tiddler.text.substring(w.matchStart,w.matchStart+20)+w.source.substring(w.matchStart,w.matchStart+20));
			var lookaheadMatch = lookaheadRegExp.exec(w.source)
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

				// render slider 
				w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
moan=true;
				w.subWikify(panel,this.match);
moan=false

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
	while (theTarget && theTarget.sliderPanel==undefined) theTarget=theTarget.parentNode;
	if (!theTarget) return false;
	var theSlider = theTarget.sliderPanel;
	var isOpen = theSlider.style.display!="none";

	// if SHIFT-CLICK, dock panel first (see [[MoveablePanelPlugin]])
	if (e.shiftKey && config.macros.moveablePanel) config.macros.moveablePanel.dock(theSlider,e);

	// show/hide the slider
	if(config.options.chkAnimate )//&& (!hasClass(theSlider,'floatingPanel') || config.options.chkFloatingSlidersAnimate))
		anim.startAnimating(new Slider(theSlider,!isOpen,e.shiftKey || e.altKey,"none"));
	else
		theSlider.style.display = isOpen ? "none" : "block";
		
    // if showing panel, set focus to first 'focus-able' element in panel
	if (theSlider.style.display!="none") {
		var ctrls=theSlider.getElementsByTagName("*");
		for (var c=0; c<ctrls.length; c++) {
			var t=ctrls[c].tagName.toLowerCase();
			if ((t=="input" && ctrls[c].type!="hidden") || t=="textarea" || t=="select")
				{ try{ ctrls[c].focus(); } catch(err){;} break; }
		}
	}

	if (e.shiftKey || theTarget!=resolveTarget(e))
		{ e.cancelBubble=true; if (e.stopPropagation) e.stopPropagation(); }
	Popup.remove(); // close open popup (if any)
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

