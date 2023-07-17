Class DevBox.API.Main Extends %CSP.REST
{

XData UrlMap
{
<Routes>
<Route Url="/ping" Method="GET" Call="Ping" />

<Route Url="/namespace/:ns/defaultUrlPath" Method="GET" Call="GetNamespaceDefaultUrlPath" />

<Route Url="/openai/completion/" Method="POST" Call="PostPromptGetCompletion" />

<Route Url="/:ns/console/" Method="POST" Call="RunConsoleCommand" />
<Route Url="/:ns/download/:filePath" Method="GET" Call="DownloadFile" />
<Route Url="/:ns/upload/:folder/:file" Method="POST" Call="UploadFile" />
<Route Url="/:ns/git/:gitCommand" Method="GET" Call="RunGitCommand" />

<Route Url="/:ns/action/goto-code" Method="POST" Call="GotoCode" />

<Route Url="/:ns/action/compile/class/:name" Method="GET" Call="CompileClassByName" />

<Route Url="/:ns/action/copy/class/:from/:to" Method="GET" Call="CopyClassByName" />
<Route Url="/:ns/action/rename/class/:from/:to" Method="GET" Call="RenameClassByName" />

<Route Url="/:ns/action/copy/package/:name" Method="GET" Call="CopyPackageByName" />
<Route Url="/:ns/action/rename/package/:name" Method="GET" Call="RenamePackageByName" />

<Route Url="/:ns/action/export/package/:name" Method="GET" Call="ExportPackageByName" />
<Route Url="/:ns/action/export/class/:name" Method="GET" Call="ExportClassByName" />

<Route Url="/:ns/action/export/routines/:name" Method="GET" Call="ExportRoutinesByPackageName" />
<Route Url="/:ns/action/export/routine/:name" Method="GET" Call="ExportRoutineByName" />

<Route Url="/:ns/action/export/web-folder/:name" Method="GET" Call="ExportWebFolderByName" />
<Route Url="/:ns/action/export/web-file/:name" Method="GET" Call="ExportWebFileByName" />

<Route Url="/:ns/action/import" Method="POST" Call="ImportFile" />

</Routes>
}

ClassMethod Ping() As %DynamicAbstractObject
{
	write 1 
	quit $$$OK
}

/// write ##class(DevBox.API.Main).GetNamespaceDefaultUrlPath("Apollo")
ClassMethod GetNamespaceDefaultUrlPath(ns)
{
	set defaultUrlPath=""
	set thisNamespace=$namespace
	zn "%SYS"
	&sql(select ID
		 into :defaultUrlPath
		 from Security.Applications
		 where Namespace = :ns
		 and IsNameSpaceDefault = 1)
	zn thisNamespace		 
	write defaultUrlPath
	quit $$$OK
}

ClassMethod RunConsoleCommand(pNamespace As %String) As %Status
{
	return ##class(DevBox.API.Console).RunConsoleCommand(pNamespace)
}

ClassMethod RunGitCommand(pNamespace As %String, pGitCommand As %String) As %Status
{
	set %response.ContentType="plain/text"
	set project=$get(^DevBox.Config("git-project"))
	if project="" {
		write !,"No git project found in the global ^DevBox.Config(""git-project"") , set this to the path of your git enabled project source code"
		return $$$OK
	}
	set gitCommand=##class(%SYSTEM.Encryption).Base64Decode(pGitCommand)
	write project,"> ",gitCommand,!!
	set params($i(params))="-C"
	set params($i(params))=project
	set gitCommand=$piece(gitCommand," ",2,*)
	set string="off",chunk=""
	for i=1:1:$l(gitCommand) {
		set char=$e(gitCommand,i)
		if string="off" {
			if char="""" set string="on"
			if char=" " {
				if chunk'="" set params($i(params))=chunk
				set chunk=""
			} else {
				if char'="""" set chunk=chunk_char
			}
		} else {
			if char="""" {
				set string="off"
				if chunk'="" set params($i(params))=chunk
				set chunk=""
			} else {
				set chunk=chunk_char
			}
		}
	}
	if chunk'="" set params($i(params))=chunk

	set command="git"
	
	do ##class(DevBox.API.Console).ShellCommandAndOutputToHttpResponse(command,.params)

	//zw params

	return $$$OK
}

ClassMethod UploadFile(pNamespace As %String, pFolder As %String, pFileName As %String) As %Status
{
	set pFolder=##class(%SYSTEM.Encryption).Base64Decode(pFolder)
	set pFileName=##class(%SYSTEM.Encryption).Base64Decode(pFileName)
	set fileDel=$select($zversion(1)=2:"\",1:"/")
	if $e(pFolder,*)'=fileDel set pFolder=pFolder_fileDel
	set filePath=pFolder_pFileName
    try {
		set file=##class(%Stream.FileBinary).%New()
		do file.LinkToFile(filePath)
		do file.CopyFrom(%request.Content)
		set sc=file.%Save()
		if $$$ISOK(sc) write !,"Successfully upload file to ",filePath
    } catch ex {
		write !,"Failed to upload file to ",filePath
		write !
		do ex.OutputToDevice()
		write !
		return $$$OK
    }
	if $$$ISERR(sc)	write !,"Failed to upload file to ",filePath," ("_$System.Status.GetOneErrorText(sc)_")"
	quit $$$OK
}

ClassMethod DownloadFile(pNamespace As %String, pFilePath As %String)
{
	set pFilePath=##class(%SYSTEM.Encryption).Base64Decode(pFilePath)
	set fileDel=$select($zversion(1)=2:"\",1:"/")
	set fileName=$piece(pFilePath,fileDel,*)
	set fileExtension=$piece(pFilePath,".",*)
	set contentType=##class(DevBox.API.Console).GetContentTypeForFileExtension(fileExtension)
	set %response.ContentType=contentType
	do %response.SetHeader("Content-Disposition","attachment;filename="""_fileName_"""")
	set %response.NoCharSetConvert=1
	set %response.Headers("Access-Control-Allow-Origin")="*"
	set file=##class(%Stream.FileCharacter).%New()
	do file.LinkToFile(pFilePath)
	do file.OutputToDevice()
	set file=""
	return $$$OK
}

ClassMethod PostPromptGetCompletion(prompt)
{
	set prompt=%request.Content.Read(3600000)
	
	//do ObjectScript code
	if ($e($zcvt(prompt,"L"),1,3)="do ")||($e($zcvt(prompt,"L"),1,6)="write ") {
		return ##class(DevBox.Assistant.CodeRunner).RunCode(prompt)
	}

	//do SQL
	if $e($zcvt(prompt,"L"),1,7)="select " {
		return ##class(DevBox.Assistant.CodeRunner).RunSQL(prompt)
	}

	//get GPT completion
	set completion=##class(DevBox.OpenAI.Completions).getCompletion(prompt)
	write completion
	return $$$OK
}

ClassMethod ImportFile(pNamespace As %String) As %Status
{
	zn pNamespace
	set sc=##class(%SYSTEM.OBJ).LoadStream(%request.Content)
	quit sc
}

ClassMethod ExportClassByName(pNamespace As %String, pName As %String) As %Status
{
	zn pNamespace
    set %response.ContentType="application/xml"
    do %response.SetHeader("Content-Disposition","attachment;filename="""_pName_"_"_$zd($h,8)_$tr($zt($p($h,",",2)),":")_".xml""")
    set %response.NoCharSetConvert=1
	set %response.Headers("Access-Control-Allow-Origin")="*"
	do ##class(%SYSTEM.OBJ).Export(pName)
	quit $$$OK
}

/// Export Class Package
ClassMethod ExportPackageByName(pNamespace As %String, pName As %String) As %Status
{
	zn pNamespace
    set %response.ContentType="application/xml"
    do %response.SetHeader("Content-Disposition","attachment;filename="""_pName_"_ALL_"_$zd($h,8)_$tr($zt($p($h,",",2)),":")_".xml""")
    set %response.NoCharSetConvert=1
	set %response.Headers("Access-Control-Allow-Origin")="*"
	do ##class(%SYSTEM.OBJ).Export(pName_".*.cls")
	quit $$$OK
}

/// Copy Class
ClassMethod CopyClassByName(pNamespace As %String, pNameFrom As %String, pNameTo As %String) As %Status
{
	zn pNamespace
	write "copy ",pNameFrom," to ",pNameTo
	quit $$$OK
}

/// Rename Class
ClassMethod RenameClassByName(pNamespace As %String, pNameFrom As %String, pNameTo As %String) As %Status
{
	zn pNamespace
	write "rename ",pNameFrom," to ",pNameTo
	quit $$$OK
}

ClassMethod CopyPackageByName(pNamespace As %String, pName As %String) As %Status
{
	zn pNamespace
	write "TODO: copy package "_pName_" !"
	quit $$$OK
}

ClassMethod RenamePackageByName(pNamespace As %String, pName As %String) As %Status
{
	zn pNamespace
	write "TODO:  rename package "_pName_" !"
	quit $$$OK
}

ClassMethod ExportRoutinesByPackageName(pNamespace As %String, pName As %String) As %Status
{
	zn pNamespace
	write "TODO: Export routines by package name "_pName_" !"
	quit $$$OK
}

ClassMethod ExportRoutineByName(pNamespace As %String, pName As %String) As %Status
{
	zn pNamespace
	write "TODO: export routine by name "_pName_" !"
	quit $$$OK
}

ClassMethod ExportWebFolderByName(pNamespace As %String, pName As %String) As %Status
{
	zn pNamespace
	write "TODO: Export web folder by name "_pName_" !"
	quit $$$OK
}

ClassMethod ExportWebFileByName(pNamespace As %String, pName As %String) As %Status
{
	zn pNamespace
	write "TODO: Export web file by name "_pName_" !"
	quit $$$OK
}

}

