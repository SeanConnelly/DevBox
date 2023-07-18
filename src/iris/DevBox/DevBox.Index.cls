Class DevBox.Index Extends %CSP.Page
{

ClassMethod OnPage() As %Status [ ServerOnly = 1 ]
{
	&html<
	
	<!DOCTYPE html>
	<html lang="en">
	<head>
	    <meta charset="UTF-8">
	    <title>DevBox IDE</title>

		<script src="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js"></script>

		<link rel="stylesheet" data-name="vs/editor/editor.main" href="./lib/vs/editor/editor.main.css" />
		
		<link rel="icon" href="favicon-x.png">

	    <link rel="stylesheet" href="./style/reset.css">
	    <link rel="stylesheet" href="./style/vars.css">
	    <link rel="stylesheet" href="./style/utils.css">
	    <link rel="stylesheet" href="./style/layout.css">
	    <link rel="stylesheet" href="./style/menu.css">
	    <link rel="stylesheet" href="./style/explorer.css">
	    <link rel="stylesheet" href="./style/editor.css">
	    <link rel="stylesheet" href="./style/tablayout.css">
	    <link rel="stylesheet" href="./style/tools.css">	    
	        
	</head>
	<body>

	<div class="viewport hidden" id="viewport">

		<!-- top menu -->
		#(..TopMenu())#

		<!-- explorer -->
		#(..Explorer())#
		
		<!-- explorer dragbar -->
		<div onmousedown="DevBoxEventController.publishEvent('ExplorerDragbar','start',false)" class="explorer-dragbar" id="explorerDragbar"></div>
		
		<!-- editors -->
		<div class="editors" id="editSpaceContainer">
			<div class="pad-1em" style="color:#777">Initialising...</div>
		</div>
	    
	    <!-- output windows -->
		<div class="status-window" id="statusWindow" data-state='open' style="right: 0px; height: 140px;">

			<!-- output dragbar -->
			<div onmousedown="DevBoxEventController.publishEvent('OutputDragbar','start',false)" class="output-dragbar" id="outputDragbar"></div>
		
			<!-- status bar -->
			<div class="status-bar flex-row" id="statusBar">
				<div class="flex-1 flex-row status-bar-tabs">
					<button onclick="DevBoxEventController.publishEvent('StatusWindow','output',false,true)" class="status-bar-button">Console</button>
				</div>
				<div class="flex-1 flex-row status-bar-status">
					<span id="CursorPosition">0:0</span>
				</div>
				<div class="flex-1 flex-row status-bar-info">
					<div class="float-right">
						<!-- MINIMISE / PIN -->
					</div>
				</div>
			</div>
			
			<div class="console-window" id="outputWindow">
				<div class="console-output" id="consoleOutput">
				</div>
				<div class="console-prompt flex-row">
					<div id="console-namespace" class="console-namespace"></div>
					<div class="flex-1">
						<input id="console-input" onkeydown="if ((event.key === 'Enter')||(event.key === 'ArrowUp')||(event.key === 'ArrowDown')) { DevBoxEventController.publishEvent('onConsoleInputKey',event,false,true); }"></input>
					</div>
				</div>

			</div>

		
		</div>
		
		<!-- explorer dragbar -->
		<div onmousedown="DevBoxEventController.publishEvent('ToolsDragbar','start',false)" class="tools-dragbar" id="toolsDragbar"></div>
		
		<!-- Tools Window : ChatGPT, Inspector... -->
		#(..Tools())#
		  
	</div>

	</body>


	<script language="javascript">
	var require = { paths: { vs: './lib/vs' } };
   </script>
	<script src="./lib/vs/loader.js"></script>
	<script src="./lib/vs/editor/editor.main.nls.js"></script>
	<script src="./lib/vs/editor/editor.main.js"></script>
	
	<script type="module" src="./main.js"></script>

		 
	<script language="javascript">
		#(..InitialiseAppData())#
		
		feather.replace();

	</script>
	</html>
	
	>
	quit $$$OK
}

/// TODO: Quick hack, move into an API
ClassMethod InitialiseAppData()
{
	
	//user name
	write !,"CloudStudioAppDefault = {};"
	write !,"CloudStudioAppDefault.User='",$USERNAME,"';"
	write !,"CloudStudioAppDefault.Server='",$system,"';"
	
	//default namespace
	set thisNamespace=$NAMESPACE
	zn "%SYS"
	set user=##class(Security.Users).%OpenId($USERNAME)
	if $isobject(user) set defaultNamespace=user.NameSpace
	if $get(defaultNamespace)="" set defaultNamespace=thisNamespace
	zn thisNamespace
	write !,"CloudStudioAppDefault.NS='",defaultNamespace,"';"
	quit ""
}

ClassMethod TopMenu() As %Status
{
	&html<
	
	<div class="menu-bar flex-row" id="top-menu">
	
	<div class="flex-row flex-1">
	
		<button class="rel menu-top-button" id="kebab-menu" onclick="DevBoxEventController.publishEvent('MinimiseExplorer','',false,true)">
			<i data-feather="menu"></i>
		</button>
		
		<button class="rel menu-top-button" id="file-menu">File
		  <div class="sub-menu menu-below">
		  
  		    <div class="rel">
				<div class="flex-row flex-center-items"><div class="pad-right-1em grey"><i data-feather="database"></i></div><div class="flex-1 pad-right-1em">Change Namespace</div><div><i data-feather="chevron-right"></i></div></div>	    	
			    <div class="sub-menu menu-aside menu-aside-more">
					<%=..OutputNamespaces()%>
			    </div>	
		    </div>
		    		    
			<div class="menu-divide"></div>
		  
		    <div class="rel">
				<div class="flex-row flex-center-items"><div class="pad-right-1em grey"><i data-feather="file-plus"></i></div><div class="flex-1 pad-right-1em">New Class</div><div><i data-feather="chevron-right"></i></div></div>
			    <div class="sub-menu menu-aside menu-aside-more">
			    	<div onclick="DevBoxEventController.publishEvent('Prompt User For New Document','Registered',false,true)" class="flex-row flex-center-items h16">Registered</div>
			    	<div onclick="DevBoxEventController.publishEvent('Prompt User For New Document','Persistent',false,true)" class="flex-row flex-center-items h16">Persistent</div>
			    	<div class="menu-divide"></div>
			    	<div onclick="DevBoxEventController.publishEvent('Prompt User For New Document','Registered XML',false,true)" class="flex-row flex-center-items h16">Registered + XML</div>
			    	<div onclick="DevBoxEventController.publishEvent('Prompt User For New Document','Persistent XML',false,true)" class="flex-row flex-center-items h16">Persistent + XML</div>			    	
			    	<div class="menu-divide"></div>
			    	<div onclick="DevBoxEventController.publishEvent('Prompt User For New Document','Serial',false,true)" class="flex-row flex-center-items h16">Serial</div>
			    	<div onclick="DevBoxEventController.publishEvent('Prompt User For New Document','Abstract',false,true)" class="flex-row flex-center-items h16">Abstract</div>
			    	<div class="menu-divide"></div>
			    	<div onclick="DevBoxEventController.publishEvent('Prompt User For New Document','CSP',false,true)" class="flex-row flex-center-items h16">CSP Class</div>
			    	<div class="disabled" onclick="DevBoxEventController.publishEvent('Prompt User For New Document','',false,true)" class="flex-row flex-center-items h16">Web Service</div>
			    </div>	
		    </div>
		    
		    <div class="rel">
				<div class="flex-row flex-center-items"><div class="pad-right-1em grey"><i data-feather="file-plus"></i></div><div class="flex-1 pad-right-1em">New Routine</div><div><i data-feather="chevron-right"></i></div></div>
			    <div class="sub-menu menu-aside menu-aside-more">
			    	<div onclick="DevBoxEventController.publishEvent('Prompt User For New Document','Routine',false,true)" class="flex-row flex-center-items h16">ObjectScript</div>
			    	<div class="menu-divide"></div>
			    	<div class="disabled" onclick="DevBoxEventController.publishEvent('Prompt User For New Document','',false,true)" class="flex-row flex-center-items h16">Basic</div>
			    	<div class="disabled" onclick="DevBoxEventController.publishEvent('Prompt User For New Document','',false,true)" class="flex-row flex-center-items h16">MultiValue</div>
			    	<div class="menu-divide"></div>			    	
			    	<div onclick="DevBoxEventController.publishEvent('Prompt User For New Document','Macro',false,true)" class="flex-row flex-center-items h16">Macro Include</div>
			    	<div onclick="DevBoxEventController.publishEvent('Prompt User For New Document','Intermediary',false,true)" class="flex-row flex-center-items h16">Intermediary</div>			    	
			    </div>	
		    </div>
		    
		   <div class="rel">
				<div class="flex-row flex-center-items"><div class="pad-right-1em grey"><i data-feather="file-plus"></i></div><div class="flex-1 pad-right-1em">New Web File</div><div><i data-feather="chevron-right"></i></div></div>		   
			    <div class="sub-menu menu-aside menu-aside-more">
			    	<div class="disabled" onclick="DevBoxEventController.publishEvent('Prompt User For New Document','',false,true)" class="flex-row flex-center-items h16">CSP Page</div>
			    	<div class="menu-divide"></div>
			    	<div class="disabled" onclick="DevBoxEventController.publishEvent('Prompt User For New Document','',false,true)" class="flex-row flex-center-items h16">JavaScript</div>
			    	<div class="disabled" onclick="DevBoxEventController.publishEvent('Prompt User For New Document','',false,true)" class="flex-row flex-center-items h16">TypeScript</div>
			    	<div class="menu-divide"></div>			    	
			    	<div class="disabled" onclick="DevBoxEventController.publishEvent('Prompt User For New Document','',false,true)" class="flex-row flex-center-items h16">CSS</div>
			    	<div class="disabled" onclick="DevBoxEventController.publishEvent('Prompt User For New Document','',false,true)" class="flex-row flex-center-items h16">HTML</div>			    	
			    </div>	
		    </div>

		   <div class="rel">
				<div class="flex-row flex-center-items"><div class="pad-right-1em grey"><i data-feather="file-plus"></i></div><div class="flex-1 pad-right-1em">New Production</div><div><i data-feather="chevron-right"></i></div></div>
			    <div class="sub-menu menu-aside menu-aside-more">
			    	<div class="disabled" onclick="DevBoxEventController.publishEvent('Prompt User For New Document','',false,true)" class="flex-row flex-center-items h16">Service</div>
			    	<div class="disabled" onclick="DevBoxEventController.publishEvent('Prompt User For New Document','',false,true)" class="flex-row flex-center-items h16">Service Adapter</div>			    	
			    	<div class="menu-divide"></div>
			    	<div class="disabled" onclick="DevBoxEventController.publishEvent('Prompt User For New Document','',false,true)" class="flex-row flex-center-items h16">Message</div>
			    	<div class="disabled" onclick="DevBoxEventController.publishEvent('Prompt User For New Document','',false,true)" class="flex-row flex-center-items h16">BPL Process</div>
			    	<div class="disabled" onclick="DevBoxEventController.publishEvent('Prompt User For New Document','',false,true)" class="flex-row flex-center-items h16">Custom Process</div>
			    	<div class="disabled" onclick="DevBoxEventController.publishEvent('Prompt User For New Document','',false,true)" class="flex-row flex-center-items h16">DTL Transformation</div>			    	
			    	<div class="menu-divide"></div>			    	
			    	<div class="disabled" onclick="DevBoxEventController.publishEvent('Prompt User For New Document','',false,true)" class="flex-row flex-center-items h16">Operation</div>
			    	<div class="disabled" onclick="DevBoxEventController.publishEvent('Prompt User For New Document','',false,true)" class="flex-row flex-center-items h16">Operation Adapter</div>			    	
			    	<div class="menu-divide"></div>			    	
			    	<div class="disabled" onclick="DevBoxEventController.publishEvent('Prompt User For New Document','',false,true)" class="flex-row flex-center-items h16">Production</div>
			    </div>	
		    </div>

		   <div class="rel">
				<div class="flex-row flex-center-items"><div class="pad-right-1em grey"><i data-feather="file-plus"></i></div><div class="flex-1 pad-right-1em">New Custom</div><div><i data-feather="chevron-right"></i></div></div>
			    <div class="sub-menu menu-aside menu-aside-more">
			    	<div class="disabled" onclick="DevBoxEventController.publishEvent('Prompt User For New Document','',false,true)" class="flex-row flex-center-items h16">Unit Test</div>
			    	<div class="disabled" onclick="DevBoxEventController.publishEvent('Prompt User For New Document','',false,true)" class="flex-row flex-center-items h16">ZPM Package</div>
			    	<div class="disabled" onclick="DevBoxEventController.publishEvent('Prompt User For New Document','',false,true)" class="flex-row flex-center-items h16">DeepSee KPI</div>			    	
			    	<div class="menu-divide"></div>
			    	<div class="disabled" onclick="DevBoxEventController.publishEvent('Prompt User For New Document','',false,true)" class="flex-row flex-center-items h16">Custom Defintion</div>
			    </div>	
		    </div>

		    <div class="menu-divide"></div>
		    <div onclick="DevBoxEventController.publishEvent('Save')">
				<div class="flex-row flex-center-items"><div class="pad-right-1em grey"><i data-feather="save"></i></div><div class="flex-1 pad-right-1em">Save</div></div>
			</div>
		    <div onclick="DevBoxEventController.publishEvent('SaveAll')">
				<div class="flex-row flex-center-items"><div class="pad-right-1em grey"><i data-feather="save"></i></div><div class="flex-1 pad-right-1em">Save All</div></div>
			</div>
		    <div onclick="DevBoxEventController.publishEvent('SaveCopyAs')" class="disabled">
				<div class="flex-row flex-center-items"><div class="pad-right-1em grey"><i data-feather="copy"></i></div><div class="flex-1 pad-right-1em">Save Copy As...</div></div>
			</div>
		    <div onclick="DevBoxEventController.publishEvent('Rename')" class="disabled">
				<div class="flex-row flex-center-items"><div class="pad-right-1em grey"><i data-feather="edit-3"></i></div><div class="flex-1 pad-right-1em">Rename...</div></div>
			</div>
		  </div>
		</button>
		
		<button class="rel menu-top-button" id="edit-menu">Edit
		  <div class="sub-menu menu-below">
		    <div onclick="DevBoxEventController.publishEvent('Undu','',false,true)" class="flex-row flex-center-items h16">Undu</div>
		    <div onclick="DevBoxEventController.publishEvent('Redo','',false,true)" class="flex-row flex-center-items h16">Redo</div>
		    <div class="menu-divide"></div>
		    <div onclick="DevBoxEventController.publishEvent('Cut','',false,true)" class="flex-row flex-center-items h16">Cut</div>
		    <div onclick="DevBoxEventController.publishEvent('Copy','',false,true)" class="flex-row flex-center-items h16">Copy</div> 
		    <div onclick="DevBoxEventController.publishEvent('Paste','',false,true)" class="flex-row flex-center-items h16">Paste</div>
		    <div onclick="DevBoxEventController.publishEvent('Delete','',false,true)" class="flex-row flex-center-items h16">Delete</div>
		    <div class="menu-divide"></div>        
		    <div onclick="DevBoxEventController.publishEvent('SelectAll','',false,true)" class="flex-row flex-center-items h16">Select All</div>
		    <div class="menu-divide"></div>        
		    <div onclick="DevBoxEventController.publishEvent('Find','',false,true)" class="flex-row flex-center-items h16">Find...</div>
		    <div onclick="DevBoxEventController.publishEvent('Replace','',false,true)" class="flex-row flex-center-items h16">Replace...</div>
		    <div class="menu-divide"></div>
		    <div  onclick="DevBoxEventController.publishEvent('FindInFiles','',false,true)" class="flex-row flex-center-items h16">Find in Files...</div>		    
		  </div>
		</button>
		
		<button class="rel menu-top-button" id="view-menu">View
     	 <div class="sub-menu menu-below">
		    <div onclick="DevBoxEventController.publishEvent('ToggleFullScreen','',false,true)" class="flex-row flex-center-items h16">Full Screen</div>
		    <div class="rel">
				<div class="flex-row flex-center-items"><div class="flex-1 pad-right-1em">Text Size</div><div><i data-feather="chevron-right"></i></div></div>
			    <div class="sub-menu menu-aside">
				    <div onclick="DevBoxEventController.publishEvent('TextSize','Small')" class="flex-row flex-center-items h16">Small</div>
			    	<div onclick="DevBoxEventController.publishEvent('TextSize','Normal')" class="flex-row flex-center-items h16">Normal</div>
			    	<div onclick="DevBoxEventController.publishEvent('TextSize','Large')" class="flex-row flex-center-items h16">Large</div>
			    	<div onclick="DevBoxEventController.publishEvent('TextSize','ExtraLarge')" class="flex-row flex-center-items h16">Extra Large</div>
			    </div>		    
		    </div>
		    <div class="menu-divide"></div>
		    <div onclick="DevBoxEventController.publishEvent('ChangeShowLineNumbers','toggle',false,true)" class="flex-row flex-center-items h16">Show Line Numbers</div>
		    <div onclick="DevBoxEventController.publishEvent('ChangeShowMiniMap','toggle',false,true)" class="flex-row flex-center-items h16">Show Mini Map</div>
   		    <div class="menu-divide"></div>
   		    <div class="rel">
			    <div class="flex-row flex-center-items"><div class="flex-1 pad-right-1em">Appearance</div><div><i data-feather="chevron-right"></i></div></div>
			    <div class="sub-menu menu-aside">
			    	<div onclick="DevBoxEventController.publishEvent('Model.Appearance','light',true,true)" class="flex-row flex-center-items h16">Light</div>
			    	<div onclick="DevBoxEventController.publishEvent('Model.Appearance','dark',true,true)" class="flex-row flex-center-items h16">Dark</div>
			    </div>	
		    </div>
   		    <div class="rel">
		    	<div class="flex-row flex-center-items"><div class="flex-1 pad-right-1em">Accent Color</div><div><i data-feather="chevron-right"></i></div></div>
			    <div class="sub-menu menu-aside">
			    	<div onclick="DevBoxEventController.publishEvent('Model.AccentColor','red',false,true)" class="flex-row flex-center-items h16"><span class="menu-view--color bg-red">&nbsp;</span>Red</div>
			    	<div onclick="DevBoxEventController.publishEvent('Model.AccentColor','brown',false,true)" class="flex-row flex-center-items h16"><span class="menu-view--color bg-brown">&nbsp;</span>Brown</div>
			    	<div onclick="DevBoxEventController.publishEvent('Model.AccentColor','orange',false,true)" class="flex-row flex-center-items h16"><span class="menu-view--color bg-orange">&nbsp;</span>Orange</div>
			    	<div onclick="DevBoxEventController.publishEvent('Model.AccentColor','yellow',false,true)" class="flex-row flex-center-items h16"><span class="menu-view--color bg-yellow">&nbsp;</span>Yellow</div>
			    	<div onclick="DevBoxEventController.publishEvent('Model.AccentColor','green',false,true)" class="flex-row flex-center-items h16"><span class="menu-view--color bg-green">&nbsp;</span>Green</div>
			    	<div onclick="DevBoxEventController.publishEvent('Model.AccentColor','mint',false,true)" class="flex-row flex-center-items h16"><span class="menu-view--color bg-mint">&nbsp;</span>Mint</div>
			    	<div onclick="DevBoxEventController.publishEvent('Model.AccentColor','cyan',false,true)" class="flex-row flex-center-items h16"><span class="menu-view--color bg-cyan">&nbsp;</span>Cyan</div>
			    	<div onclick="DevBoxEventController.publishEvent('Model.AccentColor','blue',false,true)" class="flex-row flex-center-items h16"><span class="menu-view--color bg-blue">&nbsp;</span>Blue</div>
			    	<div onclick="DevBoxEventController.publishEvent('Model.AccentColor','magenta',false,true)" class="flex-row flex-center-items h16"><span class="menu-view--color bg-magenta">&nbsp;</span>Magenta</div>
			    </div>	
		    </div>
		    <div class="menu-divide"></div>
		    <div onclick="DevBoxEventController.publishEvent('ReloadPage','',false,true)" class="flex-row flex-center-items h16">Reload</div>
		    <div onclick="DevBoxEventController.publishEvent('ResetPage','',false,true)" class="flex-row flex-center-items h16">Reset</div>
		    <div class="menu-divide"></div>
		    <div class="disabled" onclick="DevBoxEventController.publishEvent('ViewOtherCode','',false,true)" class="flex-row flex-center-items h16">View Other Code</div>
		    <div class="menu-divide"></div>
		    <div class="rel">
		    	<div class="flex-row flex-center-items"><div class="flex-1 pad-right-1em">Fold</div><div><i data-feather="chevron-right"></i></div></div>
			    <div class="sub-menu menu-aside">
			    	<div onclick="DevBoxEventController.publishEvent('FoldLevel','1',false,true)" class="flex-row flex-center-items h16">Level 1</div>
			    	<div onclick="DevBoxEventController.publishEvent('FoldLevel','2',false,true)" class="flex-row flex-center-items h16">Level 2</div>
			    	<div onclick="DevBoxEventController.publishEvent('FoldLevel','3',false,true)" class="flex-row flex-center-items h16">Level 3</div>
			    	<div onclick="DevBoxEventController.publishEvent('FoldLevel','4',false,true)" class="flex-row flex-center-items h16">Level 4</div>			    				    	
			    	<div onclick="DevBoxEventController.publishEvent('FoldLevel','5',false,true)" class="flex-row flex-center-items h16">Level 5</div>
			    	<div onclick="DevBoxEventController.publishEvent('FoldLevel','6',false,true)" class="flex-row flex-center-items h16">Level 6</div>
			    	<div onclick="DevBoxEventController.publishEvent('FoldLevel','7',false,true)" class="flex-row flex-center-items h16">Level 7</div>
			    </div>	
		    </div>
		    <div onclick="DevBoxEventController.publishEvent('FoldAll','',false,true)" class="flex-row flex-center-items h16">Fold All Code</div>
		    <div onclick="DevBoxEventController.publishEvent('UnfoldAll','',false,true)" class="flex-row flex-center-items h16">Unfold All Code</div>
	     </div>
		</button>

		<button class="rel menu-top-button" id="project-menu">Project
		 <div class="sub-menu menu-below">
		    <div class="disabled" class="flex-row flex-center-items h16">Manage Project</div>
		    <div class="disabled" class="flex-row flex-center-items h16">Baseline Project</div>
		    <div class="menu-divide"></div>
		    <div class="disabled" class="flex-row flex-center-items h16">Export Project</div>
		    <div class="disabled" class="flex-row flex-center-items h16">Import Project</div>			
		    <div class="menu-divide"></div>
		    <div class="disabled" class="flex-row flex-center-items h16">Open Project</div>
		    <div class="disabled" class="flex-row flex-center-items h16">New Project</div>
		    <div class="disabled" class="flex-row flex-center-items h16">Rename Project</div>
		    <div class="disabled" class="flex-row flex-center-items h16">Copy Project</div>		    
		    <div class="disabled" class="flex-row flex-center-items h16">Close Project</div>
	     </div>
		</button>
				
		<button class="rel menu-top-button" id="edit-menu">Build
		  <div class="sub-menu menu-below">
		    <div onclick="DevBoxEventController.publishEvent('Compile','',false,true)" class="flex-row flex-center-items h16">Compile</div>
		    <div class="menu-divide"></div>
		    <div  onclick="DevBoxEventController.publishEvent('CompileAllOpen','',false,true)" class="flex-row flex-center-items h16">Compile All Open</div>
		  </div>
		</button>
		
		<button class="rel menu-top-button" id="tools-menu">Tools
		  <div class="sub-menu menu-below">
		    <div onclick="document.getElementById('import-local-file').click();" class="flex-row flex-center-items h16">Import Code Local
				<form id="import-code-form" style="display:none;">
					<input type="file" id="import-local-file" accept=".xml" onchange="DevBoxEventController.publishEvent('ImportCodeLocal',this,false,true);this.value='';"/>
				</form>
			</div>
			<div class="menu-divide"></div>
		    <div onclick="DevBoxEventController.publishEvent('ExportCode','',false,true)" class="flex-row flex-center-items h16">Export Code Remote</div>
		    <div onclick="DevBoxEventController.publishEvent('ImportCode','',false,true)" class="flex-row flex-center-items h16">Import Code Remote</div>
			<div class="menu-divide"></div>
			<div onclick="DevBoxEventController.publishEvent('ViewCSPPage','',false,true)" class="flex-row flex-center-items h16">View CSP Page</div>
			<div onclick="DevBoxEventController.publishEvent('WatchCSPPage','',false,true)" class="flex-row flex-center-items h16">Watch CSP Page</div>			
		  </div>
		</button>
		
	</div>
	<div class="flex-row">
		<button onclick="DevBoxEventController.publishEvent('Save','',false,true)" class="rel icon-button" id="tools-menu"><i data-feather="save"></i></button>
		<button onclick="DevBoxEventController.publishEvent('Compile','',false,true)" class="rel icon-button" id="tools-menu"><i data-feather="cpu"></i></button>
	</div>
	<div class="flex-row flex-1">	
		<button class="rel menu-top-button push-right" id="utils-menu">Utilities
			<div class="sub-menu menu-below-right">
		     <div onclick="DevBoxEventController.publishEvent('LaunchUtility','Management Portal',false,true)" class="flex-row flex-center-items h24">Management Portal</div>
		     <div onclick="DevBoxEventController.publishEvent('LaunchUtility','SQL Explorer',false,true)" class="flex-row flex-center-items h24">SQL Explorer</div>    		     		     
		     <div class="menu-divide"></div>
		     <div onclick="DevBoxEventController.publishEvent('LaunchUtility','Class Reference',false,true)" class="flex-row flex-center-items h24">Class Reference</div>    		     		     		     
		     <div class="menu-divide"></div>    
		     <div onclick="DevBoxEventController.publishEvent('LaunchUtility','Production Configuration',false,true)" class="flex-row flex-center-items h24">Production Configuration</div>
		     <div onclick="DevBoxEventController.publishEvent('LaunchUtility','Production Monitor',false,true)" class="flex-row flex-center-items h24">Production Monitor</div>
		     <div onclick="DevBoxEventController.publishEvent('LaunchUtility','System Monitor',false,true)" class="flex-row flex-center-items h24">System Monitor</div>
		     <div onclick="DevBoxEventController.publishEvent('LaunchUtility','Message Viewer',false,true)" class="flex-row flex-center-items h24">Message Viewer</div>
		     <div class="menu-divide"></div> 
		     <div onclick="DevBoxEventController.publishEvent('LaunchUtility','Web Terminal',false,true)" class="flex-row flex-center-items h24">Web Terminal</div>     
		  </div>
		</button>
		<button class="rel menu-top-button" id="help-menu">Help
		  <div class="sub-menu menu-below-right">
		     <div onclick="DevBoxEventController.publishEvent('LaunchHelp','InterSystems Documentation',false,true)" class="flex-row flex-center-items h24">InterSystems Documentation</div>
		     <div onclick="DevBoxEventController.publishEvent('LaunchHelp','InterSystems Community',false,true)" class="flex-row flex-center-items h24">InterSystems Community</div>
		     <div onclick="DevBoxEventController.publishEvent('LaunchHelp','InterSystems Discord',false,true)" class="flex-row flex-center-items h24">InterSystems Discord</div>
		     <div class="menu-divide"></div>
		     <div onclick="DevBoxEventController.publishEvent('LaunchHelp','CloudStudio GitHub',false,true)" class="flex-row flex-center-items h24">CloudStudio GitHub</div>    		     		     
		     <div onclick="DevBoxEventController.publishEvent('LaunchHelp','CloudStudio Discord',false,true)" class="flex-row flex-center-items h24">CloudStudio Discord</div>
		  </div>
		</button>
		</button>
		<button class="rel menu-top-button" id="kebab-menu" onclick="DevBoxEventController.toggleBooleanItemEvent('MinimiseTools','open',true)">
			<i data-feather="codesandbox"></i>
		</button>
	</div>	
	</div>
	
	>
	quit ""
}

ClassMethod OutputNamespaces()
{
	set sc=##class(%SYS.Namespace).ListAll(.nsl)
	//for i=1:1:50 set nsl("zoo"_i)="" //use to test overflow of very large namespace list
	set ns=$o(nsl(""))
	while ns'="" {
		if $e(ns)'="^" write "<div onclick=""DevBoxEventController.publishEvent('SwapNamespace','"_ns_"',false,true)"" class=""flex-row flex-center-items h24"">"_ns_"</div>"
		set ns=$o(nsl(ns))
	}
	quit ""
}

ClassMethod Explorer() As %Status
{
	set system=$system
	set server=$piece(system,":",1)
	set instance=$piece(system,":",2)

	&html<
	
	<div class="explorer flex-col" data-state="open" id="explorerPanel">
		<div class="explorer-title flex-row flex-center-items">
		<div class="pad-right-half-em"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-server"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg></div>
			<span id="namespace">NAMESPACE</span>
	  		<button class="flex-right menu-top-button rel" id="file-menu">
	  		  <i data-feather="more-vertical"></i>
	          <div class="sub-menu menu-below-right">
	            <div>Change Namespace...</div>
				<div class="menu-divide"></div>			  
	            <div onclick="DevBoxEventController.publishEvent('ExpandAll','',false,true)" id="">Expand All</div>
	            <div onclick="DevBoxEventController.publishEvent('CollapseAll','',false,true)" id="">Collapse All</div>
	          </div>
	        </button>
		</div>
		<div class="flex-grow code-tree" id="explorer-tree"></div>
		<div class="explorer-title flex-row flex-center-items">
			<div class="pad-right-half-em"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-server"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg></div>
			<div id="server" class="center"><%=instance%></div>			
		</div>		
		<div class="explorer-title-2 flex-row flex-center-items">
			<div class="pad-right-half-em"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-server"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg></div>
			<div id="server" class="center"><%=server%></div>			
		</div>
	</div>
	>
	quit ""
}

ClassMethod Tools() As %Status
{
	
	&html<
	
	<div class="tools-container flex-col" data-state="open" id="toolsPanel">
		<div class="tools-title flex-row flex-center-items">
	  		<span id="tools-title-name">Code Assistant</span>
	  		<button class="flex-right menu-top-button rel" id="file-menu">
	  		  <i data-feather="more-vertical"></i>
	          <div class="sub-menu menu-below-right">
	            <div onclick="DevBoxEventController.publishEvent('ToolsGPTClear','',false,true)" id="">Clear Assistant</div>
	          </div>
	        </button>
		</div>
		<div class="flex-grow" id="tools-gpt-output"></div>
		<div class="flex-row" id="tools-gpt-input">
			<textarea id="tools-gpt-input-textbox" placeholder="ask a question" onkeydown="if (event.key === 'Enter' && !event.shiftKey) { DevBoxEventController.publishEvent('ToolsGPTEnter',event,false,true); }"></textarea>
		</div>
	</div>
	
	>
	quit ""
}

}

