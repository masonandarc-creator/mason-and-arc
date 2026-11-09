using Autodesk.Revit.DB;
using System.Text.Json.Serialization;
namespace MasonArc.Revit2027;

public sealed class ModelExport
{
    public string SchemaVersion { get; init; } = "mason-arc-revit-v1";
    public string Source { get; init; } = "revit-2027";
    public string DocumentKey { get; init; } = "";
    public string Title { get; init; } = "";
    public DateTime ExportedAtUtc { get; init; } = DateTime.UtcNow;
    public List<ElementExport> Elements { get; init; } = [];
    public List<string> Warnings { get; init; } = [];
}
public sealed class ElementExport
{
    public string UniqueId { get; init; } = "";
    public string Category { get; init; } = "";
    public string Name { get; init; } = "";
    public string Level { get; init; } = "";
    public double? VolumeM3 { get; init; }
    public double? AreaM2 { get; init; }
    public double? LengthM { get; init; }
    public List<MaterialExport> Materials { get; init; } = [];
}
public sealed class MaterialExport
{
    public string Name { get; init; } = "";
    public double? VolumeM3 { get; init; }
    public double? AreaM2 { get; init; }
}
public static class ModelTakeoff
{
    private static readonly HashSet<BuiltInCategory> Included =
    [
        BuiltInCategory.OST_Walls, BuiltInCategory.OST_Floors,
        BuiltInCategory.OST_Roofs, BuiltInCategory.OST_Ceilings,
        BuiltInCategory.OST_StructuralColumns, BuiltInCategory.OST_Columns,
        BuiltInCategory.OST_StructuralFraming, BuiltInCategory.OST_StructuralFoundation,
        BuiltInCategory.OST_Doors, BuiltInCategory.OST_Windows,
        BuiltInCategory.OST_Stairs, BuiltInCategory.OST_Railings,
        BuiltInCategory.OST_GenericModel
    ];
    private static double? Convert(Parameter? p, UnitTypeIdMarker units)
    {
        if (p?.StorageType != StorageType.Double) return null;
        var value = p.AsDouble();
        if (!double.IsFinite(value) || value < 0) return null;
        return Math.Round(units switch
        {
            UnitTypeIdMarker.Volume => UnitUtils.ConvertFromInternalUnits(value, UnitTypeId.CubicMeters),
            UnitTypeIdMarker.Area => UnitUtils.ConvertFromInternalUnits(value, UnitTypeId.SquareMeters),
            _ => UnitUtils.ConvertFromInternalUnits(value, UnitTypeId.Meters)
        }, 6);
    }
    private enum UnitTypeIdMarker { Volume, Area, Length }
    private static Parameter? FindQuantity(Element e, UnitTypeIdMarker kind)
    {
        BuiltInParameter[] candidates = kind switch
        {
            UnitTypeIdMarker.Volume => [BuiltInParameter.HOST_VOLUME_COMPUTED],
            UnitTypeIdMarker.Area => [BuiltInParameter.HOST_AREA_COMPUTED],
            _ => [BuiltInParameter.CURVE_ELEM_LENGTH]
        };
        foreach (var builtin in candidates)
        {
            var parameter = e.get_Parameter(builtin);
            if (parameter?.HasValue == true && parameter.StorageType == StorageType.Double) return parameter;
        }
        return null;
    }
    public static ModelExport Read(Document document)
    {
        if (document.IsFamilyDocument) throw new InvalidOperationException("Open a project model, not a family editor.");
        var result = new ModelExport
        {
            DocumentKey = document.ProjectInformation?.UniqueId ?? document.Title,
            Title = document.Title
        };
        var elements = new FilteredElementCollector(document)
            .WhereElementIsNotElementType()
            .ToElements();
        foreach (var e in elements)
        {
            if (e.Category is null || !Enum.IsDefined(typeof(BuiltInCategory), e.Category.Id.Value)) continue;
            var cat = (BuiltInCategory)e.Category.Id.Value;
            if (!Included.Contains(cat)) continue;
            if (result.Elements.Count >= 10000)
            {
                result.Warnings.Add("Only first 10,000 supported elements were exported. Split large projects.");
                break;
            }
            try
            {
                var materialItems = new List<MaterialExport>();
                foreach (var id in e.GetMaterialIds(false))
                {
                    var mat = document.GetElement(id) as Material;
                    if (mat == null) continue;
                    double? v = null, a = null;
                    try { v = Math.Round(UnitUtils.ConvertFromInternalUnits(e.GetMaterialVolume(id), UnitTypeId.CubicMeters),6); } catch { }
                    try { a = Math.Round(UnitUtils.ConvertFromInternalUnits(e.GetMaterialArea(id,false),UnitTypeId.SquareMeters),6); } catch { }
                    materialItems.Add(new MaterialExport { Name=mat.Name,VolumeM3=v,AreaM2=a });
                }
                var levelId = e.LevelId;
                var level = (levelId != ElementId.InvalidElementId ? document.GetElement(levelId) as Level : null)?.Name ?? "";
                result.Elements.Add(new ElementExport
                {
                    UniqueId=e.UniqueId,
                    Category=e.Category.Name,
                    Name=e.Name,
                    Level=level,
                    VolumeM3=Convert(FindQuantity(e,UnitTypeIdMarker.Volume),UnitTypeIdMarker.Volume),
                    AreaM2=Convert(FindQuantity(e,UnitTypeIdMarker.Area),UnitTypeIdMarker.Area),
                    LengthM=Convert(FindQuantity(e,UnitTypeIdMarker.Length),UnitTypeIdMarker.Length),
                    Materials=materialItems
                });
            }
            catch (Exception ex)
            {
                result.Warnings.Add($"Element {e.Id.Value}: {ex.GetType().Name} could not be measured");
                if(result.Warnings.Count>150)break;
            }
        }
        if (result.Elements.Count == 0) result.Warnings.Add("No supported modeled elements found.");
        return result;
    }
}
