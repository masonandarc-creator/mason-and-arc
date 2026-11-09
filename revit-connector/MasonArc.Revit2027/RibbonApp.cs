using Autodesk.Revit.UI;
using System.Reflection;
namespace MasonArc.Revit2027;

public sealed class RibbonApp : IExternalApplication
{
    public Result OnStartup(UIControlledApplication application)
    {
        const string tab = "MASON & ARC";
        try { application.CreateRibbonTab(tab); } catch (Autodesk.Revit.Exceptions.ArgumentException) { }
        var panel = application.GetRibbonPanels(tab).FirstOrDefault(p => p.Name == "Quantity & Cost")
                    ?? application.CreateRibbonPanel(tab, "Quantity & Cost");
        var assemblyPath = Assembly.GetExecutingAssembly().Location;
        Add(panel, assemblyPath, "MaExport2027", "Export\nTakeoff", typeof(ExportCommand));
        Add(panel, assemblyPath, "MaConnect2027", "Connect\nOS", typeof(ConnectCommand));
        Add(panel, assemblyPath, "MaSync2027", "Sync\nModel", typeof(SyncCommand));
        return Result.Succeeded;
    }

    private static void Add(RibbonPanel panel, string assembly, string id, string caption, Type type)
    {
        if (panel.GetItems().Any(i => i.Name == id)) return;
        var data = new PushButtonData(id, caption, assembly, type.FullName!);
        var button = (PushButton)panel.AddItem(data);
        button.ToolTip = id switch {
            "MaExport2027" => "Read-only export of modeled quantities to JSON",
            "MaConnect2027" => "Pair this Revit installation with your Mason & Arc project",
            _ => "Securely send modeled quantities to Mason & Arc OS. No model edits."
        };
    }
    public Result OnShutdown(UIControlledApplication application) => Result.Succeeded;
}
