/***
|Name:|SimplyLessBackupsPlugin|
|Version:|1.0|
|Date:|7-June-2013|
|Source:||
|Author:|BuggyJay|
|Email:|BuggyJay@gmail.com|
|License:|BSD|
!!Description
limit the number of backup files to one a day.

set:<<option chkOneADayBackUpFile>>

***/
//{{{

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

