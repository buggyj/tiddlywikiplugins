<<tiddler [[CreateListOfTips##Res]] with:{{ (function() {

var dummy = createTiddlyElement(null,"div",null,null);
wikify(store.getTiddlerText("$1"),dummy,null,null);

var stn='';
var col =dummy.getElementsByClassName("$2");
for (var i=0;i< col.length;i++)
{

var node =col[i];
stn +='|'+node.getAttribute("$3")+'|'+ node.innerHTML+'|\n';
}
delete dummy;
return(stn);


}
)()}}>>

/%
{{{
!Res
$1
!end
}}}
%/
