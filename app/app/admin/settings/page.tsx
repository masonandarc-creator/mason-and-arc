"use client";

import { FormEvent, useEffect, useState } from "react";
import PermissionGuard from "@/lib/core/PermissionGuard";
import {
  getStudioSettings,
  updateStudioSettings,
  resetStudioSettings,
  type StudioSettings,
} from "@/lib/core/settingsStore";

type Department = {
  id: string;
  name: string;
};

type Position = {
  id: string;
  name: string;
  departmentId: string;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<StudioSettings | null>(null);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

  const [newDepartment, setNewDepartment] = useState("");
  const [newPosition, setNewPosition] = useState("");

  const [loadingOrganization, setLoadingOrganization] = useState(false);
  const [organizationError, setOrganizationError] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [gmail, setGmail] = useState<{ authorized: boolean; email: string | null } | null>(null);
  const [gmailError, setGmailError] = useState("");
  const [calendar, setCalendar] = useState<{ authorized: boolean; email: string | null } | null>(null);

  useEffect(() => {
    setSettings(getStudioSettings());
    const googleMailError = new URLSearchParams(window.location.search).get(
      "google_mail_error"
    );
    if (googleMailError === "missing_send_scope") {
      setGmailError(
        "Gmail is not connected yet. Choose Reconnect Gmail, then tick the permission that allows Mason & Arc to send email on your behalf before continuing."
      );
    } else if (googleMailError) {
      setGmailError(
        "Gmail connection was not completed. Choose Connect Gmail and approve every requested permission."
      );
    }
    loadOrganization();
    fetch("/api/integrations/google-mail/status", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 403 || response.status === 401) return;
        if (!response.ok) throw new Error("Could not check Gmail authorization. Please refresh and try again.");
        setGmail(await response.json());
      })
      .catch(() => setGmailError("Could not check Gmail authorization. Please refresh and try again."));
    fetch("/api/integrations/calendar/status", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 403 || response.status === 401) return;
        if (!response.ok) throw new Error("Could not check Calendar authorization.");
        setCalendar(await response.json());
      })
      .catch(() => undefined);
  }, []);

  async function loadOrganization() {
    setLoadingOrganization(true);
    setOrganizationError("");

    try {
      const departmentsResponse = await fetch("/api/admin/departments", {
        cache: "no-store",
      });

      if (!departmentsResponse.ok) {
        throw new Error("Failed to load departments.");
      }

      const departmentsData = await departmentsResponse.json();
      const departmentList: Department[] = Array.isArray(departmentsData)
        ? departmentsData
        : departmentsData.departments || [];

      setDepartments(departmentList);

      if (departmentList.length > 0) {
        setSelectedDepartmentId((current) => current || departmentList[0].id);
      }

      const positionsResponse = await fetch("/api/admin/positions", {
        cache: "no-store",
      });

      if (!positionsResponse.ok) {
        throw new Error("Failed to load positions.");
      }

      const positionsData = await positionsResponse.json();
      const positionList: Position[] = Array.isArray(positionsData)
        ? positionsData
        : positionsData.positions || [];

      setPositions(positionList);
    } catch (error) {
      setOrganizationError(
        error instanceof Error
          ? error.message
          : "Could not load organization data."
      );
    } finally {
      setLoadingOrganization(false);
    }
  }

  function updateSetting<K extends keyof StudioSettings>(
    key: K,
    value: StudioSettings[K]
  ) {
    setSettings((current) => {
      if (!current) return current;

      const next = updateStudioSettings({
        [key]: value,
      } as Partial<StudioSettings>);

      return next;
    });

    setSaved(false);
  }

  function handleSave(event: FormEvent) {
    event.preventDefault();

    if (!settings) return;

    setSaving(true);
    updateStudioSettings(settings);

    window.setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 300);
  }

  function handleReset() {
    const confirmed = window.confirm(
      "Reset all studio settings to their default values?"
    );

    if (!confirmed) return;

    setSettings(resetStudioSettings());
    setSaved(false);
  }

  async function addDepartment(event: FormEvent) {
    event.preventDefault();

    const name = newDepartment.trim();

    if (!name) return;

    setOrganizationError("");

    try {
      const response = await fetch("/api/admin/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not create department.");
      }

      setNewDepartment("");
      await loadOrganization();
    } catch (error) {
      setOrganizationError(
        error instanceof Error
          ? error.message
          : "Could not create department."
      );
    }
  }

  async function deleteDepartment(id: string) {
    const department = departments.find((item) => item.id === id);

    if (!department) return;

    const confirmed = window.confirm(
      `Delete "${department.name}"? This may fail if the department is still being used.`
    );

    if (!confirmed) return;

    setOrganizationError("");

    try {
      const response = await fetch(
        `/api/admin/departments?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not delete department.");
      }

      if (selectedDepartmentId === id) {
        setSelectedDepartmentId("");
      }

      await loadOrganization();
    } catch (error) {
      setOrganizationError(
        error instanceof Error
          ? error.message
          : "Could not delete department."
      );
    }
  }

  async function addPosition(event: FormEvent) {
    event.preventDefault();

    const name = newPosition.trim();

    if (!name || !selectedDepartmentId) return;

    setOrganizationError("");

    try {
      const response = await fetch("/api/admin/positions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          departmentId: selectedDepartmentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not create position.");
      }

      setNewPosition("");
      await loadOrganization();
    } catch (error) {
      setOrganizationError(
        error instanceof Error
          ? error.message
          : "Could not create position."
      );
    }
  }

  async function deletePosition(id: string) {
    const position = positions.find((item) => item.id === id);

    if (!position) return;

    const confirmed = window.confirm(`Delete "${position.name}"?`);

    if (!confirmed) return;

    setOrganizationError("");

    try {
      const response = await fetch(
        `/api/admin/positions?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not delete position.");
      }

      await loadOrganization();
    } catch (error) {
      setOrganizationError(
        error instanceof Error
          ? error.message
          : "Could not delete position."
      );
    }
  }

  if (!settings) {
    return (
      <PermissionGuard permission="team.manage">
        <main className="min-h-screen p-6">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl border border-black/10 bg-white p-8">
              Loading settings...
            </div>
          </div>
        </main>
      </PermissionGuard>
    );
  }

  const selectedDepartment =
    departments.find((item) => item.id === selectedDepartmentId) || null;

  const selectedPositions = positions.filter(
    (position) => position.departmentId === selectedDepartmentId
  );

  return (
    <PermissionGuard permission="team.manage">
      <main className="min-h-screen bg-white p-5 text-black sm:p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header */}
          <section>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-black/45">
                  Administration
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                  Settings
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">
                  Manage your studio preferences and organization structure.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href="/api/integrations/google-mail/connect"
                  className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium transition hover:bg-black/[0.03]"
                >
                  {gmail?.authorized ? "Reconnect Gmail" : "Connect Gmail"}
                </a>
                <a
                  href="/api/integrations/calendar/connect"
                  className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium transition hover:bg-black/[0.03]"
                >
                  {calendar?.authorized ? "Reconnect Calendar" : "Connect Calendar"}
                </a>
                <a
                  href="/app/admin/whatsapp"
                  className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium transition hover:bg-black/[0.03]"
                >
                  Manual WhatsApp
                </a>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium transition hover:bg-black/[0.03]"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  form="studio-settings-form"
                  disabled={saving}
                  className="rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black/85 disabled:opacity-50"
                >
                  {saving ? "Saving..." : saved ? "Saved" : "Save Changes"}
                </button>
              </div>
            </div>
            {gmail && (
              <p className="mt-4 break-words text-sm" role="status">
                {gmail.authorized
                  ? `Gmail authorization saved for ${gmail.email}. Reconnect if Google access expires.`
                  : "Gmail is not connected yet. Choose Connect Gmail to authorize the studio account."}
              </p>
            )}
            {gmailError && <p className="mt-4 text-sm text-red-600" role="alert">{gmailError}</p>}
            {!gmail?.authorized && (
              <p className="mt-2 text-sm leading-6 text-black/60">
                When Google opens, select the studio Gmail account and tick the
                permission to send email on your behalf. This permission is
                required for password-reset and inquiry emails.
              </p>
            )}
            {calendar && <p className="mt-2 break-words text-sm" role="status">{calendar.authorized ? `Google Calendar is connected for ${calendar.email}.` : "Google Calendar is ready to connect."}</p>}
            <p className="mt-3 text-sm leading-6 text-black/60">WhatsApp: free manual Click to Chat is available from this page. Automated API messaging remains disabled and no paid messaging service has been activated.</p>
          </section>

          {/* Studio Settings */}
          <form
            id="studio-settings-form"
            onSubmit={handleSave}
            className="rounded-2xl border border-black/10 bg-white"
          >
            <div className="border-b border-black/10 p-6">
              <h2 className="text-lg font-semibold">Studio Settings</h2>
              <p className="mt-1 text-sm text-black/50">
                General settings used throughout Mason & Arc.
              </p>
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-2">
              {/* Studio Name */}
              <label className="block">
                <span className="text-sm font-medium">Studio Name</span>

                <input
                  value={settings.studioName}
                  onChange={(event) =>
                    updateSetting("studioName", event.target.value)
                  }
                  maxLength={100}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black/30"
                />
              </label>

              {/* Currency */}
              <label className="block">
                <span className="text-sm font-medium">Default Currency</span>

                <select
                  value={settings.defaultCurrency}
                  onChange={(event) =>
                    updateSetting(
                      "defaultCurrency",
                      event.target.value as StudioSettings["defaultCurrency"]
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black/30"
                >
                  <option value="EGP">EGP — Egyptian Pound</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                </select>
              </label>

              {/* Week Starts */}
              <label className="block">
                <span className="text-sm font-medium">Week Starts On</span>

                <select
                  value={settings.weekStartsOn}
                  onChange={(event) =>
                    updateSetting(
                      "weekStartsOn",
                      event.target.value as StudioSettings["weekStartsOn"]
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black/30"
                >
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                  <option value="Monday">Monday</option>
                </select>
              </label>

              {/* Working Hours */}
              <label className="block">
                <span className="text-sm font-medium">Working Hours</span>

                <input
                  value={settings.workingHours}
                  onChange={(event) =>
                    updateSetting("workingHours", event.target.value)
                  }
                  maxLength={50}
                  placeholder="09:00–18:00"
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black/30"
                />
              </label>

              {/* Timezone */}
              <label className="block md:col-span-2">
                <span className="text-sm font-medium">Timezone</span>

                <input
                  value={settings.timezone}
                  onChange={(event) =>
                    updateSetting("timezone", event.target.value)
                  }
                  maxLength={80}
                  placeholder="Africa/Cairo"
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black/30"
                />
              </label>
            </div>

            {/* Notifications */}
            <div className="border-t border-black/10 p-6">
              <h3 className="font-semibold">Notifications & Automation</h3>

              <div className="mt-4 space-y-3">
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-black/10 p-4">
                  <div>
                    <p className="text-sm font-medium">Email Alerts</p>
                    <p className="mt-1 text-xs text-black/50">
                      Receive studio notifications by email.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={settings.emailAlerts}
                    onChange={(event) =>
                      updateSetting("emailAlerts", event.target.checked)
                    }
                    className="h-5 w-5"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-black/10 p-4">
                  <div>
                    <p className="text-sm font-medium">Browser Alerts</p>
                    <p className="mt-1 text-xs text-black/50">
                      Show notifications inside the browser.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={settings.browserAlerts}
                    onChange={(event) =>
                      updateSetting("browserAlerts", event.target.checked)
                    }
                    className="h-5 w-5"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-black/10 p-4">
                  <div>
                    <p className="text-sm font-medium">Auto Refresh</p>
                    <p className="mt-1 text-xs text-black/50">
                      Automatically refresh live office data.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={settings.autoRefresh}
                    onChange={(event) =>
                      updateSetting("autoRefresh", event.target.checked)
                    }
                    className="h-5 w-5"
                  />
                </label>
              </div>
            </div>
          </form>

          {/* Organization */}
          <section className="rounded-2xl border border-black/10 bg-white">
            <div className="flex flex-col gap-4 border-b border-black/10 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Organization</h2>
                <p className="mt-1 text-sm text-black/50">
                  Manage Departments and their Positions.
                </p>
              </div>

              <button
                type="button"
                onClick={loadOrganization}
                disabled={loadingOrganization}
                className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium transition hover:bg-black/[0.03] disabled:opacity-50"
              >
                {loadingOrganization ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {organizationError && (
              <div className="mx-6 mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {organizationError}
              </div>
            )}

            <div className="grid gap-6 p-6 lg:grid-cols-[0.9fr_1.1fr]">
              {/* Departments */}
              <div className="rounded-2xl border border-black/10">
                <div className="border-b border-black/10 p-5">
                  <h3 className="font-semibold">Departments</h3>
                  <p className="mt-1 text-xs text-black/50">
                    Example: Architecture, Interior Design, Engineering,
                    Operations.
                  </p>
                </div>

                <div className="p-5">
                  <form
                    onSubmit={addDepartment}
                    className="flex gap-2"
                  >
                    <input
                      value={newDepartment}
                      onChange={(event) =>
                        setNewDepartment(event.target.value)
                      }
                      maxLength={100}
                      placeholder="New department"
                      className="min-w-0 flex-1 rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-black/30"
                    />

                    <button
                      type="submit"
                      disabled={!newDepartment.trim()}
                      className="rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
                    >
                      Add
                    </button>
                  </form>

                  <div className="mt-4 space-y-2">
                    {departments.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-black/10 p-5 text-center text-sm text-black/45">
                        No departments yet.
                      </div>
                    ) : (
                      departments.map((department) => {
                        const active =
                          department.id === selectedDepartmentId;

                        return (
                          <div
                            key={department.id}
                            className={`flex items-center gap-2 rounded-xl border p-2 transition ${
                              active
                                ? "border-black/20 bg-black/[0.04]"
                                : "border-black/10"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedDepartmentId(department.id)
                              }
                              className="min-w-0 flex-1 rounded-lg px-3 py-2 text-left text-sm font-medium"
                            >
                              <span className="block truncate">
                                {department.name}
                              </span>

                              <span className="mt-0.5 block text-xs font-normal text-black/40">
                                {
                                  positions.filter(
                                    (position) =>
                                      position.departmentId === department.id
                                  ).length
                                }{" "}
                                position
                                {positions.filter(
                                  (position) =>
                                    position.departmentId === department.id
                                ).length !== 1
                                  ? "s"
                                  : ""}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteDepartment(department.id)
                              }
                              className="rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Positions */}
              <div className="rounded-2xl border border-black/10">
                <div className="border-b border-black/10 p-5">
                  <h3 className="font-semibold">
                    Positions
                    {selectedDepartment ? (
                      <span className="ml-2 font-normal text-black/45">
                        / {selectedDepartment.name}
                      </span>
                    ) : null}
                  </h3>

                  <p className="mt-1 text-xs text-black/50">
                    Positions belong to a specific department.
                  </p>
                </div>

                <div className="p-5">
                  {!selectedDepartment ? (
                    <div className="rounded-xl border border-dashed border-black/10 p-8 text-center text-sm text-black/45">
                      Select a department to manage its positions.
                    </div>
                  ) : (
                    <>
                      <form
                        onSubmit={addPosition}
                        className="flex gap-2"
                      >
                        <input
                          value={newPosition}
                          onChange={(event) =>
                            setNewPosition(event.target.value)
                          }
                          maxLength={100}
                          placeholder={`New position in ${selectedDepartment.name}`}
                          className="min-w-0 flex-1 rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-black/30"
                        />

                        <button
                          type="submit"
                          disabled={!newPosition.trim()}
                          className="rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
                        >
                          Add
                        </button>
                      </form>

                      <div className="mt-4 space-y-2">
                        {selectedPositions.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-black/10 p-5 text-center text-sm text-black/45">
                            No positions in this department yet.
                          </div>
                        ) : (
                          selectedPositions.map((position) => (
                            <div
                              key={position.id}
                              className="flex items-center justify-between gap-3 rounded-xl border border-black/10 px-4 py-3"
                            >
                              <span className="text-sm font-medium">
                                {position.name}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  deletePosition(position.id)
                                }
                                className="rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </PermissionGuard>
  );
}
