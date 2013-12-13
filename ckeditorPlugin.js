|Name|ckeditorplugin|
|Version|1.0|
|Author|BJ|
|Date:|12-12-2013|
|License|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|Type|plugin|
|Overrides||
|CoreVersions|2.6|

!!!!!Configuration
<<<
for real wysiwyg, you can set this option (requires moonodiv skin) :
><<option chkNotWysiwyg>> real wysiwyg
which can also be 'hard coded' into your document by adding the following to a tiddler, tagged with <<tag systemConfig>>
>{{{config.options.chkNotWysiwyg=true;}}}
<<<
!!!!!Code
***/
/*{{{*/
if (typeof CKEDITOR != 'undefined')   {
//CKEDITOR.config.bodyClass = 'contents';
//CKEDITOR.config.stylesSet = false;
config.stylesSet = [
    { name: 'Strong Emphasis', element: 'h1', styles: { 'color': 'Blue' } }]
CKEDITOR.stylesSet.add( 'default', [
    // Block Styles
    { name: 'Blue Title',       element: 'h3',      styles: { 'color': 'Blue' } },
    { name: 'Red Title',        element: 'h3',      styles: { 'color': 'Red' } },

    // Inline Styles
    { name: 'Marker: Yellow',   element: 'span',    styles: { 'background-color': 'Yellow'} },
    { name: 'Marker: Green',    element: 'span',    styles: { 'background-color': 'Lime' } },

    // Object Styles
    {
        name: 'Image on Left',
        element: 'img',
        attributes: {
            style: 'padding: 5px; margin-right: 5px',
            border: '2',
            align: 'left'
        }
    }
] );
	CKEDITOR.on( 'instanceReady', function( ev ) {

	var blockTags = ['div','h1','h2','h3','h4','h5','h6','p','pre','ul','li','br'];
	var rules = {
	indent : false,
	breakBeforeOpen : false,
	breakAfterOpen : false,
	breakBeforeClose : false,
	breakAfterClose : false
	};

	for (var i=0; i<blockTags.length; i++) {
	ev.editor.dataProcessor.writer.setRules( blockTags[i], rules );
	}


	});
}

config.macros.ckeditor={};
Story.prototype.notckeditor={};
Story.prototype.notckeditor.gatherSaveFields=Story.prototype.gatherSaveFields;

Story.prototype.gatherSaveFields = function(e,fields)
{
	function replacelinebreakshtml(text) {
		//unfortunately ckeditor still puts in some line breaks inspite of being told not too
		var segments = text.split(/(\<\/?pre\>)/);
		var result = '';
		for (var i = 0; i <segments.length; i++){
			if (i %4 ==2) result += segments[i];//leave preformatted text in peace
			else result +=segments[i].replace(/(\r\n|\n|\r)/gm,"");
		}
		return result;
	}
	if(e && e.getAttribute) {
		var tiddom=story.findContainingTiddler(e);
		var tid =store.getTiddler(tiddom.getAttribute("tiddler"));

		if  (!tid || !tid.isTagged("CKEditor"))
			return Story.prototype.notckeditor.gatherSaveFields(e,fields);
		   
		var f = e.getAttribute("edit");
		if(f) {
			var g = e.getAttribute("name");
			if (!!g) {
				fields[f]="<html>"+replacelinebreakshtml(CKEDITOR.instances[g].getData())+"</html>" ;
			}
			else
				fields[f] = e.value.replace(/\r/mg,"");
		}
		if(e.hasChildNodes()) {
			var t,c = e.childNodes;
			for(t=0; t<c.length; t++)
				this.gatherSaveFields(c[t],fields);
		}
	}
};


config.macros.edit.notckeditor={};
config.macros.edit.notckeditor.handler=config.macros.edit.handler;
config.macros.edit.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{

	var field = params[0];
	var rows = params[1] || 0;
	var defVal = params[2] || '';
	if((tiddler instanceof Tiddler) && field) {
		if (tiddler.tags.length==0 || !tiddler.isTagged("CKEditor")) 
			return config.macros.edit.notckeditor.handler(place,macroName,params,wikifier,paramString,tiddler);
		else if (window['CKEDITOR'] ==undefined) {alert ("CKEDITOR not available");
return config.macros.edit.notckeditor.handler(place,macroName,params,wikifier,paramString,tiddler);
}
		story.setDirty(tiddler.title,true);
		var e,v;
		if(field != "text" && !rows) {
			e = createTiddlyElement(null,"input",null,null,null,{
				type: "text", edit: field, size: "40", autocomplete: "off"
			});
			e.value = store.getValue(tiddler,field) || defVal;
			place.appendChild(e);
		} else {
			var wrapper1 = createTiddlyElement(null,"fieldset",null,"viewer");
			var wrapper2 = createTiddlyElement(wrapper1,"div");
			e = createTiddlyElement(wrapper2,"textarea");
			e.value = v = store.getValue(tiddler,field) || defVal;
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
	}
};


if (tiddler.tags.length==0 || tiddler.tags[0].slice(0,6) != "system") { //PJ
  e.setAttribute("id","editorBody"+tiddler.title);
  initEditor("editorBody"+tiddler.title);
}
/*}}}*/
