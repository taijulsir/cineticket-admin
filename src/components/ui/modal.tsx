import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const contentVariants = cva("", {
  variants: {
    size: {
      sm: "max-w-md",
      md: "max-w-xl",
      lg: "max-w-3xl",
      xl: "max-w-[95vw]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type ModalProps = VariantProps<typeof contentVariants> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  bodyClassName?: string;
};

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size,
  bodyClassName,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-h-[92vh] overflow-hidden", contentVariants({ size }))}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className={cn("space-y-3 overflow-y-auto pr-1", bodyClassName)}>{children}</div>
        {footer ? <div className="flex items-center justify-end gap-2">{footer}</div> : null}
      </DialogContent>
    </Dialog>
  );
}
