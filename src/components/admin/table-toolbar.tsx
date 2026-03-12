import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Plus, Search } from "lucide-react";

type TableToolbarProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  onCreate?: () => void;
  onExport?: () => void;
  createLabel?: string;
};

export function TableToolbar({
  searchValue,
  onSearchChange,
  filters,
  onCreate,
  onExport,
  createLabel = "Create",
  searchPlaceholder = "Search...",
}: TableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex w-full flex-1 items-center gap-2">
        {onSearchChange ? (
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={searchValue ?? ""} onChange={(e) => onSearchChange(e.target.value)} placeholder={searchPlaceholder} className="pl-9" />
          </div>
        ) : null}
        {filters}
      </div>
      <div className="flex items-center gap-2">
        {onExport ? <Button variant="outline" onClick={onExport}><Download className="h-4 w-4" />Export</Button> : null}
        {onCreate ? <Button onClick={onCreate}><Plus className="h-4 w-4" />{createLabel}</Button> : null}
      </div>
    </div>
  );
}
