Class DevBox.Util.DevBoxInstaller Extends %RegisteredObject
{

/// Configures the DevBox and DevBoxApi applications
ClassMethod Install(pathToCspFiles)
{

    // validate the path to csp files
    if pathToCspFiles="" write !,"ERROR: Path to CSP files is required, quiting installation" quit
    set checkFile=##class(%File).NormalizeFilename("main.js",pathToCspFiles)
    if checkFile="" write !,"ERROR: Invalid path location, quiting installation" quit
    set checkFileExists=##class(%File).Exists(checkFile)
    if checkFileExists=0 write !,"ERROR: Invalid path location, quiting installation" quit

    // uninstall any previous installations
    do ..Uninstall()

    // install the DevBox application
    set sc=..InstallDevBoxApplication($namespace,pathToCspFiles)
    if $$$ISERR(sc) write !,"Unable to create DevBox application. Reason: ",$SYSTEM.Status.GetOneErrorText(sc)," , quiting installation" quit
    write !,"DevBox Application installed correctly"

    // install the DevBoxApi application
    set sc=..InstallDevBoxApi($namespace)
    if $$$ISERR(sc) write !,"Unable to create DevBox API application. Reason: ",$SYSTEM.Status.GetOneErrorText(sc)," , quiting installation" quit
    write !,"DevBox API Application installed correctly"

    // installation is complete, output a link to the main index class
    write !,"Installation complete"
    write !!,"Navigate to http://host:port/devbox/DevBox.Index.cls to launch DevBox"
}

/// Removes the DevBox and DevBoxApi applications
ClassMethod Uninstall(namespace = "")
{
    if namespace="" set namespace=$namespace
    zn "%SYS"
    set sc=##class(Security.Applications).Delete("/devbox")
    set sc=##class(Security.Applications).Delete("/devboxapi")
    zn namespace
    quit sc
}

ClassMethod InstallDevBoxApplication(namespace, path)
{
    zn "%SYS"
    if ##class(Security.Applications).Exists("/devbox")=0 {
        kill params
        set params("NameSpace")=namespace
        set params("DispatchClass")=""
        set params("Path")=path
        set params("ServeFiles")=2
        set params("Description")="DevBox IDE Application"
        set params("AutheEnabled")=32
        set params("UseCookies")=2
        set sc=##class(Security.Applications).Create("/devbox",.params)
    }
    zn namespace
    quit sc
}

ClassMethod InstallDevBoxApi(namespace)
{
    zn "%SYS"
    if ##class(Security.Applications).Exists("/devboxapi")=0 {
        kill params
        set params("NameSpace")=namespace        
        set params("DispatchClass")="DevBox.API.Main"
        set params("Description")="DevBox REST API"
        set params("Enabled")=1
        set params("AutheEnabled")=32
        set params("UseCookies")=2
        set sc=##class(Security.Applications).Create("/devboxapi",.params)
    }
    zn namespace
    quit sc
}

/// Returns the physical path location of CSP files for a namespaces
/// default install location. Returns "" if not found.
ClassMethod GetPathForNamespace(namespace)
{
    set path=""
    set thisNamespace=$namespace
    zn "%SYS"
    &sql(select Path into :path
         from Security.Applications
         where Namespace=:namespace
         and IsNameSpaceDefault=1)
    zn thisNamespace
    return path
}

}

