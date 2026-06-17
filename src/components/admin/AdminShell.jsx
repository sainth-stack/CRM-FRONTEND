import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const AdminPageLayout = ({ title, subtitle, user, children }) => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <Badge variant="secondary" className="mb-2">Administration</Badge>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
      </div>
      {user && (
        <p className="text-sm text-muted-foreground">{user.email}</p>
      )}
    </div>
    {children}
  </div>
);

export const AdminPanel = ({ title, description, action, children }) => (
  <Card>
    <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </div>
      {action}
    </CardHeader>
    <CardContent className="p-0">{children}</CardContent>
  </Card>
);

export const AdminBtn = ({ children, variant = "default", size = "default", className = "", ...props }) => {
  const mappedVariant = variant === "danger" ? "destructive" : variant;
  return (
    <Button variant={mappedVariant} size={size} className={className} {...props}>{children}</Button>
  );
};

// A required field shows a red "*" after its label so admins can see at a glance
// which inputs are mandatory. `required` is also forwarded to the native control.
const RequiredMark = () => <span className="text-red-500 ml-0.5">*</span>;

export const AdminInput = ({ label, id, required, className = "", ...props }) => (
  <div className="space-y-2">
    {label && <Label htmlFor={id}>{label}{required && <RequiredMark />}</Label>}
    <Input id={id} required={required} className={className} {...props} />
  </div>
);

export const AdminSelect = ({ label, required, children, className = "", ...props }) => (
  <div className="space-y-2">
    {label && <Label>{label}{required && <RequiredMark />}</Label>}
    <select
      required={required}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </select>
  </div>
);

export const AdminBadge = ({ children, tone = "default" }) => {
  const variant = tone === "success" ? "default" : tone === "danger" ? "destructive" : tone === "warning" ? "secondary" : "outline";
  return <Badge variant={variant}>{children}</Badge>;
};

export const AdminTable = ({ columns, rows, emptyMessage = "No records found." }) => (
  <Table>
    <TableHeader>
      <TableRow>
        {columns.map((col) => (
          <TableHead key={col.key} className={col.align === "right" ? "text-right" : ""}>{col.label}</TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.length === 0 ? (
        <TableRow>
          <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
            {emptyMessage}
          </TableCell>
        </TableRow>
      ) : (
        rows.map((row) => (
          <TableRow key={row.key}>
            {columns.map((col) => (
              <TableCell key={col.key} className={col.align === "right" ? "text-right" : ""}>
                {col.render(row.data)}
              </TableCell>
            ))}
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
);

export const AdminPagination = ({ page, totalPages, totalRecords, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t">
      <span className="text-sm text-muted-foreground">{totalRecords} records</span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Prev</Button>
        <span className="text-sm">{page} / {totalPages}</span>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</Button>
      </div>
    </div>
  );
};

export const AdminModal = ({ open, onClose, title, children, footer }) => (
  <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">{children}</div>
      {footer && <DialogFooter>{footer}</DialogFooter>}
    </DialogContent>
  </Dialog>
);

export const AdminLoading = () => (
  <div className="flex items-center justify-center py-16 text-muted-foreground">
    <Loader2 className="animate-spin mr-2 h-5 w-5" />
    Loading...
  </div>
);

export const AdminSearchBar = ({ value, onChange, placeholder = "Search..." }) => (
  <div className="px-6 py-4 border-b">
    <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="max-w-sm" />
  </div>
);
