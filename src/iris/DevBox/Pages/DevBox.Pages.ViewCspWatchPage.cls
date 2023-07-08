Class DevBox.Pages.ViewCspWatchPage Extends %CSP.Page
{

ClassMethod OnPage() As %Status
{
    &html<
        <html>
        <head>
            <title>Watch Page</title>
        </head>

        <body>
        
        </body>

        <script>


        (() => { 

            // 1. Extract the value of page
            let url = new URL(window.location.href);
            let page = url.searchParams.get('urlToPage');

            // 2. Create an iframe that fits the screen.
            let iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.top = '0';
            iframe.style.left = '0';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = '0';

            // 3. Attach the iframe to body
            document.body.appendChild(iframe);

            // 4. Point the iframe to the page url
            iframe.src = page;

            // 5. Now watch localStorage for a value change
            window.addEventListener('storage', function(event) {
                

                if (event.key == 'cspWatchPage') {
                    
                    // 6. When the value changes, reload the iframe to the same page
                    iframe.contentWindow.location.reload();

                    // 7. Fix the title of the page
                    document.title = 'Watching: ' + iframe.contentWindow.document.title;
                }
            });

            window.setTimeout( () => {
                document.title = 'Watching: ' + iframe.contentWindow.document.title;
            },250)

        })();

        </script>

        </html>
    >
    quit $$$OK
}

}

