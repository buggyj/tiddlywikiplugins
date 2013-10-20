/***
|Name:|AddTagsPlugin|
|Version:|1.0|
|Date:|7-June-2013|
|Source:||
|Author:|BuggyJay|
|Email:|BuggyJay@gmail.com|
|License:|BSD|
!!Description
comand version of add tags - no need to edit tiddler
***/
/*{{{*/
config.commands.addTag={type: "popup"};
config.commands.addTag.handlePopup = function(popup,titleOrig)
{
function clickHere2(ev)
{
var tag =this.getAttribute("tag");
alert(titleOrig);
                var tiddler = store.getTiddler(titleOrig);
		tiddler.tags.push(tag);
		tiddler = store.saveTiddler(tiddler);
			autoSaveChanges();//? is this needed
};

	var tags = store.getTags();
	var ul = createTiddlyElement(popup,"ul");
      
	if(tags.length == 0){alert ("0");
		createTiddlyElement(ul,"li",null,"listTitle");}
	var t;
	for(t=0; t<tags.length; t++) {
		var title = tags[t][0];
		var info = getTiddlyLinkInfo(title);
		var li = createTiddlyElement(ul,"li");
		var btn = createTiddlyButton(li,title,"fillin",clickHere2,info.classes);
		btn.setAttribute("tag",title);
		btn.setAttribute("refresh","link");
		btn.setAttribute("tiddlyLink",title);

		}

};

merge(config.commands.addTag,{
	text: "addTag",
	tooltip: "add tag to tiddler"});


/*}}}*/
