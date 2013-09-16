/***
|Name:|RestictBackupFilesPlugin|
|Description:|Limits number of backup files to one per Day|
|Version:|1.0|
|Date:|7-June-2013|
|Source:||
|Author:|BuggyJay|
|Email:|BuggyJeff@gmail.com|
|License:|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]||

!!Description
limit the number of backup files to one a day.
uses the configOptionsMacro to control option chkDailyBackUp
you need to copy to the ConfigOptions tiddler
{{{chkOneADayBackUpFile=true}}}
!-- this is not a 'release quality plugin'

***/
//{{{
//this can be easily extended to 'once' a month, 
//also one a quater month (7+7+8+8) daily intevals -YYYYMM+Q1-4, or weekly -  YYYYW+ week no. 
//(7778) for feb leap year - no need for logic - if feb just subtract 21!
window.getSpecialBackupPath = function(localPath) {
	var slash = "\\";
	var dirPathPos = localPath.lastIndexOf("\\");
	if(dirPathPos == -1) {
		dirPathPos = localPath.lastIndexOf("/");
		slash = "/";
	}
	var backupFolder = config.options.txtBackupFolder;
	if(!backupFolder || backupFolder == "")
		backupFolder = ".";
	var backupPath = localPath.substr(0,dirPathPos) + slash + backupFolder + localPath.substr(dirPathPos);
	backupPath = backupPath.substr(0,backupPath.lastIndexOf(".")) + ".";
        if (config.options.chkOneADayBackUpFile==true)
	        backupPath += (new Date()).convertToYYYYMMDDHHMMSSMMM().replace (/(.*)\.(.*)/,"$1") + "." + "html";
        else 
	        backupPath += (new Date()).convertToYYYYMMDDHHMMSSMMM() + "." + "html";

	return backupPath;
}

// hijack the core function
window.getBackupPath_orig = window.getBackupPath;
window.getBackupPath = function(localPath,title,extension) {
	return getSpecialBackupPath(localPath);

}

//}}}

