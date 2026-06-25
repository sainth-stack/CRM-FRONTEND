import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, Trash2, Copy, Check, FileText, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { adminApi } from "../../lib/api/admin";
import {
  AdminPageLayout,
  AdminPanel,
  AdminBtn,
  AdminTable,
  AdminLoading,
} from "../../components/admin/AdminShell";

function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function CopyLinkBtn({ url }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <AdminBtn variant="ghost" onClick={handle} title="Copy email hyperlink">
      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
    </AdminBtn>
  );
}

function UploadZone({ onFile, uploading }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const pick = (files) => {
    const pdf = Array.from(files).find((f) => f.name.toLowerCase().endsWith(".pdf"));
    if (pdf) onFile(pdf);
  };

  return (
    <div
      onClick={() => !uploading && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files); }}
      className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors select-none
        ${dragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"}
        ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {uploading ? (
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      ) : (
        <Upload size={24} className="text-muted-foreground" />
      )}
      <p className="text-sm font-medium text-muted-foreground">
        {uploading ? "Uploading…" : "Drop a PDF here or click to browse"}
      </p>
      <p className="text-xs text-muted-foreground/60">PDF only · max 20 MB</p>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => pick(e.target.files)}
      />
    </div>
  );
}

function AssetSection({ title, description, assetType, uploadFn, token, showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { items: rows } = await adminApi.listAssets(token, assetType);
      setItems(rows);
    } catch (err) {
      showToast({ tone: "error", title: `Failed to load ${title.toLowerCase()}`, description: adminApi.extractMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [token, assetType, title, showToast]);

  useEffect(() => { load(); }, [load]);

  const handleFile = async (file) => {
    setUploading(true);
    try {
      await uploadFn(token, file);
      showToast({ tone: "success", title: "Uploaded", description: `${file.name} is now available to your organization.` });
      load();
    } catch (err) {
      showToast({ tone: "error", title: "Upload failed", description: adminApi.extractMessage(err) });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (asset) => {
    if (!window.confirm(`Delete "${asset.filename}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteAsset(token, asset.id);
      showToast({ tone: "success", title: "Deleted" });
      load();
    } catch (err) {
      showToast({ tone: "error", title: "Delete failed", description: adminApi.extractMessage(err) });
    }
  };

  const columns = [
    {
      key: "name",
      label: "File",
      render: (r) => (
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-muted-foreground shrink-0" />
          <span className="font-medium text-slate-800 truncate max-w-xs">{r.filename}</span>
        </div>
      ),
    },
    { key: "size", label: "Size", render: (r) => formatBytes(r.file_size) },
    {
      key: "date",
      label: "Uploaded",
      render: (r) =>
        r.created_at ? new Date(r.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—",
    },
    { key: "by", label: "By", render: (r) => r.uploaded_by || "—" },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <CopyLinkBtn url={adminApi.assetDownloadUrl(r.id)} />
          <AdminBtn variant="danger" onClick={() => handleDelete(r)} title="Delete">
            <Trash2 size={14} />
          </AdminBtn>
        </div>
      ),
    },
  ];

  return (
    <AdminPanel title={title} description={description}>
      <div className="px-6 py-4 border-b">
        <UploadZone onFile={handleFile} uploading={uploading} />
      </div>
      {loading ? (
        <AdminLoading />
      ) : (
        <AdminTable
          columns={columns}
          rows={items.map((a) => ({ key: a.id, data: a }))}
          emptyMessage={`No ${title.toLowerCase()} uploaded yet.`}
        />
      )}
    </AdminPanel>
  );
}

export default function FileUploads() {
  const { token, user } = useAuth();
  const { showToast } = useToast();

  return (
    <AdminPageLayout
      title="File Uploads"
      subtitle="Upload brochures and use-case documents for your organization. Copy the link to embed in outreach emails."
      user={user}
    >
      <AssetSection
        title="Brochures"
        description="Company or product brochures. The copy link is a permanent hyperlink you can insert into email templates."
        assetType="brochure"
        uploadFn={adminApi.uploadBrochure}
        token={token}
        showToast={showToast}
      />
      <AssetSection
        title="Use Cases"
        description="Customer success stories and use-case documents for your outreach campaigns."
        assetType="usecase"
        uploadFn={adminApi.uploadUsecase}
        token={token}
        showToast={showToast}
      />
    </AdminPageLayout>
  );
}
