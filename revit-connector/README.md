# Mason & Arc — Revit Connector 2027

Read-only Autodesk Revit 2027 ribbon add-in. Targets **.NET 10 for Windows x64**, as Autodesk specifies. <https://help.autodesk.com/cloudhelp/2027/ENU/Revit-WhatsNew/files/GUID-8D7A4715-EAF8-4BD1-BE78-061F900D0BCE.htm>

## Download and installation (Alienware Windows)

1. In GitHub Actions, select **Revit 2027 Connector** and download its **MasonArc-Revit2027-Installer** artifact from a successful Windows build. This contains a ZIP with the compiled DLLs and installer scripts.
2. Extract the inner **MasonArc-Revit2027-v0.1.0.zip** to a folder. (GitHub also wraps the artifact in a ZIP.)
3. Close Revit 2027. In PowerShell run:
   `powershell -NoProfile -ExecutionPolicy Bypass -File .\Install-MasonArc-Revit2027.ps1`
4. Restart Revit 2027. Find the **MASON & ARC** tab > **Quantity & Cost** panel.
5. Start with **Export Takeoff** on a *copy* of a villa model. Check the JSON quantities. It uses **metric m, m², m³**.
6. Open <https://www.masonandarc.com/app/admin/revit> as an Owner/Manager. Pick the exact studio project, enter device label, and click **Create project-bound token**. Copy it immediately; it cannot be displayed again.
7. Back in Revit use **Connect OS**, paste the token, explicitly consent to uploading model metadata. Then **Sync Model** and confirm.
8. In Mason & Arc OS > **Revit Connector** choose the project and inspect the resulting category and material quantities.

### Scope and engineering safety

- The add-in **does not edit the RVT model**. It uploads an extracted JSON takeoff, **not the RVT file itself**.
- Requires a project-bound bearer token. It expires after 90 days or when revoked in the admin UI. Token is stored encrypted with Windows DPAPI, scoped to the current Windows user.
- Only approved Revit categories are captured (walls, floors, roofs, ceilings, columns, framing, foundations, doors, windows, stairs, railings, generic models). Unsupported categories are ignored. No assumptions are made for missing geometry.
- Revit material quantities are **not** equal to purchased materials: mortar, paint tins, rebar, cutting waste, construction sequencing and all material recipes require engineer-approved rules. Values can be zero because geometry may be unavailable; the UI reports missing geometry separately.
- Uploaded takeoffs are **unverified snapshots** only. **No approved estimate/BOQ is changed**, and no fabricated supplier prices are applied.
- No file system paths or RVT binaries are sent, only model and element IDs/names, categories, level and computed quantities. If the model contains confidential project data, obtain client permission before Sync.
- Exported files and snapshots contain sensitive project information; restrict access accordingly.
- Any Revit add-in can have compatibility issues with other add-ins or custom families. Test on a copy of a real project before adopting. This workflow has CI compilation tests, but **not an automated test inside a real Revit 2027 process**.

### Uninstall

Close Revit and run `powershell -NoProfile -ExecutionPolicy Bypass -File .\Uninstall-MasonArc-Revit2027.ps1`. Revoke connector tokens in the OS. The uninstall keeps pairing credentials intentionally, to avoid touching unrelated user data.

### Developers

- Entry: `MasonArc.Revit2027.RibbonApp`
- SDK: Nice3point 2027.3.0 API reference-only NuGet libraries, .NET 10
- Build on Windows: `dotnet publish revit-connector/MasonArc.Revit2027/MasonArc.Revit2027.csproj -c Release -r win-x64 --self-contained false -o dist/bin`
- Generated user-level manifest: `%APPDATA%\Autodesk\Revit\Addins\2027\MasonArc2027.addin`
- Back end: `/api/cost-control/revit/tokens`, `/sync`, `/snapshots`
- Rate data and QS estimates remain separate by design. Automated element-to-BOQ mapping requires a separate approval workflow.
