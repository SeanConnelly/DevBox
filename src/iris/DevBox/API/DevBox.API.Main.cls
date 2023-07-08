Class DevBox.API.Main Extends %CSP.REST
{

XData UrlMap
{
<Routes>
<Route Url="/ping" Method="GET" Call="Ping" />

<Route Url="/namespace/:ns/defaultUrlPath" Method="GET" Call="GetNamespaceDefaultUrlPath" />

<Route Url="/openai/completion/" Method="POST" Call="PostPromptGetCompletion" />

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

ClassMethod GetCode() As %DynamicAbstractObject
{
	set body=%request.Content.Read(%request.Content.Size)
}

ClassMethod PostPromptGetCompletion(prompt)
{
	set prompt=%request.Content.Read(3600000)
	
	//do ObjectScript code
	if ($e($zcvt(prompt,"L"),1,3)="do ")||($e($zcvt(prompt,"L"),1,6)="write ") {
		return ##class(DevBox.Assistant.CodeRunner).RunCode(prompt)
	}

	//do ObjectScript code
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
	write "copy ",pNameFrom," to ",pNameTo
	quit $$$OK
}

/// Rename Class
ClassMethod RenameClassByName(pNamespace As %String, pNameFrom As %String, pNameTo As %String) As %Status
{
	write "rename ",pNameFrom," to ",pNameTo
	quit $$$OK
}

ClassMethod CopyPackageByName(pNamespace As %String, pName As %String) As %Status
{
	write "TODO: copy package "_pName_" !"
	quit $$$OK
}

ClassMethod RenamePackageByName(pNamespace As %String, pName As %String) As %Status
{
	write "TODO:  rename package "_pName_" !"
	quit $$$OK
}

ClassMethod ExportRoutinesByPackageName(pNamespace As %String, pName As %String) As %Status
{
	write "TODO: Export routines by package name "_pName_" !"
	quit $$$OK
}

ClassMethod ExportRoutineByName(pNamespace As %String, pName As %String) As %Status
{
	write "TODO: export routine by name "_pName_" !"
	quit $$$OK
}

ClassMethod ExportWebFolderByName(pNamespace As %String, pName As %String) As %Status
{
	write "TODO: Export web folder by name "_pName_" !"
	quit $$$OK
}

ClassMethod ExportWebFileByName(pNamespace As %String, pName As %String) As %Status
{
	write "TODO: Export web file by name "_pName_" !"
	quit $$$OK
}

}

