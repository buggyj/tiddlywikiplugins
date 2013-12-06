/***
|Name|EasyFormattingPlugin|
|Version|1.0|
|Date:|27-11-2013|
|Source:||
|CoreVersion|2.4.3|
|Author:|BJ|
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
				var  classlist = '', attrlist ='';
	
					var lookaheadRegExp = /\{\{("?)[\s]*([\w]+[\s\w-:;#%]*)[\s]*"?\{(\n?)/mg;
					lookaheadRegExp.lastIndex = w.matchStart;
					var lookaheadMatch = lookaheadRegExp.exec(w.source);
					if(lookaheadMatch) {
						w.nextMatch = lookaheadRegExp.lastIndex;
						var e;
						if (!!lookaheadMatch[1])
							e = createTiddlyElement(w.output,lookaheadMatch[3] == "\n" ? "div" : "span",null,null,null,{style:lookaheadMatch[2]});
						else
							e = createTiddlyElement(w.output,lookaheadMatch[3] == "\n" ? "div" : "span",null,lookaheadMatch[2]);
						w.subWikifyTerm(e,/(\}\}\})/mg);
					}

				break;
			}
		}
	} // if "prettyLink" formatter found
	this.initialized=true;
}

/*}}}*/
