import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Sliders,
  Clock,
  Loader2,
} from "lucide-react";
import axios from "axios";
import API_BASE_URL from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Settings = () => {
  const { getCalAuthorizationUrl } = useAuth();
  const navigate = useNavigate();

  const [calConnected, setCalConnected] = useState(false);
  const [calReauthRequired, setCalReauthRequired] = useState(false);
  const [calEventTypeId, setCalEventTypeId] = useState("");
  const [calTimezone, setCalTimezone] = useState("UTC");
  const [loadingCal, setLoadingCal] = useState(true);
  const [savingCal, setSavingCal] = useState(false);
  const [connectingCal, setConnectingCal] = useState(false);
  const [calEventTypes, setCalEventTypes] = useState([]);
  const [loadingEventTypes, setLoadingEventTypes] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const fetchCalStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/connect/cal/status`);
      setCalConnected(res.data.connected);
      setCalReauthRequired(res.data.reauth_required || false);
      setCalEventTypeId(res.data.cal_event_type_id ? String(res.data.cal_event_type_id) : "");
      setCalTimezone(res.data.cal_timezone || "UTC");
      if (res.data.connected) {
        fetchCalEventTypes();
      }
    } catch (err) {
      console.error("Failed to fetch Cal.com status:", err);
      setError("Failed to fetch calendar status.");
    } finally {
      setLoadingCal(false);
    }
  };

  const fetchCalEventTypes = async () => {
    setLoadingEventTypes(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/connect/cal/event-types`);
      setCalEventTypes(res.data.event_types || []);
    } catch (err) {
      console.error("Failed to fetch Cal.com event types:", err);
    } finally {
      setLoadingEventTypes(false);
    }
  };

  useEffect(() => {
    fetchCalStatus();
  }, []);

  const startCalAuthorization = async () => {
    setConnectingCal(true);
    setError(null);
    try {
      const url = await getCalAuthorizationUrl();
      if (!url) throw new Error("Authorization URL was not returned.");
      window.location.assign(url);
    } catch (err) {
      console.error("Cal.com authorization initialization failed:", err);
      setError("Failed to initialize Cal.com authorization.");
      setConnectingCal(false);
    }
  };

  const saveCalSettings = async () => {
    if (!calEventTypeId) {
      setError("Please select an event type before saving.");
      return;
    }
    setSavingCal(true);
    setError(null);
    setSuccess(false);
    try {
      await axios.post(`${API_BASE_URL}/connect/cal/settings`, {
        event_type_id: calEventTypeId ? parseInt(calEventTypeId) : null,
        timezone: calTimezone,
      });
      setSuccess(true);
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      console.error("Failed to save Cal.com settings:", err);
      setError("Failed to save calendar settings.");
    } finally {
      setSavingCal(false);
    }
  };

  if (loadingCal) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your calendar and scheduling preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <Sliders className="h-4 w-4 text-muted-foreground mb-1" />
            <CardTitle className="text-sm">Availability Sync</CardTitle>
            <CardDescription className="text-xs">
              Coordinate slots based on your designated event details.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <Clock className="h-4 w-4 text-muted-foreground mb-1" />
            <CardTitle className="text-sm">Timezone Sync</CardTitle>
            <CardDescription className="text-xs">
              Automatically adjust discovery call times to your local timezone.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Calendar Settings</CardTitle>
              <CardDescription>
                Your event type and timezone control when prospects can book discovery calls.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {calReauthRequired ? (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <XCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 text-sm">Re-authorization Required</h4>
                  <p className="text-xs text-amber-700 mt-1">
                    Your Cal.com session has expired. Please reconnect to restore automatic meeting booking.
                  </p>
                </div>
              </div>
              <Button onClick={startCalAuthorization} disabled={connectingCal} className="w-full">
                {connectingCal ? (
                  <>
                    <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
                    Redirecting to Cal.com…
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Reconnect Cal.com Calendar
                  </>
                )}
              </Button>
            </div>
          ) : !calConnected ? (
            <div className="space-y-4">
              <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-destructive text-sm">Calendar Disconnected</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Connect your Cal.com calendar to enable automatic meeting scheduling.
                  </p>
                </div>
              </div>
              <Button onClick={startCalAuthorization} disabled={connectingCal} className="w-full">
                {connectingCal ? (
                  <>
                    <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
                    Redirecting to Cal.com…
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Connect Cal.com Calendar
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-medium text-emerald-800 text-sm">Calendar Connected</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Your Cal.com calendar is authorized and synced via OAuth 2.0.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Meeting Event Type</Label>
                  {loadingEventTypes ? (
                    <div className="flex items-center gap-2 h-10 px-3 rounded-md border text-sm text-muted-foreground">
                      <RefreshCcw className="h-4 w-4 animate-spin" />
                      Loading event types…
                    </div>
                  ) : calEventTypes.length > 0 ? (
                    <Select value={calEventTypeId} onValueChange={setCalEventTypeId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {calEventTypes.map((et) => (
                          <SelectItem key={et.id} value={String(et.id)}>
                            {et.title} ({et.duration} min)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type="number"
                      value={calEventTypeId}
                      onChange={(e) => setCalEventTypeId(e.target.value)}
                      placeholder="e.g. 5137238"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Booking Timezone</Label>
                  <Select value={calTimezone} onValueChange={setCalTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="US/Eastern">US/Eastern</SelectItem>
                      <SelectItem value="US/Central">US/Central</SelectItem>
                      <SelectItem value="US/Pacific">US/Pacific</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <p className="text-sm text-emerald-800">Calendar settings saved successfully.</p>
                </div>
              )}

              <Button onClick={saveCalSettings} disabled={savingCal} className="w-full sm:w-auto">
                {savingCal ? "Saving…" : "Save Settings"}
                {!savingCal && <ArrowRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
