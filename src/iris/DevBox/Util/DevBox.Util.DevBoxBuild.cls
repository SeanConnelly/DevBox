Class DevBox.Util.DevBoxBuild Extends %RegisteredObject
{

Parameter ROOT = "E:\Projects\DevBox\src\iris\";

/// do ##class(DevBox.Util.DevBoxBuild).Build()
/// Build method specific to Seans environment
ClassMethod Build()
{
    write $system.OBJ.Export("DevBox*.CLS","E:\Projects\DevBox\build\DevBox.xml")
    set status = $zf(-1, "powershell Compress-Archive -Path E:\Projects\DevBox\src\web\* -DestinationPath E:\Projects\DevBox\build\DevBoxWebFiles.zip")
}

/// do ##class(DevBox.Util.DevBoxBuild).Export()
ClassMethod Export()
{
    set statement=##class(%SQL.Statement).%New()
    set sc=statement.%Prepare("SELECT Name FROM %Dictionary.CompiledClass WHERE ID LIKE 'DevBox%'") 
    if $$$ISERR(sc) write !,$SYSTEM.Status.GetOneErrorText(sc) quit
    set rs=statement.%Execute()
    while rs.%Next() {
        set name=rs.%Get("Name")
        set sc=..ExportClass(name,..#ROOT)
    }
}

ClassMethod ExportClass(pClassName As %String, pRootFolder As %String)
{
	set del=$s($zv["Windows":"\",1:"/")
	set fileFolder=pRootFolder_del_$tr($p(pClassName,".",1,$l(pClassName,".")-1),".",del)_del
	set fileName=fileFolder_pClassName_".cls"
	set sc=##class(%File).CreateDirectoryChain(fileFolder)
	quit ##class(%Compiler.UDL.TextServices).GetTextAsFile(,pClassName,fileName)
}

}

