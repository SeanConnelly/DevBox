Class DevBox.OpenAI.Completions Extends %RegisteredObject
{

/// This method retrieves completion for a given text.
/// If the text is "help $find", it returns a base64 encoded string.
/// Otherwise, it sends an HTTP request to the OpenAI API.
/// The request includes the text, model, and temperature.
/// If the request is successful, it returns the completed content.
/// If the request fails, it returns an error message.
ClassMethod getCompletion(pText As %String) As %String
{
    if '$data(^openai("api-key")) return "To use GPT features, please add an OpenAPI key to the global ^openai(""api-key""))=""your key"""

    if pText="help $find" {
        set findText="JEZJTkQgUmVmZXJlbmNlDQoNClRoZSAkRklORCBmdW5jdGlvbiAob3IgJEYpIGxvY2F0ZXMgYSBzdWJzdHJpbmcgd2l0aGluIGEgc3RyaW5nIGFuZCByZXR1cm5zIHRoZSBwb3NpdGlvbiBvZiB0aGUgZmlyc3QgY2hhcmFjdGVyIGFmdGVyIHRoZSBmb3VuZCBzdWJzdHJpbmcuIEl0J3MgY2FzZS1zZW5zaXRpdmUgYW5kIGNvdW50cyBjaGFyYWN0ZXJzLCBub3QgYnl0ZXMsIGFsbG93aW5nIGZvciB1c2Ugd2l0aCA4LWJpdCBvciAxNi1iaXQgKFVuaWNvZGUpIGNoYXJhY3RlcnMuDQoNClN5bnRheDogDQpgYGANCiRGSU5EKHN0cmluZywgc3Vic3RyaW5nLCBbcG9zaXRpb25dKQ0KYGBgDQoqIHN0cmluZzogVGhlIHN0cmluZyB0byBiZSBzZWFyY2hlZA0KKiBzdWJzdHJpbmc6IFRoZSBzdWJzdHJpbmcgdG8gZmluZA0KKiBwb3NpdGlvbjogVGhlIHN0YXJ0IHBvc2l0aW9uIGZvciB0aGUgc2VhcmNoIChvcHRpb25hbCkNCg0KLSBJZiB0aGUgc3Vic3RyaW5nIGlzIGZvdW5kLCAkRklORCByZXR1cm5zIHRoZSBwb3NpdGlvbiBvZiB0aGUgZmlyc3QgY2hhcmFjdGVyIGFmdGVyIHRoZSBzdWJzdHJpbmcuIElmIG5vdCBmb3VuZCwgaXQgcmV0dXJucyAwLg0KLSBXaGVuIHRoZSBzdWJzdHJpbmcgaXMgYSBzaW5nbGUgY2hhcmFjdGVyIG1hdGNoaW5nIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIHN0cmluZywgJEZJTkQgcmV0dXJucyAyLg0KLSBXaGVuIHRoZSBzdWJzdHJpbmcgaXMgYSBudWxsIHN0cmluZyAoIiIpLCAkRklORCByZXR1cm5zIDEuDQotIElmIHRoZSBvcHRpb25hbCBwb3NpdGlvbiBpcyBncmVhdGVyIHRoYW4gdGhlIHN0cmluZydzIGxlbmd0aCwgJEZJTkQgcmV0dXJucyAwLg0KYGBgDQpTRVQgdmFyMT0iQUJDREVGRyIsdmFyMj0iQkNEIg0KV1JJVEUgJEZJTkQodmFyMSx2YXIyKSAvLyBSZXR1cm5zIDUNCg0KU0VUIFg9IkZPUkVTVCINCldSSVRFICRGSU5EKFgsIkZPUiIpIC8vIFJldHVybnMgNA0KDQpXUklURSAkRklORCgiYWFyZHZhcmsiLCJ6IikgLy8gUmV0dXJucyAwDQpXUklURSAkRklORCgiYWFyZHZhcmsiLCIiKSAvLyBSZXR1cm5zIDENCldSSVRFICRGSU5EKCJhYXJkdmFyayIsImEiKSAvLyBSZXR1cm5zIDINCg0KV1JJVEUgJEZJTkQoIiIsInoiKSAvLyBSZXR1cm5zIDANCldSSVRFICRGSU5EKCIiLCIiKSAvLyBSZXR1cm5zIDENCg0KU0VUIFg9IkVWRVJHUkVFTiBGT1JFU1QiLFk9IlIiDQpXUklURSAkRklORChYLFksNykgLy8gUmV0dXJucyAxNA0KDQpTRVQgWD0iRVZFUkdSRUVOIEZPUkVTVCIsWT0iUiINCldSSVRFICRGSU5EKFgsWSwyMCkgLy8gUmV0dXJucyAwDQpgYGA"
        return ##class(%SYSTEM.Encryption).Base64Decode(findText)
    }

    set httpRequest = ##class(%Net.HttpRequest).%New()
    set httpRequest.Server = "api.openai.com"
    set httpRequest.Port = 443
    set httpRequest.Https = 1
    set httpRequest.Timeout = 90
    set httpRequest.SSLConfiguration = "OpenAI"

    do httpRequest.SetHeader("Content-Type", "application/json")
    do httpRequest.SetHeader("Authorization", "Bearer "_^openai("api-key"))

    set requestBody = {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": (pText)}],
        "temperature": 0
    }
    do httpRequest.EntityBody.Write(requestBody.%ToJSON())

    set sc = httpRequest.Post("/v1/chat/completions")

    if $$$ISERR(sc) return "Post failed with error: "_$SYSTEM.Status.GetOneErrorText(sc)

    set response = httpRequest.HttpResponse

    if response.StatusCode = 200 {
        set responseJSON = ##class(%DynamicObject).%FromJSON(response.Data)
        set ^lastResponse = responseJSON
        set content=responseJSON.choices.%Get(0).message.content
        return ..PostFilter(content)
    } else {
        return "Request failed with status code: " _response.StatusCode
    }
}

ClassMethod PostFilter(content)
{
    if content["$sqrt" set content=$replace(content,"$sqrt","$zsqr")
    return content
}

}

