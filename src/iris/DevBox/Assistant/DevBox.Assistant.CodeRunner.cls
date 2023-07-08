Class DevBox.Assistant.CodeRunner Extends %RegisteredObject
{

ClassMethod RunCode(code)
{
    try {
        set temp=""
        
        if $e(code,1,5)="write" {
            set temp=""
            set code="() set temp="_$e(code,6,*)_" quit temp"
            set temp=$xecute(code)
        } else {
            xecute code
        }
        if $IsObject(temp) {
            try {
                do ##class(DevBox.Lib.JSON.ObjectSerializer).ToJSON(temp,.json)
                do json.OutputToDevice()
            } catch (ex2) {
                zwrite temp
            }
        } else {
            write temp
        }
    } catch (ex) {
        write !,"<div>Error: ",ex.DisplayString()
        write !,"<br>Line:",##class(Cogs.Lib.Dictionary).GetRoutineCodeForLineLabel($Piece($Piece($zerror,">",2)," ")),"</div>"
    }
    return $$$OK
}

ClassMethod RunSQL(sql)
{
    try {
        set stmt=##class(%SQL.Statement).%New()
        set sc=stmt.%Prepare(.sql)
        if $$$ISERR(sc) write $SYSTEM.Status.GetOneErrorText(sc) return $$$OK
        set rs=stmt.%Execute()
        write "<table>"
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

