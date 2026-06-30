import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Target, ArrowRight, AlertCircle, ShieldAlert, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CreateCampaign = () => {
  const { user } = useAuth();
  const [campaignName, setCampaignName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isLimitReached = user?.is_demo && user?.has_used_trial_quota;

  const handleNext = (e) => {
    e.preventDefault();
    if (isLimitReached) return;
    if (!campaignName.trim()) {
      setError("Please give your campaign a descriptive name.");
      return;
    }
    setError("");
    navigate("/create/setup", { state: { campaignName } });
  };

  if (isLimitReached) {
    return (
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-2">
              <ShieldAlert className="h-7 w-7 text-destructive" />
            </div>
            <CardTitle>Trial Limit Reached</CardTitle>
            <CardDescription>
              You have already utilized your 1-campaign entitlement for this trial period.
              Upgrade to professional access to continue mobilizing unlimited outreach fleets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <a href="mailto:sales@ai-priori.com?subject=FocalReach%20Professional%20Access%20Request">
                <Mail className="h-4 w-4 mr-2" />
                Contact Sales for Upgrade
              </a>
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <Link to="/">Return to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <div className="w-12 h-12 rounded-lg bg-black/10 flex items-center justify-center mb-2">
            <Target className="h-6 w-6 text-black" />
          </div>
          <CardTitle className="text-2xl">Create Campaign</CardTitle>
          <CardDescription>
            Define the identifying context for your new outbound mission. This will serve as your core campaign label.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNext} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="campaignName">Campaign Name</Label>
              <Input
                id="campaignName"
                value={campaignName}
                onChange={(e) => {
                  setCampaignName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g., Q4 Enterprise Outreach"
                className={error ? "border-destructive" : ""}
              />
              {error && (
                <p className="flex items-center gap-1.5 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full bg-black text-white hover:bg-zinc-900">
              Continue
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button variant="link" asChild className="text-muted-foreground">
              <Link to="/">Cancel and return</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCampaign;
