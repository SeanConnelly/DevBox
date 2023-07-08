Class DevBox.Lib.JSON.ObjectSerializer Extends %RegisteredObject
{

ClassMethod ToJSON(object, stream As %Stream = "", ByRef options, ByRef seen)
{
	do ..serialise(object,.stream,.options,.seen)
	if $g(options("format"))=1 {
		set formatter=##class(%JSON.Formatter).%New()
		do formatter.FormatToStream(##class(%DynamicAbstractObject).%FromJSON(stream.Read(stream.Size)),.stream)
	}
}

ClassMethod serialise(object, ByRef stream = "", ByRef options, ByRef seen = "")
{
	if stream="" set stream=##class(%Stream.TmpCharacter).%New(),returnStream=1
	if $g(seen(object))=1 do stream.Write("{}") quit stream
	set seen(object)=1
	if $g(options("parent"))'="" do stream.Write("{"""_options("parent")_""":")
	do stream.Write("{")
	set sql($i(sql))="select Name, RuntimeType, Type, MultiDimensional, Internal, Private"
	set sql($i(sql))="from %Dictionary.CompiledProperty"
	set sql($i(sql))="where parent='"_$CLASSNAME(object)_"' and NOT Name [ '%'"
	set statement = ##class(%SQL.Statement).%New()
	set sc=statement.%Prepare(.sql)
	set rs=statement.%Execute()	
	set co="",cc=0
	while rs.%Next()
	{	
		if (rs.%Get("Internal")=1)!(rs.%Get("Private")=1) continue	
		set (name,pname)=rs.%Get("Name")
		if $data(options("rename",pname)) set pname=options("rename",pname)
		set runtimeType=rs.%Get("RuntimeType")
		set type=rs.%Get("Type")
		if $data(ignore(name)) continue
		if $e(name)'?1A continue
		if runtimeType="%Library.RelationshipObject" continue
		if rs.%Get("MultiDimensional")=1 {
			set c2=""
			set key=""
			set %ref="object."_name
			set key=$order(@%ref@(key))
			if (key=""),($get(options("skip-empty"))=1) continue
			do stream.Write(co_""""_pname_""":{")
			while key'=""
			{
				try {
					set value=$property(object,name,key)
					do stream.Write(c2_""""_key_""""_":")
					do stream.Write(""""_..EscapeJSON(value)_"""")
					set c2=","
				} catch err {
					
				}
				set key=$order(@%ref@(key))
			}
			do stream.Write("}")
			set co=","
			continue	
		}
		
		if "%Collection.ArrayOfDT"=runtimeType {
			set c2="",p=$property(object,name),key=$method(p,"Next","")
			if (key=""),($get(options("skip-empty"))=1) continue
			do stream.Write(co_""""_pname_""":{")
			while key'="" {
				set value=$method(p,"GetAt",key)
				do stream.Write(c2_""""_key_""""_":"_$s(value=$c(0):"null",1:..normalize(type,value,0,.seen,.options)))
				set key=$method(p,"Next",key),c2=","
			}
			do stream.Write("}")
			set co=","
			continue						
		}
		if "%Collection.ArrayOfObj"=runtimeType {
			set c2="",p=$property(object,name),key=$method(p,"Next","")
			if (key=""),($get(options("skip-empty"))=1) continue
			do stream.Write(co_""""_pname_""":{")
			while key'="" {
				set o=$method(p,"GetAt",key)
				do stream.Write(c2_""""_key_""":")
				do ..serialise(o,.stream,.options,.seen)
				set key=$method(p,"Next",key),c2=","
			}
			do stream.Write("}")
			set co=","
			continue					
		}
		if "%Collection.ListOfDT"=runtimeType {
			set c2="",p=$property(object,name)
			set size=$method(p,"Count")
			if (size=0),($get(options("skip-empty"))=1) continue
			do stream.Write(co_""""_pname_""":[")
			for i=1:1:size {
				set value=$method(p,"GetAt",i)
				do stream.Write(c2_$s(value=$c(0):"null",1:..normalize(type,value,0,.seen,.options)))
				set c2=","
			}
			do stream.Write("]")
			set co=","
			continue					
		}
		if "%Collection.ListOfObj"=runtimeType {
			set c2="",p=$property(object,name)
			set size=$method(p,"Count")
			if (size=0),($get(options("skip-empty"))=1) continue
			do stream.Write(co_""""_pname_""":[")
			for i=1:1:size {
				set obj=$method(p,"GetAt",i)
				do stream.Write(c2)
				do ..serialise(obj,.stream,.options,.seen)
				set c2=","
			}
			do stream.Write("]")
			set co=","
			continue					
		}
		if "%Library"=$piece(runtimeType,"."),runtimeType["Stream" {
			set p=$property(object,name)
			if (p=""),($get(options("skip-empty"))=1) continue
			do stream.Write(co_""""_pname_""":""")
			do $method(p,"Rewind")
			if runtimeType["Binary" {
				while p.AtEnd=0 { do stream.Write($system.Encryption.Base64Encode(p.Read(57))) }
			} else {
				while p.AtEnd=0 { do stream.Write(..EscapeJSON(p.Read(1000))) }
			}
			do stream.Write("""")
			set co=","
			continue
		}
		if $IsObject($property(object,name)) {
			set obj=$property(object,name)
			if (obj=""),($get(options("skip-empty"))=1) continue
			do stream.Write(co_""""_pname_""":")
			do ..serialise(obj,.stream,.options,.seen)
			set co=","
			continue
		}
		set value=$property(object,name)
		if (value=""),($get(options("skip-empty"))=1) continue
		do stream.Write(co_""""_pname_""":")
		set value=$select(value=$c(0):"null",1:..normalize(type,value,2,.options,.stream))
		do stream.Write(value)
		set co=","
	}
	do stream.Write("}")
	if $g(options("parent"))'="" do stream.Write("}")
	kill seen(object)
	quit $select($get(returnStream)=1:stream,1:"")
}

ClassMethod normalize(type, value, mode = 0, ByRef seen, ByRef options, ByRef stream) [ Internal ]
{
	if "Cogs.Lib.Types.Json"=type q $Select(value'="":value,1:"""""")
	if "%Library.Time"=type q $s(value'="":""""_$zt(value)_"""",1:"null")
	if "%Library.Date"=type q $s(value'="":""""_$zd(value,3)_"""",1:"null")
	if "%Library.TimeStamp"=type q $s(value'="":""""_$tr(value," ","T")_"Z""",1:"null")	
	if "%Library.Boolean"=type q $s(value=1:"true",value=0:"false",1:"null")
	if "%Library.Float %Library.Integer %Library.Numeric %Library.Currency"[type q $s($e(value,1,2)="0.":value,$e(value,1)=".":"0"_value,value'="":+value,1:"null")
	if "%"=$e(type) q """"_..EscapeJSON(value)_""""
	quit $s($IsObject(value):..serialise(value,.stream,.options,.seen),value="":$C(34,34),1:""""_..EscapeJSON(value)_"""")
}

ClassMethod EscapeJSON(string As %String, escapeSolidus As %Boolean = 0) As %String
{
	quit $zcvt(string,"O","JSON")
}

}

