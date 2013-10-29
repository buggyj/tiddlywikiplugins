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
var tiddler = store.getTiddler(titleOrig);
function clickHere2(ev)
{
	var tag =this.getAttribute("tag");

	var pos =tiddler.tags.indexOf(tag);
	if (pos == -1)
		tiddler.tags.push(tag);
	else tiddler.tags.splice(pos,1);
		tiddler = store.saveTiddler(tiddler);
	autoSaveChanges();
};

	var tags = store.getTags();
	if(tags.length == 0) return; //nothing to add or remove
wikify("Tags:<br><hr>",popup,null,null);
	var ul = createTiddlyElement(popup,"ul","","popupMessage");
	for(t=0; t<tags.length; t++) {

		var title = tags[t][0];

		var info = getTiddlyLinkInfo(title);
                if (tiddler.isTagged(title)) {    
		var li = createTiddlyElement(ul,"li",null,"highlight",null,{style:"list-style:none;"});
		var btn = createTiddlyButton(li,title,"remove",clickHere2);
                } else {
		var li = createTiddlyElement(ul,"li",null,"",null,{style:"list-style:none;"});
		var btn = createTiddlyButton(li,title,"add",clickHere2);
                } 
		btn.setAttribute("tag",title);
		btn.setAttribute("refresh","link");
		btn.setAttribute("tiddlyLink",title);

		}
};
merge(config.commands.addTag,{
	text: "changeTags",
	tooltip: "add/remove tiddlerTag"});
/*}}}*/
