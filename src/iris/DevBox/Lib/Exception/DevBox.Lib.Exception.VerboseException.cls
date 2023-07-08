Class DevBox.Lib.Exception.VerboseException Extends %RegisteredObject
{

ClassMethod MakeVerboseExceptionAsJsonString() As %String
{
    set jsonString=""
	try {
		set status={}
		set status.Error=$zerror
		set status.Source=##class(Cogs.Lib.Dictionary).GetRoutineCodeForLineLabel($Piece($Piece($zerror,">",2)," "))
        set status.Stack=[]
        set status.Objects={}
        set status.Primatives={}
		for i=1:1:$stack-1 do status.Stack.%Set(i,$stack(i,"PLACE")_" : "_$zstrip($stack(i, "MCODE"),"<W"))
		set level=$ZU(41)-2
		set var=$zu(42,level,"~")
		while var'="" {
			set name=$p(var,"~",2)
			set item=$zu(43,level,var)
			if $data(item),item'["%Exception.SystemException" {
				if $IsObject(item) {
					do ##class(DevBox.Lib.JSON.ObjectSerializer).ToJSON(item,.jsonStream)
					set object={}.%FromJSON(jsonStream.Read(jsonStream.Size))
					do status.Objects.%Set(name,object)
				} else {
					do status.Primatives.%Set(name,item)
				}
			}
			set var=$zu(42,level,var)
		}
		set jsonString=status.%ToJSON()
	} catch err {
        write !,"Error: ",err.DisplayString()
    }
	quit jsonString
}

}

