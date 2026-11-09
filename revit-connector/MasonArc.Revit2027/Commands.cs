using Autodesk.Revit.Attributes;
using Autodesk.Revit.DB;
using Autodesk.Revit.UI;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Windows.Forms;
using TaskDialog = Autodesk.Revit.UI.TaskDialog;
using Form = System.Windows.Forms.Form;
using TextBox = System.Windows.Forms.TextBox;
namespace MasonArc.Revit2027;

public static class JsonTools
{
    public static string Serialize(ModelExport model) => JsonSerializer.Serialize(model,
        new JsonSerializerOptions { PropertyNamingPolicy=JsonNamingPolicy.CamelCase,WriteIndented=true,DefaultIgnoreCondition=JsonIgnoreCondition.WhenWritingNull });
}
[Transaction(TransactionMode.ReadOnly)]
public sealed class ExportCommand : IExternalCommand
{
    public Result Execute(ExternalCommandData commandData, ref string message, ElementSet elements)
    {
        try {
            var doc = commandData.Application.ActiveUIDocument?.Document;
            if (doc is null) { message="Open a Revit project first."; return Result.Failed; }
            var data = ModelTakeoff.Read(doc);
            using var dialog = new SaveFileDialog
            {
                Title="Export Mason & Arc model quantities",
                FileName="MasonArc-"+Path.GetFileNameWithoutExtension(doc.Title)+"-Takeoff.json",
                Filter="JSON takeoff (*.json)|*.json",
                AddExtension=true,DefaultExt="json",OverwritePrompt=true
            };
            if (dialog.ShowDialog()!=DialogResult.OK) return Result.Cancelled;
            File.WriteAllText(dialog.FileName,JsonTools.Serialize(data),new System.Text.UTF8Encoding(false));
            TaskDialog.Show("MASON & ARC", $"Exported {data.Elements.Count} modeled elements.\n\nSaved: {dialog.FileName}\n\nReview warnings: {data.Warnings.Count}.\nNo Revit elements were changed.");
            return Result.Succeeded;
        } catch(Exception ex) {message=ex.Message;return Result.Failed;}
    }
}
[Transaction(TransactionMode.ReadOnly)]
public sealed class ConnectCommand : IExternalCommand
{
    public Result Execute(ExternalCommandData d,ref string message,ElementSet elements)
    {
        try{
            var current=ConnectionSettings.Load();
            using var form=new Form{Text="Mason & Arc OS — Connect",Width=540,Height=290,StartPosition=FormStartPosition.CenterScreen,FormBorderStyle=FormBorderStyle.FixedDialog,MaximizeBox=false,MinimizeBox=false};
            var info=new Label{Text="Create a project-bound connector token in Mason & Arc OS > Revit Connector, then paste it here. Stored encrypted for your Windows user.",Left=20,Top=16,Width=490,Height=48};
            var label=new Label{Text="Connector token",Left=20,Top=77,Width=450};
            var token=new TextBox{Left=20,Top=100,Width=480,UseSystemPasswordChar=true,Text=current is null?"":current.Token};
            var checkbox=new CheckBox{Text="I consent to upload modeled geometry quantities to Mason & Arc OS.",Left=20,Top=147,Width=490,Checked=false};
            var save=new Button{Text="Save connection",Left=340,Top=195,Width=160,DialogResult=DialogResult.OK};
            form.Controls.AddRange([info,label,token,checkbox,save]);form.AcceptButton=save;
            if(form.ShowDialog()!=DialogResult.OK)return Result.Cancelled;
            if(!checkbox.Checked || !token.Text.Trim().StartsWith("ma_rvt_")){message="Enter a valid connector token and explicitly consent to sharing model quantities.";return Result.Failed;}
            ConnectionSettings.Save(new ConnectionSettings(token.Text.Trim()));
            TaskDialog.Show("MASON & ARC","Windows connection saved securely. Open a project, then use Sync Model.");
            return Result.Succeeded;
        }catch(Exception ex){message=ex.Message;return Result.Failed;}
    }
}
[Transaction(TransactionMode.ReadOnly)]
public sealed class SyncCommand : IExternalCommand
{
    public Result Execute(ExternalCommandData d,ref string message,ElementSet elements)
    {
        try{
            var doc=d.Application.ActiveUIDocument?.Document;
            if(doc is null){message="Open a project first.";return Result.Failed;}
            var settings=ConnectionSettings.Load();
            if(settings is null){TaskDialog.Show("MASON & ARC","Use Connect OS first to set up your project-bound token.");return Result.Cancelled;}
            var export=ModelTakeoff.Read(doc);
            if(export.Elements.Count==0){message="No supported modeled elements found.";return Result.Failed;}
            var confirmation=TaskDialog.Show("MASON & ARC",
                $"Send {export.Elements.Count} modeled elements and {export.Warnings.Count} warnings to your linked project?\n\nOnly extracted metadata and quantities are sent, not the RVT file.",
                TaskDialogCommonButtons.Yes|TaskDialogCommonButtons.No);
            if(confirmation!=TaskDialogResult.Yes)return Result.Cancelled;
            var result=SyncTransport.Upload(settings.Token,JsonTools.Serialize(export)).GetAwaiter().GetResult();
            TaskDialog.Show("MASON & ARC",$"Model sync saved. Snapshot: {result}\nReview quantities in Mason & Arc OS > Revit Connector.\nThe BOQ remains unchanged until mapping and approval.");
            return Result.Succeeded;
        }catch(Exception ex){message="Sync failed: "+ex.Message;return Result.Failed;}
    }
}
