import { DealershipSettingsForm } from "@/components/admin/dealership-settings-form";
import { getPublicDealershipSettings } from "@/lib/dealership-settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getPublicDealershipSettings();

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">PUBLIC DEALERSHIP PROFILE</span>
          <h1>Basic Settings</h1>
          <p>Manage the real contact details customers see across the Ritewheel website.</p>
        </div>
      </div>

      <DealershipSettingsForm
        initialSettings={{
          ...settings,
          whatsappNumber: settings.whatsappNumber ? "+" + settings.whatsappNumber : "",
        }}
      />

      <div className="admin-info-note">
        <strong>Keep public details accurate</strong>
        <p>Only details you save here are shown as contact information. Do not add placeholder addresses, unmonitored phone numbers or email accounts. Payment credentials, gateway secrets and staff accounts are not managed in Release 1 settings.</p>
      </div>
    </>
  );
}
