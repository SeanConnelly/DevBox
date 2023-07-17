Class DevBox.API.Console Extends %RegisteredObject
{

ClassMethod RunConsoleCommand(pNamespace As %String)
{
	set params=""
	set code=%request.Content.Read(3600000)

	if $e(code,1,3)="sql" {
		return ##class(DevBox.Assistant.CodeRunner).RunSQL(pNamespace,$e(code,4,*))

	} elseif (($e(code,1,2)="ls")||($e(code,1,3)="dir")) {
		set params(1)=$piece(code," ",2,*)
		set command=$select($zversion(1)=2:"dir",1:"ls")
		return ..ShellCommandAndOutputToHttpResponse(command,.params)
		
	} else {
		return ##class(DevBox.Assistant.CodeRunner).RunCode(pNamespace,code)
	}
}

ClassMethod GetContentTypeForFileExtension(pFileExtension)
{
    if pFileExtension="text" return "text/plain"
    if pFileExtension="html" return "text/html"
    if pFileExtension="css" return "text/css"
    if pFileExtension="js" return "application/javascript"
    if pFileExtension="json" return "application/json"
    if pFileExtension="xml" return "application/xml"
    if pFileExtension="pdf" return "application/pdf"
    if pFileExtension="jpg" return "image/jpeg"
    if pFileExtension="png" return "image/png"
    if pFileExtension="gif" return "image/gif"
    if pFileExtension="mp3" return "audio/mpeg"
    if pFileExtension="mp4" return "video/mp4"
    if pFileExtension="zip" return "application/zip"
    if pFileExtension="tar" return "application/x-tar"
    if pFileExtension="gz" return "application/gzip"
    if pFileExtension="csv" return "text/csv"
    if pFileExtension="xls" return "application/vnd.ms-excel"
    if pFileExtension="xlsx" return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    if pFileExtension="doc" return "application/msword"
    if pFileExtension="docx" return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    return "application/octet-stream"
}

ClassMethod ShellCommandAndOutputToHttpResponse(pCommand As %String, ByRef pParams, forceNoQuote = 0)
{
	set %response.ContentType="plain/text"
	//create temp file and write dir output to it
	set tmpfilename="devbox-stdout-"_$job_".txt"
	set errFilename="devbox-stderr-"_$job_".txt"
	set noQuote=$select(forceNoQuote:" /NOQUOTE",1:"")
	set oik=$zf(-100,"/SHELL /STDERR="_errFilename_" /STDOUT="_tmpfilename_noQuote,pCommand,.pParams)
	if oik=0 {
		set file=##class(%Stream.FileCharacter).%New()
		do file.LinkToFile(tmpfilename)
		do file.OutputToDevice()
		set file=""
	} else {
		write !,"Falied to run command on server (Error code ",oik,")"
		write !,"Command = ",pCommand
		write !,"Params = ",!
		zwrite pParams
		write !,"Displaying the contents of STDERR",!
		set file=##class(%Stream.FileCharacter).%New()
		do file.LinkToFile(errFilename)
		do file.OutputToDevice()
		set file=""		
	}
	//remove temp file
	set sc=##class(%File).Delete(tmpfilename)
	set sc=##class(%File).Delete(errFilename)
	return $$$OK
}

}

