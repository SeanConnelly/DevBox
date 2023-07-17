Class DevBox.Assistant.CodeRunner Extends %RegisteredObject
{

ClassMethod RunCode(namespace, code)
{
    zn namespace
    try {
        if $e(code,1,2)="zj" {
            set code="() set temp="_$p(code," ",2,*)_" quit temp"
            set temp=$xecute(code)
            if $IsObject(temp) {
                do ##class(DevBox.Lib.JSON.ObjectSerializer).ToJSON(temp,.json)
                set %response.ContentType="application/json"
                do json.OutputToDevice()
            } else {
                set %response.ContentType="plain/text"
                zwrite temp
            }
        } else {
            set %response.ContentType="plain/text"
            xecute code
        }
    } catch (ex) {
        set %response.ContentType="plain/text"
        write !,"Error:    ",ex.Name    
        write !,"Location: ",ex.Location
        write !,"Line:     ",##class(Cogs.Lib.Dictionary).GetRoutineCodeForLineLabel($Piece($Piece($zerror,">",2)," ")),"</div>"
        write !,"Data:     ",ex.Data        
    }
    return $$$OK
}

ClassMethod RunSQL(namespace, sql)
{
    zn namespace
    try {
        set stmt=##class(%SQL.Statement).%New()
        set sc=stmt.%Prepare(.sql)
        if $$$ISERR(sc) write $SYSTEM.Status.GetOneErrorText(sc) return $$$OK
        set rs=stmt.%Execute()
        write "<table class='simple-table'>"
        write "<tr>"
        for i=1:1:rs.%ResultColumnCount {
            write "<th>", rs.%GetMetadata().columns.GetAt(i).colName, "</th>"
        }
        write "</tr>"
        while (rs.%Next()) {
            write "<tr>"
            for i=1:1:rs.%ResultColumnCount {
                write "<td>", rs.%GetData(i), "</td>"
            }
         write "</tr>"
        }
        write "</table>"
    } catch (ex) {
        write ex.DisplayString()
    }
    return $$$OK
}

}

