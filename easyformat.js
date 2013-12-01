/***
|Name|EasyFormattingPlugin|
|Version|1.0|
|Author|BJ|
|License|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|Type|plugin|
!Description
allows literal styles within the block formatting 
***/
/*{{{*/
if (config.macros.easyFormatting==undefined) {
	 config.macros.easyFormatting= { };


	// find the formatter for "prettyLink" and replace the handler
	for (var i=0; i<config.formatters.length && config.formatters[i].name!="customFormat"; i++);
	if (i<config.formatters.length)	{
		config.formatters[i].handler=function(w) {

			switch(w.matchText) {
			case "@@":
				var e = createTiddlyElement(w.output,"span");
				var styles = config.formatterHelpers.inlineCssHelper(w);
				if(styles.length == 0)
					e.className = "marked";
				else
					config.formatterHelpers.applyCssHelper(e,styles);
				w.subWikifyTerm(e,/(@@)/mg);
				break;
			case "{{":
				var lookaheadRegExp = /\{\{[\s]*([\w":;-]+[\s\w":;-]*)[\s]*\{(\n?)/mg;
				lookaheadRegExp.lastIndex = w.matchStart;
				var lookaheadMatch = lookaheadRegExp.exec(w.source);
				var  classlist = '', attrlist ='';
				if(lookaheadMatch) {
					w.nextMatch = lookaheadRegExp.lastIndex;
					var list = lookaheadMatch[1].split('"');
					if(!list ||list.length<2 ) {
						w.nextMatch = lookaheadRegExp.lastIndex;
						e = createTiddlyElement(w.output,lookaheadMatch[2] == "\n" ? "div" : "span",null,lookaheadMatch[1]);
						w.subWikifyTerm(e,/(\}\}\})/mg);
						break;
					}
					var style, align = null, temp = list[1].split('align:');
					if (temp.length > 1){ 
						var part1 =temp[0].length;
						style= temp[0]; //part upto first align
						switch (temp[1].substring(0,4)) {
							case 'left': align = 'left'; style += list[1].substring(part1+11, list[1].length); break;
							case 'righ': align = 'right'; style += list[1].substring(part1+12, list[1].length); break;
							case 'cent': align = 'center'; style += list[1].substring(part1+13, list[1].length); break;						
							case 'just': align = 'justify'; style += list[1].substring(part1+14, list[1].length); break;						
						}
					} else style = list[1];
					//alert (align+' '+style+' '+temp[1]);	
					if (!!align)			     
						e = createTiddlyElement(w.output,lookaheadMatch[2] == "\n" ? "div" : "span",null,list[0],null,{align:align,style:style});
					else
						e = createTiddlyElement(w.output,lookaheadMatch[2] == "\n" ? "div" : "span",null,list[0],null,{style:style});
					
					w.subWikifyTerm(e,/(\}\}\})/mg);
				}
				break;
			}
		}
	} // if "prettyLink" formatter found
	this.initialized=true;
}
/*}}}*/
