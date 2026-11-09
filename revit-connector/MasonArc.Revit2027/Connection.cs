using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
namespace MasonArc.Revit2027;

public sealed record ConnectionSettings(string Token)
{
    private static string Filename => Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),"MasonAndArc","Revit2027","connection.dat");
    public static void Save(ConnectionSettings value)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(Filename)!);
        var plain=Encoding.UTF8.GetBytes(value.Token);
        var encrypted=ProtectedData.Protect(plain,null,DataProtectionScope.CurrentUser);
        File.WriteAllBytes(Filename,encrypted);
        CryptographicOperations.ZeroMemory(plain);
    }
    public static ConnectionSettings? Load()
    {
        if(!File.Exists(Filename))return null;
        var plain=ProtectedData.Unprotect(File.ReadAllBytes(Filename),null,DataProtectionScope.CurrentUser);
        try{return new ConnectionSettings(Encoding.UTF8.GetString(plain));}
        finally{CryptographicOperations.ZeroMemory(plain);}
    }
}
public static class SyncTransport
{
    private static readonly Uri Url=new("https://www.masonandarc.com/api/cost-control/revit/sync");
    public static async Task<string> Upload(string token,string json)
    {
        if(Encoding.UTF8.GetByteCount(json)>3_000_000)throw new InvalidOperationException("Model export exceeds 3 MB. Split the model.");
        using var client=new HttpClient{Timeout=TimeSpan.FromSeconds(45)};
        using var request=new HttpRequestMessage(HttpMethod.Post,Url);
        request.Headers.Authorization=new AuthenticationHeaderValue("Bearer",token);
        request.Content=new StringContent(json,Encoding.UTF8,"application/json");
        using var response=await client.SendAsync(request).ConfigureAwait(false);
        string body=await response.Content.ReadAsStringAsync().ConfigureAwait(false);
        if(!response.IsSuccessStatusCode)
        {
            string text="HTTP "+(int)response.StatusCode;
            try{using var doc=JsonDocument.Parse(body);if(doc.RootElement.TryGetProperty("error",out var err))text=err.GetString()??text;}catch{}
            throw new InvalidOperationException(text);
        }
        using var parsed=JsonDocument.Parse(body);
        return parsed.RootElement.GetProperty("data").GetProperty("id").GetString()??"Saved";
    }
}
